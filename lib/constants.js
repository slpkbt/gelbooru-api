/**
 * Constants for Gelbooru API
 * @module constants
 */

/**
 * API Base URL
 * @constant {string}
 */
const BASE_URL = 'https://gelbooru.com/index.php';

/**
 * API Endpoints
 * @constant {Object}
 */
const ENDPOINTS = {
  POSTS: 'post',
  TAGS: 'tag',
  USERS: 'user',
  COMMENTS: 'comment',
};

/**
 * Default API parameters
 * @constant {Object}
 */
const DEFAULT_PARAMS = {
  page: 'dapi',
  s: 'post',
  q: 'index',
  json: 1,
};

/**
 * API Limits
 * @constant {Object}
 */
const LIMITS = {
  MAX_POSTS_PER_REQUEST: 1000,
  DEFAULT_LIMIT: 100,
  MIN_LIMIT: 1,
};

/**
 * Sort orders
 * @constant {Object}
 */
const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

/**
 * Order by options for tags
 * @constant {Object}
 */
const TAG_ORDER_BY = {
  DATE: 'date',
  COUNT: 'count',
  NAME: 'name',
};

/**
 * Post ratings
 * @constant {Object}
 */
const RATINGS = {
  SAFE: 'safe',
  QUESTIONABLE: 'questionable',
  EXPLICIT: 'explicit',
  SENSITIVE: 'sensitive',
};

/**
 * HTTP timeout in milliseconds
 * @constant {number}
 */
const HTTP_TIMEOUT = 30000;

/**
 * User agent for API requests
 * @constant {string}
 */
const USER_AGENT = 'gelbooru-api/2.0.0 (https://github.com/slpkbt/gelbooru-api)';

module.exports = {
  BASE_URL,
  ENDPOINTS,
  DEFAULT_PARAMS,
  LIMITS,
  SORT_ORDERS,
  TAG_ORDER_BY,
  RATINGS,
  HTTP_TIMEOUT,
  USER_AGENT,
};
