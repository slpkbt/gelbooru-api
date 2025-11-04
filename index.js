/**
 * Gelbooru API - Modern NodeJS wrapper for Gelbooru API
 * @module gelbooru-api
 * @version 2.0.0
 * @license MIT
 * @author slpkbt
 */

const Gelbooru = require('./lib/gelbooru');

// Export the main class
module.exports = Gelbooru;

// Export additional utilities for advanced usage
module.exports.Gelbooru = Gelbooru;
module.exports.constants = require('./lib/constants');
module.exports.utils = require('./lib/utils');
module.exports.HttpClient = require('./lib/http-client');
