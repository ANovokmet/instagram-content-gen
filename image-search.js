const imageSearch = require('image-search-google');
const fs = require('fs');
const { CSE_ID, API_KEY } = require('./config.json');

const client = new imageSearch(CSE_ID, API_KEY);
const options = { page: 1 };

function search(query) {
    console.log(`Searching for images using query:"${query}"`);
    return client.search(query, options)
        .then(images => {
            console.log(images);
            if(images.length <= 0) {
                throw new Error(`no images found for query:"${query}"`);
            }
            /*
            [{
                'url': item.link,
                'thumbnail':item.image.thumbnailLink,
                'snippet':item.title,
                'context': item.image.contextLink
            }]
             */
            return images;
        })
        .catch(error => console.log(error));
}

function save(path, data) {
    fs.writeFileSync(path, data, { encoding: 'UTF-8' })
}

module.exports = {
    search: function(q, cache = false) {
        return search(q).then(images => {
            if(cache) {
                const data = JSON.stringify(images, null, 2);
                save(`./image-searches/${q}.json`, data);
            }
            return images;
        });
    }
}