const Gelbooru = require('../index.js');
const fs = require('fs');
const axios = require('axios');

// Example 1: Old style (backward compatible)
async function oldStyleExample() {
  console.log('=== Old Style Example (Backward Compatible) ===');

  const tags = 'yuri';
  const client = new Gelbooru(tags);

  try {
    const post = await client.getRandomPost(tags);

    if (post.success === false) {
      console.error('Error:', post.message);
      return;
    }

    console.log(`Post ID: ${post.id}`);
    console.log(`Tags: ${post.tags}`);
    console.log(`File URL: ${post.file_url}`);

    // Download the post
    const response = await axios({
      method: 'get',
      url: post.file_url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(`./${post.id}.jpg`);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log(`Downloaded post ${post.id} successfully!`);
    });

    writer.on('error', err => {
      console.error('Download error:', err.message);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: New style with options
async function newStyleExample() {
  console.log('\n=== New Style Example (Modern API) ===');

  const client = new Gelbooru({
    tags: 'yuri',
    limit: 10,
    timeout: 5000,
  });

  try {
    const post = await client.getRandomPost();

    if (post.success === false) {
      console.error('Error:', post.message);
      return;
    }

    console.log(`Post ID: ${post.id}`);
    console.log(`Rating: ${post.rating}`);
    console.log(`Score: ${post.score}`);
    console.log(`Size: ${post.width}x${post.height}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 3: With authentication
async function authenticatedExample() {
  console.log('\n=== Authenticated Example ===');

  const client = new Gelbooru({
    apiKey: 'your-api-key',
    userId: 'your-user-id',
  });

  try {
    const posts = await client.getPosts('yuri', 5, 0);

    if (posts.success === false) {
      console.error('Error:', posts.message);
      return;
    }

    console.log(`Found ${posts.length} posts`);
    posts.forEach(post => {
      console.log(`- Post ${post.id}: ${post.tags.split(' ').slice(0, 5).join(', ')}...`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 4: Get multiple posts
async function multiplePostsExample() {
  console.log('\n=== Multiple Posts Example ===');

  const client = new Gelbooru();

  try {
    const posts = await client.getPosts('anime landscape', 10, 0);

    if (posts.success === false) {
      console.error('Error:', posts.message);
      return;
    }

    console.log(`Retrieved ${posts.length} posts`);
    posts.forEach((post, index) => {
      console.log(`${index + 1}. Post ${post.id} - Score: ${post.score}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 5: Search tags
async function searchTagsExample() {
  console.log('\n=== Search Tags Example ===');

  const client = new Gelbooru();

  try {
    const tags = await client.searchTags('yuri');

    if (tags.success === false) {
      console.error('Error:', tags.message);
      return;
    }

    console.log(`Found ${tags.length} matching tags`);
    tags.slice(0, 5).forEach(tag => {
      console.log(`- ${tag.name} (${tag.count} posts)`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples
async function main() {
  await oldStyleExample();
  await newStyleExample();
  await multiplePostsExample();
  await searchTagsExample();
  // Uncomment if you have API credentials
  // await authenticatedExample();
}

main();
