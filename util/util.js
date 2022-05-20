import { Shopify } from "@shopify/shopify-api"
import config from "../server/config.js"
import files from "../server/services/dynamicFiles.service.js"

export const getConstant = files.getConstant

export const getShopifyClientArgs = async () => {
    const session = await Shopify.Utils.loadOfflineSession(config.SHOP)
    return [config.SHOP, session.accessToken]
}
