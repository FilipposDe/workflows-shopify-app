import { capUnderscoreToCamelCase } from "../../common/util"

function getDefaultCode(topic) {
    return `import { Shopify } from '%40shopify/shopify-api' // %40: temp. bug fix
import { getShopifyClientArgs } from '../helpers/util.js'
import { getConstant } from '../services/dynamicFiles.service.js'

async function onBodyReceived(body) {
    // Your code here
    // const client = new Shopify.Clients.Rest(await getShopifyClientArgs())
}

export default function ${capUnderscoreToCamelCase(
        topic
    )}(_topic, _shop, body) {
    onBodyReceived(body)
}
`
}

export default getDefaultCode
