import Gelbooru, { GelbooruError } from 'gelbooru-api';

const query = process.argv.slice(2).join(' ') || 'landscape night_sky';
const api = new Gelbooru({
  apiKey: process.env.GELBOORU_API_KEY,
  userId: process.env.GELBOORU_USER_ID
});

try {
  const { posts, total } = await api.searchPosts({
    tags: [query, 'rating:general'],
    limit: 5,
    signal: AbortSignal.timeout(12_000)
  });
  console.log(JSON.stringify({ total, posts: posts.map(({ id, rating, tags }) => ({ id, rating, tags })) }, null, 2));
} catch (error) {
  if (!(error instanceof GelbooruError)) throw error;
  console.error(error.code + ': ' + error.message);
  if (error.retryAfter) console.error('Retry-After: ' + error.retryAfter);
  process.exitCode = 1;
}
