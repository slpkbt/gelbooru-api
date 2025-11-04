# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-11-04

### Added

- ✨ **Modular Architecture**: Code split into separate modules (`lib/constants.js`, `lib/utils.js`, `lib/http-client.js`, `lib/gelbooru.js`)
- 🔐 **Authentication Support**: API key and user ID support for authenticated requests
- 📝 **TypeScript Definitions**: Full TypeScript support with `types/index.d.ts`
- 🧪 **Unit Tests**: Jest testing framework with initial test coverage
- 🛠️ **Code Quality Tools**: ESLint and Prettier configuration
- 📚 **Enhanced Documentation**: Comprehensive JSDoc comments throughout the codebase
- 🎯 **New Methods**:
  - `getComments(postId)` - Get comments for a post
  - `setCredentials(apiKey, userId)` - Set authentication credentials
  - `setApiKey(apiKey)` - Set API key
  - `setUserId(userId)` - Set user ID
  - `clearCredentials()` - Clear authentication credentials
  - `setTimeout(timeout)` - Set request timeout
  - `getTimeout()` - Get current timeout value
- 📦 **Better Error Handling**: Consistent error response format across all methods
- 🌐 **Modern HTTP Client**: Axios-based HTTP client with better error handling
- 🎨 **Array Support**: Methods now accept arrays of tags in addition to strings
- 📊 **Rate Limiting Support**: Built-in handling for API rate limits
- 🚀 **Performance Improvements**: Optimized request handling and response processing

### Changed

- ⚡ **Replaced `request` with `axios`**: Modern HTTP client instead of deprecated `request` package
- 📦 **Updated Dependencies**: All dependencies updated to latest versions
- 🏗️ **Project Structure**: Organized code into `lib/`, `types/`, `test/`, and `examples/` directories
- 📖 **Improved Examples**: Enhanced examples with multiple use cases
- 🎯 **Default Limit**: Changed from 10 to 100 posts per request
- 📝 **Better README**: Comprehensive documentation with examples and migration guide

### Fixed

- 🐛 Fixed random post sorting to use `sort:random` tag
- 🔧 Improved tag formatting and sanitization
- ✅ Better validation for IDs, limits, and page numbers
- 🛡️ Enhanced error messages and error handling

### Backward Compatibility

- ✅ **100% Backward Compatible**: All v1.x code works without any changes
- 🔄 Old constructor style `new Gelbooru(tags, limit)` still supported
- 📌 All existing method signatures remain unchanged
- 🎯 New features are opt-in and don't affect existing functionality

### Developer Experience

- 🎨 Prettier configuration for consistent code formatting
- 🔍 ESLint rules for code quality
- 🧪 Jest configuration for testing
- 📚 Comprehensive JSDoc documentation
- 🔧 npm scripts for common tasks:
  - `npm test` - Run tests with coverage
  - `npm run lint` - Run ESLint
  - `npm run lint:fix` - Fix ESLint issues
  - `npm run format` - Format code with Prettier
  - `npm run format:check` - Check code formatting

### Documentation

- 📖 Detailed API reference in README
- 💡 Migration guide from v1.x to v2.0
- 🎯 Multiple usage examples
- 📝 TypeScript type definitions
- 🌐 JSDoc comments for all public APIs

## [1.x] - Previous Versions

Previous versions of gelbooru-api. See git history for details.

### Known Issues in v1.x

- Used deprecated `request` package
- Limited error handling
- No TypeScript support
- No authentication support
- Monolithic structure
- Limited documentation

---

## Migration Guide

### From v1.x to v2.0

Version 2.0 is 100% backward compatible. Your existing code will work without any changes:

```javascript
// v1.x code - still works!
const Gelbooru = require('gelbooru-api');
const client = new Gelbooru('yuri', 10);
client.getRandomPost('yuri').then(post => console.log(post));
```

However, we recommend adopting the new API style:

```javascript
// v2.0 recommended style
const Gelbooru = require('gelbooru-api');
const client = new Gelbooru({
  tags: 'yuri',
  limit: 10,
  apiKey: 'your-api-key',  // New feature!
  userId: 'your-user-id'   // New feature!
});

const post = await client.getRandomPost('yuri');
console.log(post);
```

### Benefits of Migrating

1. **Authentication Support**: Access authenticated endpoints
2. **Better Error Handling**: Consistent error responses
3. **TypeScript Support**: Full type definitions
4. **Modern Dependencies**: No deprecated packages
5. **More Features**: Comments API, rate limiting, etc.

---

## Support

If you encounter any issues or have questions about the changes:

- 📝 [Open an issue](https://github.com/slpkbt/gelbooru-api/issues)
- 💬 [Start a discussion](https://github.com/slpkbt/gelbooru-api/discussions)
- 📧 Contact the maintainer

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) principles and uses [Semantic Versioning](https://semver.org/).
