/**
 * HTTP Client for Gelbooru API
 * @module http-client
 */

const axios = require('axios');
const { BASE_URL, HTTP_TIMEOUT, USER_AGENT } = require('./constants');
const { buildQueryParams, createErrorResponse } = require('./utils');

/**
 * HTTP Client class for making API requests
 */
class HttpClient {
  /**
   * Creates a new HttpClient instance
   * @param {Object} [options={}] - Client options
   * @param {string} [options.baseURL] - Base URL for API requests
   * @param {number} [options.timeout] - Request timeout in milliseconds
   * @param {Object} [options.headers] - Additional headers
   * @param {string} [options.apiKey] - API key for authenticated requests
   * @param {string} [options.userId] - User ID for authenticated requests
   */
  constructor(options = {}) {
    this.baseURL = options.baseURL || BASE_URL;
    this.timeout = options.timeout || HTTP_TIMEOUT;
    this.apiKey = options.apiKey || null;
    this.userId = options.userId || null;

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this._handleError(error)
    );
  }

  /**
   * Makes a GET request to the API
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response data
   * @private
   */
  async get(params = {}) {
    try {
      // Add authentication parameters if available
      const authParams = this._getAuthParams();
      const allParams = { ...params, ...authParams };

      const queryString = buildQueryParams(allParams).toString();
      const url = queryString ? `?${queryString}` : '';

      const response = await this.client.get(url);

      // Handle different response types
      if (response.data) {
        return response.data;
      }

      // If response is empty, return error
      return createErrorResponse('Empty response from API');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets authentication parameters if available
   * @returns {Object} Authentication parameters
   * @private
   */
  _getAuthParams() {
    const params = {};

    if (this.apiKey) {
      params.api_key = this.apiKey;
    }

    if (this.userId) {
      params.user_id = this.userId;
    }

    return params;
  }

  /**
   * Handles HTTP errors
   * @param {Error} error - Error object
   * @returns {Promise<never>} Rejected promise with formatted error
   * @private
   */
  _handleError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 404) {
        return Promise.reject(createErrorResponse('Resource not found', error));
      }

      if (status === 403) {
        return Promise.reject(createErrorResponse('Access forbidden. Check your API credentials.', error));
      }

      if (status === 429) {
        return Promise.reject(createErrorResponse('Rate limit exceeded. Please try again later.', error));
      }

      if (status >= 500) {
        return Promise.reject(createErrorResponse('Server error. Please try again later.', error));
      }

      return Promise.reject(createErrorResponse(message, error));
    }

    if (error.request) {
      // Request was made but no response received
      return Promise.reject(createErrorResponse('No response from server. Check your network connection.', error));
    }

    // Something else happened
    return Promise.reject(createErrorResponse('Request failed', error));
  }

  /**
   * Sets API key for authenticated requests
   * @param {string} apiKey - API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Sets user ID for authenticated requests
   * @param {string} userId - User ID
   */
  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Sets authentication credentials
   * @param {string} apiKey - API key
   * @param {string} userId - User ID
   */
  setCredentials(apiKey, userId) {
    this.apiKey = apiKey;
    this.userId = userId;
  }

  /**
   * Removes authentication credentials
   */
  clearCredentials() {
    this.apiKey = null;
    this.userId = null;
  }

  /**
   * Gets current timeout value
   * @returns {number} Timeout in milliseconds
   */
  getTimeout() {
    return this.timeout;
  }

  /**
   * Sets request timeout
   * @param {number} timeout - Timeout in milliseconds
   */
  setTimeout(timeout) {
    this.timeout = timeout;
    this.client.defaults.timeout = timeout;
  }
}

module.exports = HttpClient;
