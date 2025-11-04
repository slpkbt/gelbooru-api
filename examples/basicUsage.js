const Gelbooru = require('../index.js');

async function main() {
  // Create a client instance
  const client = new Gelbooru();

  console.log('=== Basic Usage Examples ===\n');

  // Example 1: Get posts with tags
  console.log('1. Getting posts with tags:');
  try {
    const posts = await client.getPosts('cat', 5, 0);
    if (posts.success === false) {
      console.error('Error:', posts.message);
    } else {
      console.log(`Found ${posts.length} posts`);
      console.log('First post ID:', posts[0].id);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 2: Get a random post
  console.log('\n2. Getting a random post:');
  try {
    const post = await client.getRandomPost('anime');
    if (post.success === false) {
      console.error('Error:', post.message);
    } else {
      console.log('Random post ID:', post.id);
      console.log('Post rating:', post.rating);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 3: Get post by ID
  console.log('\n3. Getting post by ID:');
  try {
    const post = await client.getPostById(1);
    if (post.success === false) {
      console.error('Error:', post.message);
    } else {
      console.log('Post found:', post);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 4: Get tags
  console.log('\n4. Getting popular tags:');
  try {
    const tags = await client.getTags(5, 'count', 0);
    if (tags.success === false) {
      console.error('Error:', tags.message);
    } else {
      console.log(`Found ${tags.length} tags`);
      tags.forEach(tag => {
        console.log(`- ${tag.name}: ${tag.count} posts`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 5: Search specific tag
  console.log('\n5. Searching for specific tag:');
  try {
    const tags = await client.searchTags('cat');
    if (tags.success === false) {
      console.error('Error:', tags.message);
    } else {
      console.log(`Found ${tags.length} matching tags`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Example 6: Using array of tags
  console.log('\n6. Using array of tags:');
  try {
    const posts = await client.getPosts(['cat', 'cute'], 3, 0);
    if (posts.success === false) {
      console.error('Error:', posts.message);
    } else {
      console.log(`Found ${posts.length} posts with multiple tags`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
