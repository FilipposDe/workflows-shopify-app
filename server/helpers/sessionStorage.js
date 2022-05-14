import { Shopify } from "@shopify/shopify-api"
import crypto from "crypto"
import logger from "../logger.js"
import dbService from "../services/db.service.js"
const { Session } = dbService

function encrypt(text) {
    if (!text) return null
    const iv = crypto.randomBytes(16)
    const hash = crypto.createHash("sha256")
    hash.update(process.env.SERVER_SECRET)
    const key = hash.digest("hex").slice(0, 32)
    const cipher = crypto.createCipheriv("aes-256-ctr", key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const result = `${iv.toString("hex")}|${encrypted.toString("hex")}`
    return result
}

function decrypt(text) {
    if (!text) return null
    let decrypted = null
    const hash = crypto.createHash("sha256")
    hash.update(process.env.SERVER_SECRET)
    const key = hash.digest("hex").slice(0, 32)
    const input = text.split("|")
    const iv = Buffer.from(input[0], "hex")
    const encryptedText = Buffer.from(input[1], "hex")
    const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv)
    decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
}

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
