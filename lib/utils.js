/**
 * Utility functions for Gelbooru API
 * @module utils
 */

const { LIMITS } = require('./constants');

/**
 * Formats tags by replacing commas with spaces
 * @param {string|string[]} tags - Tags to format (comma-separated string or array)
 * @returns {string} Formatted tags string
 * @example
 * formatTags('tag1,tag2,tag3') // returns 'tag1 tag2 tag3'
 * formatTags(['tag1', 'tag2']) // returns 'tag1 tag2'
 */
function formatTags(tags) {
  if (Array.isArray(tags)) {
    return tags.join(' ').trim();
  }

  if (typeof tags === 'string') {
    return tags.replace(/,/g, ' ').trim();
  }

  return '';
}

/**
 * Validates and clamps a limit value
 * @param {number} limit - Limit value to validate
 * @param {number} [max=LIMITS.MAX_POSTS_PER_REQUEST] - Maximum allowed limit
 * @returns {number} Validated and clamped limit
 * @example
 * validateLimit(50) // returns 50
 * validateLimit(2000) // returns 1000 (clamped to max)
 * validateLimit(-5) // returns 1 (clamped to min)
 */
function validateLimit(limit, max = LIMITS.MAX_POSTS_PER_REQUEST) {
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedLimit) || parsedLimit < LIMITS.MIN_LIMIT) {
    return LIMITS.MIN_LIMIT;
  }

  if (parsedLimit > max) {
    return max;
  }

  return parsedLimit;
}

/**
 * Validates a page ID (pid)
 * @param {number} pid - Page ID to validate
 * @returns {number} Validated page ID (minimum 0)
 * @example
 * validatePid(5) // returns 5
 * validatePid(-1) // returns 0
 */
function validatePid(pid) {
  const parsedPid = parseInt(pid, 10);
  return isNaN(parsedPid) || parsedPid < 0 ? 0 : parsedPid;
}

/**
 * Validates a post/tag ID
 * @param {number} id - ID to validate
 * @returns {number} Validated ID (minimum 0)
 * @example
 * validateId(123) // returns 123
 * validateId(-5) // returns 0
 */
function validateId(id) {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) || parsedId < 0 ? 0 : parsedId;
}

/**
 * Builds query parameters for API requests
 * @param {Object} params - Parameters object
 * @returns {URLSearchParams} URLSearchParams object
 * @example
 * buildQueryParams({ tags: 'yuri', limit: 10 })
 */
function buildQueryParams(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}

/**
 * Creates a standard error response
 * @param {string} message - Error message
 * @param {*} [error] - Original error object
 * @returns {Object} Error response object
 * @example
 * createErrorResponse('Not found') // returns { success: false, message: 'Not found' }
 */
function createErrorResponse(message, error = null) {
  const response = {
    success: false,
    message,
  };

  if (error) {
    response.error = error.message || String(error);
  }

  return response;
}

/**
 * Parses date from string or timestamp
 * @param {string|number} date - Date string or timestamp
 * @returns {Date|null} Parsed Date object or null if invalid
 * @example
 * parseDate('2024-01-01') // returns Date object
 * parseDate(1704067200) // returns Date object
 */
function parseDate(date) {
  if (!date) return null;

  try {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Sanitizes and validates tags string
 * @param {string|string[]} tags - Tags to sanitize
 * @returns {string} Sanitized tags string
 * @example
 * sanitizeTags('  tag1  , tag2  ') // returns 'tag1 tag2'
 */
function sanitizeTags(tags) {
  const formatted = formatTags(tags);
  return formatted
    .split(/\s+/)
    .filter(tag => tag.length > 0)
    .join(' ');
}

/**
 * Checks if response is valid and contains data
 * @param {Object} response - API response
 * @param {string} dataKey - Key to check for data (e.g., 'post', 'tag')
 * @returns {boolean} True if response contains valid data
 * @example
 * isValidResponse({ post: [] }, 'post') // returns true
 */
function isValidResponse(response, dataKey) {
  return response &&
         typeof response === 'object' &&
         dataKey in response;
}

/**
 * Extracts data from API response or returns error
 * @param {Object} response - API response
 * @param {string} dataKey - Key to extract data from
 * @param {string} errorMessage - Error message if data not found
 * @returns {*} Extracted data or error response
 * @example
 * extractDataOrError({ post: [1,2,3] }, 'post', 'No posts') // returns [1,2,3]
 */
function extractDataOrError(response, dataKey, errorMessage = 'No data found') {
  if (isValidResponse(response, dataKey)) {
    const data = response[dataKey];

    // If data is empty array or empty object, return error
    if (Array.isArray(data) && data.length === 0) {
      return createErrorResponse(errorMessage);
    }

    return data;
  }

  return createErrorResponse(errorMessage);
}

/**
 * Delays execution for specified milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} Promise that resolves after delay
 * @example
 * await delay(1000) // waits 1 second
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  formatTags,
  validateLimit,
  validatePid,
  validateId,
  buildQueryParams,
  createErrorResponse,
  parseDate,
  sanitizeTags,
  isValidResponse,
  extractDataOrError,
  delay,
};
