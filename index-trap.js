
const { search } = require('./image-search');
const { generate, pngToJpg, songContent } = require('./post-generate');
const { getCaption, post, login } = require('./post-instagram');
const inquirer = require('inquirer');
const cp = require("child_process");
const { sample } = require('lodash');
const db = require('./db');

const instagramConfig = require('./config-trap.json');

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

const songDb = require('./facts/trap-lyrics.json');
const allSongs = songDb.quotes.filter(q => !q.published);

(async () => {
    const song = sample(allSongs);

    console.log(`Song: "${song.lines}" - ${song.artist}, ${song.song} `);

    while (true) {
        const pathPng = await generate(song.lines[0], songContent(song), './trap-template/template.html');
        const pathJpg = await pngToJpg(pathPng);
        openInWindows(pathJpg);

        const { action } = await inquirer.prompt([{
            type: 'list',
            message: 'Post is generated: ',
            name: 'action',
            choices: [
                {
                    key: 'c',
                    name: 'Continue',
                    value: 'continue'
                }
            ]
        }]);

        if (action === 'continue') {

            let caption = `Pjesma: "${song.song}" - ${song.artist} 
.
:
:
:
.
#trap #rap #hrvatskitrap #hrvatskirap #music #glazba #${song.artist} #${song.song}
            `;

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
                    break;
                }
            }
            break;
        }
    }
})();
