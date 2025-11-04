/**
 * TypeScript definitions for gelbooru-api
 * @version 2.0.0
 */

declare module 'gelbooru-api' {
  /**
   * Post data from Gelbooru
   */
  export interface Post {
    id: number;
    created_at: string | Date;
    score: number;
    width: number;
    height: number;
    md5: string;
    directory: string;
    image: string;
    rating: 'safe' | 'questionable' | 'explicit' | 'sensitive';
    source: string;
    change: number | Date;
    owner: string;
    creator_id: number;
    parent_id: number;
    sample: number;
    preview_height: number;
    preview_width: number;
    tags: string;
    title: string;
    has_notes: string | boolean;
    has_comments: string | boolean;
    file_url: string;
    preview_url: string;
    sample_url: string;
    sample_height: number;
    sample_width: number;
    status: string;
    post_locked: number | boolean;
    has_children: string | boolean;
  }

  /**
   * Tag data from Gelbooru
   */
  export interface Tag {
    id: number;
    name: string;
    count: number;
    type?: number;
    ambiguous?: boolean;
  }

  /**
   * User data from Gelbooru
   */
  export interface User {
    id: number;
    name: string;
    active?: number;
  }

  /**
   * Comment data from Gelbooru
   */
  export interface Comment {
    id: number;
    post_id: number;
    creator: string;
    creator_id: number;
    created_at: string | Date;
    body: string;
  }

  /**
   * Error response
   */
  export interface ErrorResponse {
    success: false;
    message: string;
    error?: string;
  }

  /**
   * Options for creating Gelbooru client
   */
  export interface GelbooruOptions {
    /** Tags to search for (default: '') */
    tags?: string | string[];
    /** Default limit for queries (default: 100) */
    limit?: number;
    /** API key for authenticated requests */
    apiKey?: string;
    /** User ID for authenticated requests */
    userId?: string;
    /** Custom base URL */
    baseURL?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Additional headers */
    headers?: Record<string, string>;
  }

  /**
   * Main Gelbooru API client class
   */
  export class Gelbooru {
    /**
     * Creates a new Gelbooru client
     * @param tagsOrOptions - Tags string or options object
     * @param limit - Default limit (for backward compatibility)
     * @param options - Additional options (for backward compatibility)
     */
    constructor(tagsOrOptions?: string | GelbooruOptions, limit?: number, options?: GelbooruOptions);

    /** Base URL for API requests */
    baseUrl: string;

    /** Default tags */
    tags: string;

    /** Default limit */
    limit: number;

    /** Last fetched posts */
    lastPosts: any[];

    /**
     * Get posts from Gelbooru
     * @param tags - Tags to search for
     * @param limit - Number of posts to return
     * @param pid - Page number
     * @returns Promise resolving to array of posts or error object
     */
    getPosts(tags?: string | string[], limit?: number, pid?: number): Promise<Post[] | ErrorResponse>;

    /**
     * Get a random post
     * @param tags - Tags to search for
     * @returns Promise resolving to a single post or error object
     */
    getRandomPost(tags?: string | string[]): Promise<Post | ErrorResponse>;

    /**
     * Get tags from Gelbooru
     * @param limit - Number of tags to return
     * @param orderBy - Order by field (date, count, name)
     * @param afterId - Get tags with ID greater than this value
     * @returns Promise resolving to array of tags or error object
     */
    getTags(limit?: number, orderBy?: 'date' | 'count' | 'name', afterId?: number): Promise<Tag[] | ErrorResponse>;

    /**
     * Search for tags by name
     * @param tags - Tag names to search for
     * @returns Promise resolving to array of matching tags or error object
     */
    searchTags(tags: string | string[]): Promise<Tag[] | ErrorResponse>;

    /**
     * Search for a user by name
     * @param name - Username to search for
     * @returns Promise resolving to array of matching users or error object
     */
    searchUser(name: string): Promise<User[] | ErrorResponse>;

    /**
     * Get a post by ID
     * @param id - Post ID
     * @returns Promise resolving to post data or error object
     */
    getPostById(id: number): Promise<Post[] | ErrorResponse>;

    /**
     * Get a tag by ID
     * @param id - Tag ID
     * @returns Promise resolving to tag data or error object
     */
    getTagById(id: number): Promise<Tag[] | ErrorResponse>;

    /**
     * Get comments for a post
     * @param postId - Post ID
     * @returns Promise resolving to array of comments or error object
     */
    getComments(postId: number): Promise<Comment[] | ErrorResponse>;

    /**
     * Set API credentials
     * @param apiKey - API key
     * @param userId - User ID
     */
    setCredentials(apiKey: string, userId: string): void;

    /**
     * Set API key
     * @param apiKey - API key
     */
    setApiKey(apiKey: string): void;

    /**
     * Set user ID
     * @param userId - User ID
     */
    setUserId(userId: string): void;

    /**
     * Clear authentication credentials
     */
    clearCredentials(): void;

    /**
     * Set request timeout
     * @param timeout - Timeout in milliseconds
     */
    setTimeout(timeout: number): void;

    /**
     * Get current timeout value
     * @returns Timeout in milliseconds
     */
    getTimeout(): number;
  }

  /**
   * Constants used by the API
   */
  export namespace constants {
    export const BASE_URL: string;
    export const ENDPOINTS: {
      POSTS: string;
      TAGS: string;
      USERS: string;
      COMMENTS: string;
    };
    export const DEFAULT_PARAMS: Record<string, any>;
    export const LIMITS: {
      MAX_POSTS_PER_REQUEST: number;
      DEFAULT_LIMIT: number;
      MIN_LIMIT: number;
    };
    export const SORT_ORDERS: {
      ASC: string;
      DESC: string;
    };
    export const TAG_ORDER_BY: {
      DATE: string;
      COUNT: string;
      NAME: string;
    };
    export const RATINGS: {
      SAFE: string;
      QUESTIONABLE: string;
      EXPLICIT: string;
      SENSITIVE: string;
    };
    export const HTTP_TIMEOUT: number;
    export const USER_AGENT: string;
  }

  /**
   * Utility functions
   */
  export namespace utils {
    export function formatTags(tags: string | string[]): string;
    export function validateLimit(limit: number, max?: number): number;
    export function validatePid(pid: number): number;
    export function validateId(id: number): number;
    export function buildQueryParams(params: Record<string, any>): URLSearchParams;
    export function createErrorResponse(message: string, error?: any): ErrorResponse;
    export function parseDate(date: string | number): Date | null;
    export function sanitizeTags(tags: string | string[]): string;
    export function isValidResponse(response: any, dataKey: string): boolean;
    export function extractDataOrError(response: any, dataKey: string, errorMessage?: string): any;
    export function delay(ms: number): Promise<void>;
  }

  /**
   * HTTP Client for making API requests
   */
  export class HttpClient {
    constructor(options?: GelbooruOptions);
    get(params?: Record<string, any>): Promise<any>;
    setApiKey(apiKey: string): void;
    setUserId(userId: string): void;
    setCredentials(apiKey: string, userId: string): void;
    clearCredentials(): void;
    getTimeout(): number;
    setTimeout(timeout: number): void;
  }

  // Default export
  export default Gelbooru;
}
