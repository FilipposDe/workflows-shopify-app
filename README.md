# Workflows: custom Shopify app

This is a custom, embedded Shopify app that allows you to write code inside its dashboard, for webhooks that are sent by Shopify.

## Requirements

-   If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
-   If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
-   If you haven't, install the [Shopify CLI](https://github.com/Shopify/shopify-cli)

## Installation

TODO

Add the right scopes and enable the right topics in common

-   **If you are not using the Shopify CLI**, in the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

It leverages the [Shopify API Library](https://github.com/Shopify/shopify-node-api) on the backend to create [an embedded app](https://shopify.dev/apps/tools/app-bridge/getting-started#embed-your-app-in-the-shopify-admin), and [Polaris](https://github.com/Shopify/polaris-react) and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components) on the frontend.

This is the repository used when you create a new Node app with the [Shopify CLI](https://shopify.dev/apps/tools/cli).

Using the [Shopify CLI](https://github.com/Shopify/shopify-cli) run:

```sh
shopify app create node -n APP_NAME
```

Or, you can run `npx degit shopify/shopify-app-node` and create a `.env` file containing the following values:

```yaml
SHOPIFY_API_KEY={api key}           # Your API key
SHOPIFY_API_SECRET={api secret key} # Your API secret key
SCOPES={scopes}                     # Your app's required scopes, comma-separated
HOST={your app's host}              # Your app's host, without the protocol prefix
```
