import { Shopify, DataType } from "@shopify/shopify-api" // %40: temp. bug fix
import { getConstant } from "../util/util.js"
import config from "../server/config.js"

async function main(body) {
    const session = await Shopify.Utils.loadOfflineSession(config.SHOP)
    const client = new Shopify.Clients.Rest(config.SHOP, session.accessToken)
    body = JSON.parse(body)
    try {
        const opts = {
            path: `webhooks`,
        }
        const res = await client.get({
            ...opts,
        })
        console.log({ res: JSON.stringify(res) })
    } catch (e) {
        //
    }
}

export default async function productsUpdate(topic, shop, body) {
    main(body)
}
