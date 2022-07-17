# Workflows: custom Shopify app

This is a custom, embedded Shopify app that allows you to write Node.js code inside its dashboard, for webhooks that are sent by Shopify. Build on Shopify's Node.js and React.js template with the [Shopify CLI 3.0](https://github.com/Shopify/cli). Uses Firebase's Firestore for data storage.

## Differences from Shopify's Node app template

-   The app is embedded, requesting both offline and online tokens, and meant for one shop only
-   Proper monorepo structure, using NPM workspaces and a single node_modules folder (Shopify CLI will attempt to install dependencies in each package, so the `--skip-dependencies-installation` argument is used on the `dev` script)
-   Frontend and backend are separate according to Shopify docs, instead of nested according to the Shopify app template
-   Actual React HMR support during development (server adds the plugin's preamble script to `index.html`)
-   Auth routes are defined as routes, not middleware
-   Heroku specific deployment scripts (`heroku-postbuild`, `start`), since the CLI can no longer support Heroku deployment

## Requirements

-   Firebase project with service account and Firebase rules set to disable all non-admin access

## Development

1. Clone the repository
2. Set up the Firebase project
3. Create the `.env` and set the variables, and configure `shopify.app.toml`
4. Install / create an account with Ngrok
5. Run `npm install` on the root directory
6. Run `npm run dev` on the root directory, to start the Shopify CLI
7. Setup the app with the CLI (Ngrok, app and store steps)
8. When it's built, visit the generated link to install on the store and use the app

## Configuration

You can enable available topics on `web/common/topic-list.js` (don't forget to add the relevant scopes on `shopify.app.toml` and `.env`)

## TODO

Test are not functional yet
