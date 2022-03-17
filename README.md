# ⚡Unofficial NodeJS wrapper for gelbooru.com

[![N|Solid](https://camo.githubusercontent.com/cf8453f783d9680156d91890cdf3f5a4d34e9c07631fa6e87254917c97bee3a1/68747470733a2f2f692e696d6775722e636f6d2f764a76594978412e706e67)](https://gelbooru.com/)

#### Gelbooru has millions of free description hentai and rule34, anime videos, images, wallpapers, and more!

- # This library will allow you to:
- Search posts with certain tags
- Get post by id
- Parse tags
- Search users

# Installation

```sh
npm i gelbooru-api
````

## Methods

#### First you should initialize the Geelboru class, you can do it like this:
```js
const Gelbooru = require(`gelbooru-api`);
const GelbooruClient = new Gelbooru(tags);
```

#### Now you can use library methods:
- GelbooruClient.getPosts(tags,limit,pid)
- GelbooruClient.getRandomPost(tags,limit,pid)
- GelbooruClient.getTags(limit,orderBy,afterId)
- GelbooruClient.searchTags(tags)
- GelbooruClient.searchUser(name,limit) 
- GelbooruClient.getPostById(id)
- GelbooruClient.getTagById(id)

### ⚠All these methods returns a Promise!


## Examples

# Download random post
```js
const Gelbooru = require(`../index.js`);
const fs = require('fs');
const request = require('request');

const tags = 'yuri'; // provide tags here

const GelbooruClient = new Gelbooru(tags); // create new instance of Gelbooru

GelbooruClient.getRandomPost(tags, 10, 0).then(post => { // get random post
    const dw = request(post.file_url).pipe(fs.createWriteStream(`./${post.id}.jpg`)); // download post
    dw.on('finish', () => { // when download is finished
        console.log(`Downloaded ${post.id}`); // print post id
    }); 
})
```