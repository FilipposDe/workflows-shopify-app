import { Shopify } from '%40shopify/shopify-api' // %40: temp. bug fix
import { getShopifyClientArgs } from '../helpers/util.js'
import { getConstant } from '../services/dynamicFiles.service.js'

async function onBodyReceived(body) {
    console.log("hit")
    // Your code here
    // const client = new Shopify.Clients.Rest(await getShopifyClientArgs())
}

export default function productsUpdate(_topic, _shop, body) {
    onBodyReceived(body)
}
