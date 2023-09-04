const { IgApiClient, IgCheckpointError } = require('instagram-private-api');
const fs = require('fs');
const Bluebird = require('bluebird');
const inquirer = require('inquirer');
const { sample } = require('lodash');

const forSomething = ['a FREE shoutout', 'a FREE promo', 'help'];
const commentLetterByLetter = ['WOW', 'FACT', 'FIRST', 'YOLO', 'MEDICAL EMERGENCY', '911'];
const verb = ['see', 'pet'];
const noun = ['a cat', 'an amazing facts page', 'a celebrity'];
const postYourSomething = ['IQ', 'age', 'country', 'mom\'s credit card number'];
const whoeverLikes = ['wants to be in a relationship', 'thinks you\'re beautiful']

const leadingLine = [
    () => `Comment ${sample(commentLetterByLetter)} letter by letter for ${sample(forSomething)}!`,
    () => `When did you last ${sample(verb)} ${sample(noun)}?`,
    () => `Comment your date of birth and find your lost TWIN!`,
    () => `Post your ${sample(postYourSomething)} in the comments!`,
    () => `Be the LAST to comment for ${sample(forSomething)}!`,
    () => `Comment FIRST for ${sample(forSomething)}!`,
    () => `Comment below. Whoever likes your post ${sample(whoeverLikes)}!`
];

function getCaption(customTags) {
    const caption = `${sample(leadingLine)()}
-
Follow @factsupreme for more Amazing & VERIFIED Facts.
-
CHECK OUT OUR POSTS YOU WILL GET +30 IQ. THATS A VERIFIED GUARANTEE!
-
.
.
.
-
${customTags} #facts #knowledge #coolfacts #didyouknow #interestingfacts #instafact #dailyfact #factsdaily #know #factz #realfacts #creepyfacts #amazingfacts #sciencefacts #truefacts #worldfacts
`;

    return caption;
}




const ig = new IgApiClient();

async function login(config) {
    ig.state.generateDevice(config.IG_USERNAME);
    //ig.state.proxyUrl = process.env.IG_PROXY;
    return Bluebird.try(async () => {
        const auth = await ig.account.login(config.IG_USERNAME, config.IG_PASSWORD);
        console.log(auth);
    }).catch(IgCheckpointError, async () => {
        console.log(ig.state.checkpoint); // Checkpoint info here
        await ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
        console.log(ig.state.checkpoint); // Challenge info here
        const { code } = await inquirer.prompt([
            {
                type: 'input',
                name: 'code',
                message: 'Enter SMS code',
            },
        ]);
        console.log(await ig.challenge.sendSecurityCode(code));
    }).catch(e => {
        console.log('Could not resolve checkpoint:', e, e.stack);
        throw e;
    });
};

async function post(imagePath, caption) {
    // await login();

    const file = fs.readFileSync(imagePath);
    // const { latitude, longitude, searchQuery } = {
    //     latitude: 0.0,
    //     longitude: 0.0,
    //     // not required
    //     searchQuery: 'place',
    // };

    // /**
    //  * Get the place
    //  * If searchQuery is undefined, you'll get the nearest places to your location
    //  * this is the same as in the upload (-configure) dialog in the app
    //  */
    // const locations = await ig.search.location(latitude, longitude, searchQuery);
    // /**
    //  * Get the first venue
    //  * In the real world you would check the returned locations
    //  */
    // const mediaLocation = locations[0];
    // console.log(mediaLocation);

    const publishResult = await ig.publish.photo({
        // read the file into a Buffer
        file: file,
        // optional, default ''
        caption: caption,
        // optional
        // location: mediaLocation,
        // optional
        //   usertags: {
        //     in: [
        //       // tag the user 'instagram' @ (0.5 | 0.5)
        //       await generateUsertagFromName('instagram', 0.5, 0.5),
        //     ],
        //   },
    });

    console.log(publishResult);
};

module.exports = {
    getCaption,
    post,
    login
}


// (async () => {
//     await login();
// })();