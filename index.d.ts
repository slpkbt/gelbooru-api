declare class Gelbooru {
  constructor(options?: Gelbooru.Options);
  constructor(tags?: string, limit?: number);
  tags: string;
  limit: number;
  lastPosts: unknown;
  searchPosts(options?: Gelbooru.PostSearch): Promise<Gelbooru.PostPage>;
  getPosts(tags?: Gelbooru.Tags, limit?: number, pid?: number): Promise<Gelbooru.Post[] | Gelbooru.NoResults>;
  getRandomPost(tags?: Gelbooru.Tags): Promise<Gelbooru.Post | Gelbooru.NoResults>;
  getTags(limit?: number, orderBy?: 'date' | 'count' | 'name', afterId?: number | string): Promise<Gelbooru.Tag[] | Gelbooru.NoResults>;
  searchTags(tags?: Gelbooru.Tags): Promise<Gelbooru.Tag[] | Gelbooru.NoResults>;
  searchUser(name?: string, limit?: number): Promise<Gelbooru.User[] | Gelbooru.NoResults>;
  getPostById(id: number | string): Promise<Gelbooru.Post[] | Gelbooru.NoResults>;
  getTagById(id: number | string): Promise<Gelbooru.Tag[] | Gelbooru.NoResults>;
}

declare namespace Gelbooru {
  export { Gelbooru };
  export type Tags = string | readonly string[];
  export interface Options {
    tags?: Tags;
    limit?: number;
    apiKey?: string;
    userId?: string | number;
    timeoutMs?: number;
    fetch?: typeof globalThis.fetch;
  }
  export interface NoResults { success: false; message: string }
  export interface Post {
    id: number | string;
    tags?: string;
    rating?: string;
    width?: number | string;
    height?: number | string;
    score?: number | string;
    source?: string;
    file_url?: string;
    preview_url?: string;
    sample_url?: string;
    [key: string]: unknown;
  }
  export interface Tag { id: number | string; name: string; count?: number | string; [key: string]: unknown }
  export interface User { id: number | string; username?: string; name?: string; active?: number | string; [key: string]: unknown }
  export interface PostSearch { tags?: Tags; limit?: number; page?: number; signal?: AbortSignal }
  export interface PostPage { posts: Post[]; page: number; limit: number; total: number | null }
  export type ErrorCode = 'AUTH' | 'RATE_LIMIT' | 'HTTP' | 'UPSTREAM' | 'INVALID_RESPONSE' | 'ABORTED' | 'TIMEOUT' | 'NETWORK';
  export class GelbooruError extends Error {
    constructor(message: string, code: ErrorCode, metadata?: { status?: number; retryAfter?: string });
    code: ErrorCode;
    status?: number;
    retryAfter?: string;
  }
}

export = Gelbooru;
