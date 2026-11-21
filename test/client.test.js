'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { Gelbooru, GelbooruError } = require('gelbooru-api');
const post = { id: 42, tags: 'landscape night_sky', rating: 'general', preview_url: 'https://example.invalid/preview.jpg' };
const fixture = { '@attributes': { count: 36, offset: 0, limit: 10 }, post: [post] };
const respond = (body, status = 200, headers) => new Response(JSON.stringify(body), { status, headers });
const client = body => new Gelbooru({ fetch: async () => respond(body) });

test('named and default exports work via both package entry points', async () => {
  assert.equal(require('gelbooru-api'), Gelbooru);
  const esm = await import('gelbooru-api');
  assert.equal(esm.default, Gelbooru);
  assert.equal(esm.Gelbooru, Gelbooru);
  assert.equal(esm.GelbooruError, GelbooruError);
});

test('legacy constructor and prior successful list shapes stay compatible', async () => {
  const legacy = new Gelbooru('night_sky, landscape', 6);
  assert.equal(legacy.tags, 'night_sky landscape');
  assert.equal(legacy.limit, 6);
  const instance = client(fixture);
  assert.deepEqual(await instance.getPosts(), [post]);
  assert.deepEqual(instance.lastPosts, fixture);
  assert.deepEqual(await instance.getPostById(42), [post]);
});

test('searchPosts returns posts, zero-based page and total', async () => {
  const instance = client(fixture);
  assert.deepEqual(await instance.searchPosts({ page: 2, limit: 5 }), { posts: [post], page: 2, limit: 5, total: 36 });
  assert.deepEqual(instance.lastPosts, []);
  assert.equal((await client([post]).searchPosts()).total, null);
});

test('sends escaped query and credential pairs to only the documented origin', async () => {
  const instance = new Gelbooru({ apiKey: 'demo&user_id=99', userId: '12', fetch: async (url, options) => {
    assert.equal(url.origin, 'https://gelbooru.com');
    assert.equal(url.pathname, '/index.php');
    assert.deepEqual(Object.fromEntries(url.searchParams), {
      page: 'dapi', s: 'post', q: 'index', json: '1',
      tags: 'night_sky x&limit=100 #tag rating:general', limit: '4', pid: '2',
      api_key: 'demo&user_id=99', user_id: '12'
    });
    assert.equal(options.redirect, 'manual');
    return respond(fixture);
  } });
  await instance.searchPosts({ tags: ['night_sky, x&limit=100', '#tag', 'rating:general'], limit: 4, page: 2 });
  assert(!JSON.stringify(instance).includes('demo'));
});

test('finds tags and users using documented parameter names', async () => {
  const requests = [];
  const instance = new Gelbooru({ fetch: async url => {
    const fields = Object.fromEntries(url.searchParams);
    requests.push(fields);
    return fields.s === 'tag' ? respond({ tag: [{ id: 2, name: 'landscape' }] }) : respond({ user: { id: 12, username: 'Demo' } });
  } });
  assert.deepEqual(await instance.getTags(5, 'name', 12), [{ id: 2, name: 'landscape' }]);
  assert.deepEqual(await instance.getTagById('2'), [{ id: 2, name: 'landscape' }]);
  await instance.searchTags('landscape, night_sky');
  assert.deepEqual(await instance.searchUser('Demo & 1', 2), [{ id: 12, username: 'Demo' }]);
  assert.deepEqual(requests.map(({page,q,json,...x}) => x), [
    { s: 'tag', limit: '5', orderby: 'name', after_id: '12' },
    { s: 'tag', id: '2', limit: '1' },
    { s: 'tag', names: 'landscape night_sky' },
    { s: 'user', name: 'Demo & 1', limit: '2' }
  ]);
});

test('supports upstream empty envelopes and keeps legacy no-results sentinel', async () => {
  for (const value of [{ '@attributes': { count: '0' } }, { post: [] }, [], null, { success: 'false', message: 'No posts found' }]) {
    const instance = client(value);
    assert.deepEqual((await instance.searchPosts()).posts, []);
    assert.deepEqual(await instance.getPosts(), { success: false, message: 'No posts found' });
  }
});

test('random search starts on page zero and replaces existing sort', async () => {
  const instance = new Gelbooru({ fetch: async url => {
    assert.equal(url.searchParams.get('tags'), 'sort:random night_sky rating:general');
    assert.equal(url.searchParams.get('pid'), '0');
    assert.equal(url.searchParams.get('limit'), '1');
    return respond(fixture);
  } });
  assert.deepEqual(await instance.getRandomPost('night_sky sort:score rating:general'), post);
  assert.equal((await client([]).getRandomPost()).success, false);
});

test('rate limits, auth and other upstream failures are distinct', async () => {
  for (const [status, code] of [[429, 'RATE_LIMIT'], [401, 'AUTH'], [403, 'AUTH'], [503, 'HTTP'], [302, 'HTTP']]) {
    const instance = new Gelbooru({ fetch: async () => respond({}, status, { 'retry-after': '20' }) });
    await assert.rejects(instance.getPosts(), error => error instanceof GelbooruError && error.code === code &&
      error.status === status && (status !== 429 || error.retryAfter === '20'));
  }
  await assert.rejects(client({ success: false, reason: 'API key required' }).getPosts(), { code: 'AUTH' });
  await assert.rejects(client({ success: false, reason: 'too many requests' }).getPosts(), { code: 'RATE_LIMIT' });
  await assert.rejects(client({ success: false, message: 'search down' }).getPosts(), { code: 'UPSTREAM' });
});

test('invalid JSON, invalid shapes and huge bodies cannot escape or masquerade as no results', async () => {
  for (const text of ['<html>challenge</html>', '{"unexpected":true}', '{"post":[12]}', 'x'.repeat(8 * 1024 * 1024 + 1)]) {
    const instance = new Gelbooru({ fetch: async () => new Response(text) });
    await assert.rejects(instance.getPosts(), { code: 'INVALID_RESPONSE' });
  }
});

test('network failures never expose the authenticated URL or upstream text', async () => {
  const instance = new Gelbooru({ apiKey: 'secret-fixture', userId: 5, fetch: async url => { throw Error(url); } });
  await assert.rejects(instance.getPosts(), e => e.code === 'NETWORK' && e.cause === undefined && !String(e.stack).includes('secret-fixture'));
  await assert.rejects(client({ success: false, message: 'search down secret-fixture' }).getPosts(), e => !String(e).includes('secret-fixture'));
});

test('timeout and caller abort propagate without hanging', async () => {
  const controller = new AbortController();
  // The ref'ed timer lets the test process observe AbortSignal.timeout's unref'ed timer.
  const transport = async (_url, { signal }) => {
    signal.throwIfAborted();
    await new Promise((resolve, reject) => {
      const keepAlive = setTimeout(resolve, 250);
      signal.addEventListener('abort', () => { clearTimeout(keepAlive); reject(signal.reason); }, { once: true });
    });
    return respond(fixture);
  };
  await assert.rejects(new Gelbooru({ timeoutMs: 10, fetch: transport }).getPosts(), { code: 'TIMEOUT' });
  const pending = new Gelbooru({ fetch: transport }).searchPosts({ signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: 'ABORTED' });
});

test('validates malformed parameters before issuing requests', async () => {
  const instance = new Gelbooru({ fetch: async () => assert.fail('should not fetch') });
  await assert.rejects(instance.searchPosts({ page: -1 }), RangeError);
  await assert.rejects(instance.getPosts('a', 101), RangeError);
  await assert.rejects(instance.getTags(10, 'bogus'), RangeError);
  await assert.rejects(instance.getTagById('1&limit=100'), RangeError);
  assert.throws(() => new Gelbooru({ apiKey: 'key' }), TypeError);
});
