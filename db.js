const low = require('lowdb')
const fs = require('fs')
const FileSync = require('lowdb/adapters/FileSync')

const db = low(new FileSync('facts/db.json'))
const searchDb = low(new FileSync('facts/searches.json'))

// Set some defaults (required if your JSON file is empty)
db.defaults({ facts: [] }).write()
searchDb.defaults({ searches: [] }).write()

// Add a post
// db.get('searches')
//     .push({ query: '', date: new Date().toDateString(), results: [] })
//     .write()

function update(text, fact) {
    db.get('facts')
        .find({ text })
        .assign(fact).write();
}

function updatePublished(text, imagePath) {
    db.get('facts')
        .find({ text })
        .assign({ published: true, imagePath })
        .write();
}

function insertSearch(query, results) {
    searchDb.get('searches').push({
        query,
        date: new Date().toString(),
        results
    }).write();
}

function outputSearchToJs() {
    const data = searchDb.get('searches').value();
    fs.writeFileSync('./latest-search.js', `latestSearch = ${JSON.stringify(data, null, '\t')};`, { encoding: 'UTF-8' });
}

function getRandom() {
    return db.get('facts').filter(f => !f.published).sample().value();
}

module.exports = {
    update,
    updatePublished,
    insertSearch,
    outputSearchToJs,
    getRandom
}

//   {
//     "fact": "According to the International Federation of Poker, socks don’t count as an item of clothing in strip poker.",
//     "highlight": ["socks", "strip poker"],
//     "keyword": "strip poker",
//     "image": "https://cdn.pixabay.com/photo/2015/11/27/20/49/cards-1066386__340.jpg",
//     "tags": "#poker #strippoker"
// },