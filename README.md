# Instagram content generation (Fact page) **Worked in 2018**

This is a step by step command line program that automatically generates and posts instagram images. It uses html templates, image search and random facts to generate an image with text. Then, the image gets posted on instagram. Due to changes in instagram it's possible the part that posts to instagram does not work, but you can still use this to generate content.

You can see the generated content on instagram pages `factsupreme` and `trapaona`.

## Install

1. Install [Node](https://nodejs.org/en/).
2. Open CMD or PowerShell in program directory ((Win10) Shift+Right click > Open PowerShell window here).
3. Run `npm install`.

## Run

1. Open CMD or PowerShell in program directory ((Win10) Shift+Right click > Open PowerShell window here).
2. Run `node index`.
3. Follow the instructions.

## Add facts

All facts are inside `facts/db.json` JSON database. You can add new facts to it.

When a fact is published to instagram the entry is marked with `published: true`, so that a fact does not be publish twice.

## Preview search results

Open `preview-search-results.html` in a web browser. This updates after every image search. Use it while creating the post to preview the query results.

## Preview the post template

Open `template-test.html` in a web browser.

## Edit the template

Edit `template.html` and `template.css`.

To change the trademark, edit `./resources/logo-atfactsupreme.png`.
To use other image, edit `post-generate.js`.

## Configuration

Instagram credentials are in `config.json`. Keep this a secret.

Other parameters are Google Custom Search Engine (CSE) parameters. Google provides 100 search queries per day for free.