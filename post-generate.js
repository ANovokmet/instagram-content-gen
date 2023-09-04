const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
const pngToJpeg = require('png-to-jpeg');
const keyword_extractor = require("keyword-extractor");

function factContent(fact) {
    let imageSrc = fact.image;

    let contentHtml = fact.fact + '';
    if (fact.highlight) {
        fact.highlight.forEach(element => {
            contentHtml = contentHtml.replace(element, `<span class="highlight">${element}</span>`);
        });
    }

    let styles = fs.readFileSync('./template.css');

    const bitmap = fs.readFileSync('./resources/logo-atfactsupreme.png');
    const base64Image = Buffer.from(bitmap).toString('base64');
    let trademarkSrc = 'data:image/png;base64,' + base64Image;

    return {
        contentHtml,
        imageSrc,
        trademarkSrc,
        styles
    }
}

function songContent(item) {
    let imageSrc = item.imageSrc;

    let contentHtml = '';
    item.lines.forEach(line => {
        contentHtml += `<span>${line}</span>`;
    });

    let styles = fs.readFileSync('./trap-template/template.css');
    const rotation = (Math.random() * 10 - 5) | 0;


    return {
        contentHtml,
        imageSrc,
        rotation,
        styles
    }
}

function generate(fileName, content, templatePath = 'template.html') {
    const html = fs.readFileSync(templatePath, 'utf8');
    const output = `./posts/${generateFilename(fileName)}.png`;

    return nodeHtmlToImage({
        output: output,
        html: html,
        content: content,
        waitUntil: 'networkidle0'
    }).then(() => {
        console.log('The image was created successfully!');
        return output;
    });
}

function generateFilename(input = '') {
    input = input.replace(/\s/g, '-');
    input = input.replace(/[^\w-]/g,'');
    input = input.substring(0, 25);
    //const timestamp = new Date().toISOString();-${timestamp}
    return `${input}`;
}

function pngToJpg(path, cleanup = true) {
    let buffer = fs.readFileSync(path);
    let output = path.replace('.png', '.jpg');
    return pngToJpeg({ quality: 100 })(buffer).then(data => {
        fs.writeFileSync(output, data);
        if (cleanup) {
            fs.unlinkSync(path);
        }
        return output;
    });
}

function getKeywords(sentence) {
    return keyword_extractor.extract(sentence, {
        language: "english",
        remove_duplicates: true,
        return_chained_words: true
    });
}

function getTags(sentence) {
    return keyword_extractor.extract(sentence, {
        language: "english",
        remove_duplicates: true,
        remove_digits: true,
        return_changed_case: true,
        return_chained_words: false
    }).map(keyword => '#' + keyword).join(' ');
}

module.exports = {
    getKeywords,
    getTags,
    generate,
    pngToJpg,
    factContent,
    songContent
}