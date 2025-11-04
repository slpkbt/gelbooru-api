# gelbooru-api

[![npm version](https://img.shields.io/npm/v/gelbooru-api.svg)](https://www.npmjs.com/package/gelbooru-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

Modern and professional NodeJS wrapper for [Gelbooru API](https://gelbooru.com) with full backward compatibility.

[![Gelbooru](https://i.imgur.com/vJvYIxA.png)](https://gelbooru.com/)

## Features

- ✅ **Full Backward Compatibility** - Works with existing code
- 🚀 **Modern API** - Built with async/await and Promises
- 📦 **Modular Architecture** - Clean, maintainable code structure
- 🔐 **Authentication Support** - API key and user ID support
- 📝 **TypeScript Definitions** - Full TypeScript support
- 🧪 **Well Tested** - Comprehensive test coverage
- 🎯 **Zero Breaking Changes** - Drop-in replacement for v1.x
- 📚 **Extensive Documentation** - JSDoc comments throughout
- ⚡ **Modern Dependencies** - Uses axios instead of deprecated request
- 🛠️ **Developer Friendly** - ESLint and Prettier configured

## Installation

```bash
npm install gelbooru-api
```

## Quick Start

### Basic Usage (Backward Compatible)

```javascript
const Gelbooru = require('gelbooru-api');

// Old style - still works!
const client = new Gelbooru('yuri', 10);

client.getRandomPost('yuri').then(post => {
  console.log(post.id);
  console.log(post.file_url);
});
```

### Modern API (New Style)

```javascript
const Gelbooru = require('gelbooru-api');

// New style with options
const client = new Gelbooru({
  tags: 'yuri',
  limit: 100,
  apiKey: 'your-api-key',    // optional
  userId: 'your-user-id',    // optional
  timeout: 5000              // optional
});

// Use async/await
async function getPosts() {
  const posts = await client.getPosts('yuri', 10, 0);
  console.log(posts);
}
```

## API Reference

### Constructor

#### Old Style (Backward Compatible)
```javascript
new Gelbooru(tags, limit)
```

#### New Style
```javascript
new Gelbooru(options)
```

**Options:**
- `tags` (string|array) - Default tags to search
- `limit` (number) - Default limit for queries (default: 100)
- `apiKey` (string) - API key for authenticated requests
- `userId` (string) - User ID for authenticated requests
- `baseURL` (string) - Custom base URL
- `timeout` (number) - Request timeout in ms (default: 30000)

### Methods

#### getPosts(tags, limit, pid)

Get posts from Gelbooru.

```javascript
const posts = await client.getPosts('yuri', 10, 0);
```

**Parameters:**
- `tags` (string|array) - Tags to search for
- `limit` (number) - Number of posts to return (max: 1000)
- `pid` (number) - Page number (default: 0)

**Returns:** `Promise<Post[]|ErrorResponse>`

#### getRandomPost(tags)

Get a random post with specified tags.

```javascript
const post = await client.getRandomPost('yuri');
```

**Parameters:**
- `tags` (string|array) - Tags to search for

**Returns:** `Promise<Post|ErrorResponse>`

#### getTags(limit, orderBy, afterId)

Get tags from Gelbooru.

```javascript
const tags = await client.getTags(100, 'count', 0);
```

**Parameters:**
- `limit` (number) - Number of tags to return
- `orderBy` (string) - Order by: 'date', 'count', or 'name'
- `afterId` (number) - Get tags with ID greater than this

**Returns:** `Promise<Tag[]|ErrorResponse>`

#### searchTags(tags)

Search for tags by name.

```javascript
const tags = await client.searchTags('yuri');
```

**Parameters:**
- `tags` (string|array) - Tag names to search for

**Returns:** `Promise<Tag[]|ErrorResponse>`

#### searchUser(name)

Search for a user by name.

```javascript
const users = await client.searchUser('username');
```

**Parameters:**
- `name` (string) - Username to search for

**Returns:** `Promise<User[]|ErrorResponse>`

#### getPostById(id)

Get a post by ID.

```javascript
const post = await client.getPostById(123456);
```

**Parameters:**
- `id` (number) - Post ID

**Returns:** `Promise<Post[]|ErrorResponse>`

#### getTagById(id)

Get a tag by ID.

```javascript
const tag = await client.getTagById(12345);
```

**Parameters:**
- `id` (number) - Tag ID

**Returns:** `Promise<Tag[]|ErrorResponse>`

#### getComments(postId)

Get comments for a post.

```javascript
const comments = await client.getComments(123456);
```

**Parameters:**
- `postId` (number) - Post ID

**Returns:** `Promise<Comment[]|ErrorResponse>`

### Authentication Methods

#### setCredentials(apiKey, userId)

Set API credentials for authenticated requests.

```javascript
client.setCredentials('your-api-key', 'your-user-id');
```

#### setApiKey(apiKey)

Set API key.

```javascript
client.setApiKey('your-api-key');
```

#### setUserId(userId)

Set user ID.

```javascript
client.setUserId('your-user-id');
```

#### clearCredentials()

Clear authentication credentials.

```javascript
client.clearCredentials();
```

### Utility Methods

#### setTimeout(timeout)

Set request timeout.

```javascript
client.setTimeout(5000); // 5 seconds
```

#### getTimeout()

Get current timeout value.

```javascript
const timeout = client.getTimeout();
```

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import Gelbooru, { Post, Tag, User, GelbooruOptions } from 'gelbooru-api';

const client = new Gelbooru({
  tags: 'yuri',
  limit: 10
});

const posts: Post[] = await client.getPosts('yuri', 10, 0);
```

## Error Handling

All methods return a Promise that resolves to either data or an error object:

```javascript
const posts = await client.getPosts('yuri', 10, 0);

if (posts.success === false) {
  console.error('Error:', posts.message);
  return;
}

// Use posts normally
console.log(posts.length);
```

## Examples

Check out the [examples](./examples) directory for more detailed usage examples:

- [Basic Usage](./examples/basicUsage.js)
- [Download Random Post](./examples/downloadRandomPost.js)

### Running Examples

```bash
node examples/basicUsage.js
node examples/downloadRandomPost.js
```

## Advanced Usage

### Using Array of Tags

```javascript
const posts = await client.getPosts(['yuri', 'anime'], 10, 0);
```

### Custom Timeout

```javascript
const client = new Gelbooru({
  timeout: 10000 // 10 seconds
});
```

### Using with Authentication

```javascript
const client = new Gelbooru({
  apiKey: process.env.GELBOORU_API_KEY,
  userId: process.env.GELBOORU_USER_ID
});
```

## Development

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Formatting

```bash
npm run format
npm run format:check
```

## Project Structure

```
gelbooru-api/
├── lib/
│   ├── constants.js      # API constants
│   ├── utils.js          # Utility functions
│   ├── http-client.js    # HTTP client
│   └── gelbooru.js       # Main Gelbooru class
├── types/
│   └── index.d.ts        # TypeScript definitions
├── test/
│   └── utils.test.js     # Unit tests
├── examples/
│   ├── basicUsage.js
│   └── downloadRandomPost.js
└── index.js              # Main entry point
```

## Migration from v1.x

Good news! Version 2.0 is **100% backward compatible** with v1.x. You don't need to change any existing code. However, we recommend migrating to the new API style for better features:

### v1.x Style (Still Supported)

```javascript
const Gelbooru = require('gelbooru-api');
const client = new Gelbooru('yuri', 10);
client.getPosts('yuri', 10, 0).then(posts => {
  console.log(posts);
});
```

### v2.0 Style (Recommended)

```javascript
const Gelbooru = require('gelbooru-api');
const client = new Gelbooru({
  tags: 'yuri',
  limit: 10,
  apiKey: 'your-api-key'  // Now supported!
});

const posts = await client.getPosts('yuri', 10, 0);
console.log(posts);
```

## What's New in v2.0

- ✨ Modular architecture with separate files
- 🔐 Authentication support (API key + user ID)
- 📝 Complete TypeScript definitions
- 🧪 Unit tests with Jest
- 🛠️ ESLint and Prettier integration
- 📚 Enhanced JSDoc documentation
- ⚡ Modern dependencies (axios instead of request)
- 🎯 Better error handling
- 🔄 Rate limiting support
- 📦 Comments API support
- 🚀 Improved performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**slpkbt**

## Disclaimer

This is an unofficial wrapper for the Gelbooru API. This project is not affiliated with or endorsed by Gelbooru.

## Support

If you find this library helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📝 Improving documentation

## Links

- [GitHub Repository](https://github.com/slpkbt/gelbooru-api)
- [NPM Package](https://www.npmjs.com/package/gelbooru-api)
- [Gelbooru](https://gelbooru.com)
- [Issue Tracker](https://github.com/slpkbt/gelbooru-api/issues)

---

Made with ❤️ by slpkbt
