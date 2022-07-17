import { Shopify } from "@shopify/shopify-api"
import logger from "../logger.js"
import dbService from "../services/db.service.js"
import { decrypt, encrypt } from "./crypt.js"
const { Session } = dbService

// TODO test throwing errors on these cases
// to see how Shopify handles them

const storeCallback = async (session) => {
    try {
        const result = await Session.findById(session.id)
        if (!result) {
            await Session.create({
                id: session.id,
                content: encrypt(JSON.stringify(session)),
                shop: session.shop,
            })
        } else {
            await Session.updateById(session.id, {
                content: encrypt(JSON.stringify(session)),
                shop: session.shop,
            })
        }
        return true
    } catch (error) {
        logger.error("Session create/update error", error)
        return false
    }
}

const loadCallback = async (id) => {
    try {
        const sessionResult = await Session.findById(id)
        if (sessionResult?.content?.length > 0) {
            const sessionObj = JSON.parse(decrypt(sessionResult.content))
            // Another Shopify bug (Shopify/shopify-node-api#333)
            return Shopify.Session.Session.cloneSession(
                sessionObj,
                sessionObj.id
            )
        }
        return undefined
    } catch (error) {
        logger.error("Session read error", error)
        return undefined
    }
}

const deleteCallback = async (id) => {
    try {
        await Session.deleteById(id)
        return true
    } catch (error) {
        logger.error("Session delete error", error)
        return false
    }
}

const sessionStorage = new Shopify.Session.CustomSessionStorage(
    storeCallback,
    loadCallback,
    deleteCallback
)

export default sessionStorage
