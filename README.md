# Workflows: custom Shopify app

This is a custom, embedded Shopify app that allows you to write code inside its dashboard, for webhooks that are sent by Shopify.

## Architecture

Build on Shopify's Node.js and React.js template. Uses Firebase's Firestore for data storage (backend).

## Differences from Shopify's Node app template

-   Proper monorepo structure, using NPM Workspaces and a single node_modules folder (Shopify CLI will attempt to install dependencies in each package, so the `--skip-dependencies-installation` argument is used on the `dev` script)
-   Frontend and backend are separate, instead of nested (since frontend route acts as as proxy for backend)
-   Auth routes are not middleware, they are part of the app's routes.
-   The app is embedded, requesting both offline and online tokens, and meant for one shop only
-   Heroku specific deployment scripts

## Requirements

-   Firebase project with service account

## Development

1. Clone the repository
2. Setup the Firebase project
3. Set the variables in `.env` and `shopify.app.toml`
4. Install / create an account with Ngrok
5. Run `npm install` on the root directory
6. Run `npm run dev` on the root directory, to start the Shopify CLI
7. Setup the app with the CLI (Ngrok, app and store)
8. When it's built, visit the generated link to install on the store and use the app

## Configuration

You can enable available topics on `web/common/topic-list.js`
