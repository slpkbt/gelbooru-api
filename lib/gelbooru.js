/**
 * Gelbooru API Client
 * @module gelbooru
 */

const HttpClient = require('./http-client');
const { DEFAULT_PARAMS, ENDPOINTS, LIMITS } = require('./constants');
const {
  formatTags,
  sanitizeTags,
  validateLimit,
  validatePid,
  validateId,
  extractDataOrError,
  createErrorResponse,
} = require('./utils');

/**
 * Main Gelbooru API client class
 * @class
 */
class Gelbooru {
  /**
   * Creates a new Gelbooru client instance
   * @param {string|Object} [tagsOrOptions=''] - Tags to search for or options object
   * @param {number} [limit=100] - Default number of posts to return (backward compatibility)
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.apiKey] - API key for authenticated requests
   * @param {string} [options.userId] - User ID for authenticated requests
   * @param {string} [options.baseURL] - Custom base URL
   * @param {number} [options.timeout] - Request timeout in milliseconds
   * @example
   * // Old style (backward compatible)
   * const client = new Gelbooru('yuri', 10);
   *
   * // New style with options
   * const client = new Gelbooru({
   *   apiKey: 'your-api-key',
   *   userId: 'your-user-id',
   *   timeout: 5000
   * });
   */
  constructor(tagsOrOptions = '', limit = 100, options = {}) {
    // Handle backward compatibility
    if (typeof tagsOrOptions === 'string') {
      // Old style: new Gelbooru(tags, limit)
      this.tags = formatTags(tagsOrOptions);
      this.limit = validateLimit(limit, LIMITS.DEFAULT_LIMIT);
      this.httpClient = new HttpClient(options);
    } else {
      // New style: new Gelbooru(options)
      const opts = tagsOrOptions || {};
      this.tags = formatTags(opts.tags || '');
      this.limit = validateLimit(opts.limit || 100, LIMITS.DEFAULT_LIMIT);
      this.httpClient = new HttpClient(opts);
    }

    // Store last fetched posts for compatibility
    this.lastPosts = [];

    // Base URL property for backward compatibility
    this.baseUrl = this.httpClient.baseURL;
  }

  /**
   * Gets posts from Gelbooru
   * @param {string|string[]} [tags] - Tags to search for
   * @param {number} [limit] - Number of posts to return
   * @param {number} [pid=0] - Page number
   * @returns {Promise<Array<Object>|Object>} Array of posts or error object
   * @example
   * const posts = await client.getPosts('yuri', 10, 0);
   */
  async getPosts(tags = this.tags, limit = this.limit, pid = 0) {
    try {
      const formattedTags = sanitizeTags(tags);
      const validatedLimit = validateLimit(limit, LIMITS.MAX_POSTS_PER_REQUEST);
      const validatedPid = validatePid(pid);

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.POSTS,
        tags: formattedTags,
        limit: validatedLimit,
        pid: validatedPid,
      };

      const response = await this.httpClient.get(params);
      const posts = extractDataOrError(response, 'post', 'No posts found');

      // Store for backward compatibility
      if (Array.isArray(posts)) {
        this.lastPosts = response;
        return posts;
      }

      return posts; // error response
    } catch (error) {
      return createErrorResponse('Failed to fetch posts', error);
    }
  }

  /**
   * Gets a random post with specified tags
   * @param {string|string[]} [tags] - Tags to search for
   * @returns {Promise<Object>} Random post or error object
   * @example
   * const post = await client.getRandomPost('yuri');
   */
  async getRandomPost(tags = this.tags) {
    try {
      const formattedTags = sanitizeTags(tags);
      const searchTags = `sort:random ${formattedTags}`.trim();

      const posts = await this.getPosts(searchTags, 1, 0);

      if (posts.success === false) {
        return posts;
      }

      if (Array.isArray(posts) && posts.length > 0) {
        return posts[0];
      }

      return createErrorResponse('No random post found');
    } catch (error) {
      return createErrorResponse('Failed to fetch random post', error);
    }
  }

  /**
   * Gets tags from Gelbooru
   * @param {number} [limit=100] - Number of tags to return
   * @param {string} [orderBy='count'] - Order by field (date, count, name)
   * @param {number} [afterId=0] - Get tags with ID greater than this value
   * @returns {Promise<Array<Object>|Object>} Array of tags or error object
   * @example
   * const tags = await client.getTags(10, 'count', 0);
   */
  async getTags(limit = 100, orderBy = 'count', afterId = 0) {
    try {
      const validatedLimit = validateLimit(limit, LIMITS.DEFAULT_LIMIT);
      const validatedAfterId = validateId(afterId);

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.TAGS,
        limit: validatedLimit,
        order: orderBy,
        after_id: validatedAfterId,
      };

      const response = await this.httpClient.get(params);
      return extractDataOrError(response, 'tag', 'No tags found');
    } catch (error) {
      return createErrorResponse('Failed to fetch tags', error);
    }
  }

  /**
   * Searches for tags by name
   * @param {string|string[]} tags - Tag names to search for
   * @returns {Promise<Array<Object>|Object>} Array of matching tags or error object
   * @example
   * const tags = await client.searchTags('yuri');
   */
  async searchTags(tags = '') {
    try {
      const formattedTags = formatTags(tags);

      if (!formattedTags) {
        return createErrorResponse('Tags parameter is required');
      }

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.TAGS,
        names: formattedTags,
      };

      const response = await this.httpClient.get(params);
      return extractDataOrError(response, 'tag', 'No tags found');
    } catch (error) {
      return createErrorResponse('Failed to search tags', error);
    }
  }

  /**
   * Searches for a user by name
   * @param {string} name - Username to search for
   * @returns {Promise<Array<Object>|Object>} Array of matching users or error object
   * @example
   * const users = await client.searchUser('username');
   */
  async searchUser(name = '') {
    try {
      if (!name) {
        return createErrorResponse('Name parameter is required');
      }

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.USERS,
        name: name,
      };

      const response = await this.httpClient.get(params);
      return extractDataOrError(response, 'user', 'No user found');
    } catch (error) {
      return createErrorResponse('Failed to search user', error);
    }
  }

  /**
   * Gets a post by ID
   * @param {number} id - Post ID
   * @returns {Promise<Array<Object>|Object>} Post data or error object
   * @example
   * const post = await client.getPostById(123456);
   */
  async getPostById(id = 0) {
    try {
      const validatedId = validateId(id);

      if (validatedId === 0) {
        return createErrorResponse('Valid post ID is required');
      }

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.POSTS,
        id: validatedId,
      };

      const response = await this.httpClient.get(params);
      return extractDataOrError(response, 'post', 'No post found');
    } catch (error) {
      return createErrorResponse('Failed to fetch post', error);
    }
  }

  /**
   * Gets a tag by ID
   * @param {number} id - Tag ID
   * @returns {Promise<Array<Object>|Object>} Tag data or error object
   * @example
   * const tag = await client.getTagById(12345);
   */
  async getTagById(id = 0) {
    try {
      const validatedId = validateId(id);

      if (validatedId === 0) {
        return createErrorResponse('Valid tag ID is required');
      }

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.TAGS,
        id: validatedId,
      };

      const response = await this.httpClient.get(params);
      return extractDataOrError(response, 'tag', 'No tag found');
    } catch (error) {
      return createErrorResponse('Failed to fetch tag', error);
    }
  }

  /**
   * Gets comments for a post
   * @param {number} postId - Post ID
   * @returns {Promise<Array<Object>|Object>} Array of comments or error object
   * @example
   * const comments = await client.getComments(123456);
   */
  async getComments(postId) {
    try {
      const validatedId = validateId(postId);

      if (validatedId === 0) {
        return createErrorResponse('Valid post ID is required');
      }

      const params = {
        ...DEFAULT_PARAMS,
        s: ENDPOINTS.COMMENTS,
        post_id: validatedId,
      };

      const response = await this.httpClient.get(params);
      return extractDataOrError(response, 'comment', 'No comments found');
    } catch (error) {
      return createErrorResponse('Failed to fetch comments', error);
    }
  }

  /**
   * Sets API credentials for authenticated requests
   * @param {string} apiKey - API key
   * @param {string} userId - User ID
   * @example
   * client.setCredentials('your-api-key', 'your-user-id');
   */
  setCredentials(apiKey, userId) {
    this.httpClient.setCredentials(apiKey, userId);
  }

  /**
   * Sets API key
   * @param {string} apiKey - API key
   * @example
   * client.setApiKey('your-api-key');
   */
  setApiKey(apiKey) {
    this.httpClient.setApiKey(apiKey);
  }

  /**
   * Sets user ID
   * @param {string} userId - User ID
   * @example
   * client.setUserId('your-user-id');
   */
  setUserId(userId) {
    this.httpClient.setUserId(userId);
  }

  /**
   * Clears authentication credentials
   * @example
   * client.clearCredentials();
   */
  clearCredentials() {
    this.httpClient.clearCredentials();
  }

  /**
   * Sets request timeout
   * @param {number} timeout - Timeout in milliseconds
   * @example
   * client.setTimeout(5000);
   */
  setTimeout(timeout) {
    this.httpClient.setTimeout(timeout);
  }

  /**
   * Gets current timeout value
   * @returns {number} Timeout in milliseconds
   * @example
   * const timeout = client.getTimeout();
   */
  getTimeout() {
    return this.httpClient.getTimeout();
  }
}

module.exports = Gelbooru;
