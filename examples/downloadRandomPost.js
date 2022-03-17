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