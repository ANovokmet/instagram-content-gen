
const { search } = require('./image-search');
const { getKeywords, getTags, generate, pngToJpg, factContent } = require('./post-generate');
const { getCaption, post, login } = require('./post-instagram');
const inquirer = require('inquirer');
const cp = require("child_process");
const { sample } = require('lodash');
const db = require('./db');

const instagramConfig = require('./config.json');

function openInWindows(path) {
    console.log(`Opening ${path}...`);
    path = path.replace(/\//g, '\\\\');
    return cp.exec(path, function (error, stdout, stderr) {
        console.log('Image opened');
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

(async () => {
    const text = db.getRandom().text;
    const keywords = getKeywords(text);

    console.log(`Fact: ${text}`);
    console.log(`Keywords: ${keywords.join(', ')}`);

    let { code } = await inquirer.prompt([
        {
            type: 'input',
            name: 'code',
            message: `Enter image search query:`,
        },
    ]);

    let results = await search(code);
    db.insertSearch(code, results);
    db.outputSearchToJs();
    // openInWindows('./preview-search-results.html');

    let imageSearchIndex = 0;
    let userUrl = null;

    while (true) {
        const result = results[imageSearchIndex];

        const fact = {
            fact: text,
            highlight: keywords,
            keyword: sample(keywords),
            image: userUrl || result.url,
            tags: getTags(text)
        }

        const pathPng = await generate(fact.fact, factContent(fact), 'template.html');
        const pathJpg = await pngToJpg(pathPng);
        openInWindows(pathJpg);

        const { action } = await inquirer.prompt([{
            type: 'list',
            message: 'Post is generated: ',
            name: 'action',
            choices: [
                {
                    key: 'n',
                    name: 'Next image',
                    value: 'next'
                },
                {
                    key: 'r',
                    name: 'Redo query',
                    value: 'redo'
                },
                {
                    key: 't',
                    name: 'Type URL to image',
                    value: 'url'
                },
                {
                    key: 'c',
                    name: 'Continue',
                    value: 'continue'
                }
            ]
        }]);

        if (action === 'next') {
            imageSearchIndex = (imageSearchIndex + 1) % results.length;
            userUrl = null;
        }

        if (action === 'redo') {
            // prompt query
            const res = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'code',
                    message: `Enter image search query:`,
                },
            ]);
            code = res.code;

            results = await search(code);
            db.insertSearch(code, results);
            db.outputSearchToJs();
        }

        if (action === 'url') {
            // promt url
            const res = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'url',
                    message: `Enter image URL:`,
                },
            ]);
            userUrl = res.url;
        }

        if (action === 'continue') {
            let caption = getCaption(fact.tags);
            while (true) {
                console.log('Caption on post: ');
                console.log(caption);

                const { action } = await inquirer.prompt([{
                    type: 'list',
                    message: 'Post is generated: ',
                    name: 'action',
                    choices: [
                        {
                            key: 'e',
                            name: 'Edit caption',
                            value: 'edit'
                        },
                        {
                            key: 'c',
                            name: 'Continue (Posts to instagram)',
                            value: 'continue'
                        }
                    ]
                }]);

                if (action == 'edit') {
                    const res = await inquirer.prompt([
                        {
                            type: 'editor',
                            name: 'caption',
                            message: 'Please write the new caption.',
                            default: caption
                        }
                    ]);
                    caption = res.caption;
                }

                if (action == 'continue') {
                    await login(instagramConfig);
                    await post(pathJpg, caption);
                    db.updatePublished(text, pathJpg);
                    break;
                }
            }
            break;
        }
    }
})();
