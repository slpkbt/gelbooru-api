'use strict';

const ENDPOINT = 'https://gelbooru.com/index.php';
const MAX_BODY = 8 * 1024 * 1024;
const ORDERS = new Set(['date', 'count', 'name']);

class GelbooruError extends Error {
  constructor(message, code, { status, retryAfter } = {}) {
    super(message);
    this.name = 'GelbooruError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function integer(value, label, min, max = Number.MAX_SAFE_INTEGER) {
  if (typeof value === 'string' && /^\d+$/.test(value)) value = Number(value);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new RangeError(label + ' must be an integer from ' + min + ' to ' + max);
  }
  return value;
}

function tags(value) {
  if (!Array.isArray(value) && typeof value !== 'string') throw new TypeError('tags must be a string or an array of strings');
  if (Array.isArray(value) && value.some(tag => typeof tag !== 'string')) throw new TypeError('tags must contain only strings');
  return (Array.isArray(value) ? value.join(' ') : value).replace(/[,\s]+/g, ' ').trim();
}

function optionalText(value, label) {
  if (value == null || value === '') return undefined;
  if (typeof value !== 'string') throw new TypeError(label + ' must be a string');
  return value;
}

function listFrom(data, kind) {
  if (data === false || data === null) return [];
  if (typeof data !== 'object') throw new GelbooruError('Unexpected DAPI response shape', 'INVALID_RESPONSE');
  if (data.success === false || data.success === 'false') {
    const msg = data.message ?? data.reason;
    // Upstream has used both success:false and count:0 for empty searches.
    if (typeof msg === 'string' && /^no (?:posts?|tags?|users?)(?: found)?[.!]?$/i.test(msg.trim())) return [];
    if (typeof msg === 'string' && /(?:rate limit|too many requests)/i.test(msg)) {
      throw new GelbooruError('Gelbooru rate limit reached', 'RATE_LIMIT');
    }
    if (typeof msg === 'string' && /(?:auth|api[ _-]?key|log[ -]?in|user[ _-]?id)/i.test(msg)) {
      throw new GelbooruError('Gelbooru requires valid API credentials', 'AUTH');
    }
    throw new GelbooruError('Gelbooru rejected the API request', 'UPSTREAM');
  }
  const value = Array.isArray(data) ? data : data[kind];
  if (value == null && (data['@attributes']?.count === 0 || data['@attributes']?.count === '0')) return [];
  if (value == null && Object.keys(data).length === 0) return [];
  const rows = Array.isArray(value) ? value : value && typeof value === 'object' ? [value] : undefined;
  if (!rows || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new GelbooruError('Unexpected DAPI response shape', 'INVALID_RESPONSE');
  }
  return rows;
}

async function readBounded(response) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        void reader.cancel().catch(() => {});
        throw new GelbooruError('Gelbooru response exceeded the size limit', 'INVALID_RESPONSE');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, size).toString('utf8');
}

class Gelbooru {
  #credentials;
  #fetch;
  #timeoutMs;

  constructor(options = {}, legacyLimit = 10) {
    if (typeof options === 'string') options = { tags: options, limit: legacyLimit };
    else if (options == null) options = { limit: legacyLimit };
    else if (typeof options !== 'object' || Array.isArray(options)) throw new TypeError('options must be an object or a legacy tag string');
    this.tags = tags(options.tags ?? '');
    this.limit = integer(options.limit ?? legacyLimit, 'limit', 1, 100);
    this.lastPosts = [];
    this.#timeoutMs = integer(options.timeoutMs ?? 15000, 'timeoutMs', 1, 120000);
    this.#fetch = options.fetch ?? globalThis.fetch;
    if (typeof this.#fetch !== 'function') throw new TypeError('fetch must be a function');
    const { apiKey, userId } = options;
    if ((apiKey == null) !== (userId == null)) throw new TypeError('Provide apiKey and userId together');
    if (apiKey != null) {
      if (typeof apiKey !== 'string' || !apiKey.trim()) throw new TypeError('apiKey must be a non-empty string');
      this.#credentials = { api_key: apiKey.trim(), user_id: integer(userId, 'userId', 1) };
    }
  }

  async #request(kind, params, signal) {
    const url = new URL(ENDPOINT);
    url.search = new URLSearchParams({ page: 'dapi', s: kind, q: 'index', json: '1' });
    for (const [key, value] of Object.entries({ ...params, ...this.#credentials })) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    const deadline = AbortSignal.timeout(this.#timeoutMs);
    try {
      const response = await this.#fetch(url, {
        headers: { accept: 'application/json' },
        redirect: 'manual',
        signal: signal ? AbortSignal.any([signal, deadline]) : deadline
      });
      if (!response.ok) {
        void response.body?.cancel().catch(() => {});
        const status = response.status;
        if (status === 429) {
          throw new GelbooruError('Gelbooru rate limit reached', 'RATE_LIMIT', {
            status, retryAfter: response.headers.get('retry-after') ?? undefined
          });
        }
        if (status === 401 || status === 403) throw new GelbooruError('Gelbooru denied API access', 'AUTH', { status });
        throw new GelbooruError('Gelbooru returned HTTP ' + status, 'HTTP', { status });
      }
      if (response.status === 204) return { data: [], rows: [] };
      const raw = await readBounded(response);
      let data;
      try { data = JSON.parse(raw); }
      catch { throw new GelbooruError('Gelbooru did not return valid JSON', 'INVALID_RESPONSE', { status: response.status }); }
      return { data, rows: listFrom(data, kind) };
    } catch (error) {
      if (error instanceof GelbooruError) throw error;
      if (signal?.aborted) throw new GelbooruError('Gelbooru request cancelled', 'ABORTED');
      if (deadline.aborted) throw new GelbooruError('Gelbooru request timed out', 'TIMEOUT');
      // A lower-level error or its cause can include the URL with credentials. Do not forward it.
      throw new GelbooruError('Could not reach Gelbooru', 'NETWORK');
    }
  }

  async searchPosts({ tags: query = this.tags, limit = this.limit, page = 0, signal } = {}) {
    page = integer(page, 'page', 0);
    limit = integer(limit, 'limit', 1, 100);
    const { data, rows } = await this.#request('post', { tags: tags(query), limit, pid: page }, signal);
    const meta = data?.['@attributes'];
    const count = meta?.count == null ? NaN : Number(meta.count);
    return { posts: rows, page, limit, total: Number.isSafeInteger(count) && count >= 0 ? count : null };
  }

  async getPosts(query = this.tags, limit = this.limit, pid = 0) {
    const { data, rows } = await this.#request('post', {
      tags: tags(query), limit: integer(limit, 'limit', 1, 100), pid: integer(pid, 'page', 0)
    });
    this.lastPosts = Array.isArray(data) ? { post: rows } : data ?? { post: [] };
    return rows.length ? rows : { success: false, message: 'No posts found' };
  }

  async getRandomPost(query = this.tags) {
    const cleaned = tags(query).split(' ').filter(tag => !/^-?sort:/i.test(tag)).join(' ');
    const rows = await this.getPosts('sort:random' + (cleaned ? ' ' + cleaned : ''), 1, 0);
    return Array.isArray(rows) ? rows[0] : rows;
  }

  async getTags(limit = 10, orderBy = 'count', afterId = 0) {
    if (!ORDERS.has(orderBy)) throw new RangeError('orderBy must be count, date, or name');
    const { rows } = await this.#request('tag', {
      limit: integer(limit, 'limit', 1, 100), orderby: orderBy, after_id: integer(afterId, 'afterId', 0)
    });
    return rows.length ? rows : { success: false, message: 'No tags found' };
  }

  async searchTags(query = '') {
    const { rows } = await this.#request('tag', { names: tags(query) });
    return rows.length ? rows : { success: false, message: 'No tags found' };
  }

  async searchUser(name, limit = this.limit) {
    const { rows } = await this.#request('user', {
      name: optionalText(name, 'name'), limit: integer(limit, 'limit', 1, 100)
    });
    return rows.length ? rows : { success: false, message: 'No user found' };
  }

  async getPostById(id) {
    const { rows } = await this.#request('post', { id: integer(id, 'id', 1), limit: 1 });
    return rows.length ? rows : { success: false, message: 'No post found' };
  }

  async getTagById(id) {
    const { rows } = await this.#request('tag', { id: integer(id, 'id', 1), limit: 1 });
    return rows.length ? rows : { success: false, message: 'No tag found' };
  }
}

module.exports = Gelbooru;
module.exports.Gelbooru = Gelbooru;
module.exports.GelbooruError = GelbooruError;
