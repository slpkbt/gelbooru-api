const request = require('request'); // npm install request

function formatTags(txt) {
    return txt.replace(/,/g, ' '); // replace all commas with spaces to format tags
}

/**
* @typedef User
* @property {number} id
* @property {string} username
* @property {number} active  
*/

/**
 * @typedef Post
 * @property {number} id - The id of the post.
 * @property {Date} created_at - The date the post was created.
 * @property {number} score - The score of the post.
 * @property {number} width - The width of the image in the post.
 * @property {number} height - The height of the image in the post.
 * @property {string} md5 - The md5 hash of the image in the post.
 * @property {string} directory - The directory of the image in the post.
 * @property {string} image - The image file name of the post.
 * @property {string} rating - The rating of the post. (safe, questionable, explicit)
 * @property {string} source - The source of the post. (Image)
 * @property {Date} change - The date the post was last updated. (UNIX)
 * @property {string} owner - The owner of the post.
 * @property {number} creator_id - Post creator'r id
 * @property {number} parent_id - The parent id of the post.
 * @property {number} sample
 * @property {number} preview_height - The height of the preview image in the post.
 * @property {number} preview_width - The width of the preview image in the post.
 * @property {string} tags - The tags of the post.
 * @property {string} title - The title of the post.
 * @property {string} has_notes - Whether the post has notes.
 * @property {string} has_comments - Whether the post has comments.
 * @property {string} file_url - The url of the image in the post.
 * @property {string} preview_url - The url of the preview image in the post.
 * @property {string} sample_url - The url of the sample image in the post.
 * @property {number} sample_height - The height of the sample image in the post.
 * @property {number} sample_width - The width of the sample image in the post.
 * @property {string} status - The status of the post. (active)
 * @property {number} post_locked - Whether the post is locked.
 * @property {string} has_children - Whether the post has children.
*/

/**
 * @typedef Tag
 * @property {number} id - The id of the tag, you can use it for searching.
 * @property {string} name - The name of the tag.
 * @property {number} count - Number of posts with this tag.
*/

class Gelbooru {

    /**
     * @param {string} tags - Name of tag to search. (Separate tags by commas or spaces)
     * @param {number} limit - Number of posts to return.
     */

    constructor(tags = '', limit = 10) {
        this.baseUrl = 'https://gelbooru.com/index.php?page=dapi&q=index&json=1'; // Base URL for Gelbooru API, you can change it if gelbooru changes it.
        this.tags = formatTags(tags); // Tags to search for.
        this.limit = 10;
        this.lastPosts = [];
    }


    /**
     * @type {Promise}
     * @param {string} tags - Tags to search for.
     * @param {number} limit - Number of posts to return.
     * @param {number} pid - Page to start from (default is 0).
     * @return {Promise<Post>}
     */

    async getPosts(tags = this.tags, limit = this.limit, pid = 0) {
        return new Promise((resolve, reject) => {
            request(`${this.baseUrl}&s=post&tags=${tags}&limit=${limit}&pid=pid`, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    const posts = JSON.parse(body);
                    if (!posts.post) resolve({ success: false, message: 'No posts found' });
                    this.lastPosts = posts;
                    resolve(posts.post);
                }
            });
        })
    }

    /**
     * @type {Promise}
     * @param {string} tags - Tags to search for.
     * @param {number} limit - Number of posts to return.
     * @param {number} pid - Page to start from (default is 0).
     * @return {Promise<Post>}
     */

    async getRandomPost(tags = this.tags, limit = this.limit, pid = 0) {
        return new Promise(async (resolve, reject) => {
            const posts = await this.getPosts(tags, limit, pid);
            if (posts.success == false) resolve(posts);
            resolve(posts[Math.floor(Math.random() * posts.length)]);
        })
    }

    /**
     * @type {Promise}
     * @param {number} limit - Number of tags to return.
     * @param {string} orderBy - Order by a field ( date, count, name )
     * @param {number} afterId - Grab tags whose ID is greater than this value.
     * @return {Promise<Tag>}
     */

    async getTags(limit = 10, orderBy = 'count', afterId = 0) {
        return new Promise((resolve, reject) => {
            request(`${this.baseUrl}&s=tag&limit=${limit}&order=${orderBy}&after_id=${afterId}`, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    const tags = JSON.parse(body);
                    if (!tags.tag) resolve({ success: false, message: 'No tags found' });
                    resolve(tags.tag);
                }
            });
        })
    }

    /**
     * @type {Promise}
     * @param {string} tags - Name of tag to search. (Separate tags by commas or spaces)
     * @return {Promise<Tag>}
     */
    async searchTags(tags = '') {
        return new Promise((resolve, reject) => {
            request(`${this.baseUrl}&s=tag&names=${tags}`, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    const tags = JSON.parse(body);
                    if (!tags.tag) resolve({ success: false, message: 'No tags found' });
                    resolve(tags.tag);
                }
            });
        })
    }

    /**
     * @type {Promise}
     * @param {string} name - Name of user to search.
     * @param {number} limit - Number of users to return.
     * @return {Promise<User>}
     */
    async searchUser(name = '',) {
        return new Promise((resolve, reject) => {
            request(`${this.baseUrl}&s=user&name=${name}`, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    const user = JSON.parse(body);
                    if (!user.user) resolve({ success: false, message: 'No user found' });
                    resolve(user.user);
                }
            });
        })
    }

    /**
     * @type {Promise}
     * @param {number} id - Post id to search.
     * @return {Promise<Post>}
     */
    async getPostById(id = 0) {
        return new Promise((resolve, reject) => {
            request(`${this.baseUrl}&s=post&id=${id}`, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    const post = JSON.parse(body);
                    if (!post.post) resolve({ success: false, message: 'No post found' });
                    resolve(post.post);
                }
            });
        })
    }

    /**
     * @type {Promise}
     * @param {string} id - Tag id to search for.
     * @return {Promise<Tag>}
    */
    async getTagById(id = 0) {
        return new Promise((resolve, reject) => {
            request(`${this.baseUrl}&s=tag&id=${id}`, (err, res, body) => {
                if (err) {
                    reject(err);
                } else {
                    const tag = JSON.parse(body);
                    if (!tag.tag) resolve({ success: false, message: 'No tag found' });
                    resolve(tag.tag);
                }
            });
        })
    }

}

module.exports = Gelbooru;