import { Shopify } from "@shopify/shopify-api"
import crypto from "crypto"
import { Session } from "../services/db.service.js"

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
    try {
        const hash = crypto.createHash("sha256")
        hash.update(process.env.SERVER_SECRET)
        const key = hash.digest("hex").slice(0, 32)
        const input = text.split("|")
        const iv = Buffer.from(input[0], "hex")
        const encryptedText = Buffer.from(input[1], "hex")
        const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv)
        decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])
    } catch (error) {
        console.error("error")
        return null
    }
    return decrypted.toString()
}
const storeCallback = async (session) => {
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
}

const loadCallback = async (id) => {
    const sessionResult = await Session.findById(id)
    if (sessionResult?.content?.length > 0) {
        const sessionObj = JSON.parse(decrypt(sessionResult.content))
        // Another Shopify bug
        return Shopify.Session.Session.cloneSession(sessionObj, sessionObj.id)
    }
    return undefined
    /**
     *  // Inside our try, we use `getAsync` to access the method by id
      // If we receive data back, we parse and return it
      // If not, we return `undefined`
      let reply = await firebaseDb.collection(ShopifyAuthStorage.COLLECTION_ID).doc(id).get()
      if (reply.exists) {
        const sessionObj = JSON.parse(reply.data().session);
        // See issue Shopify/shopify-node-api#333 for why we need to call cloneSession()
        // cloneSession will convert our javascript object into an instance of Session
        // cloneSession typically wants a Session object as input, but seems to also work
        // with just a plain javascript object
        return Session.cloneSession(sessionObj, sessionObj.id);
      } else {
        return undefined;
      }
     */
}

const deleteCallback = async (id) => {
    await Session.deleteById(id)
    return true
}

const sessionStorage = new Shopify.Session.CustomSessionStorage(
    storeCallback,
    loadCallback,
    deleteCallback
)

export default sessionStorage
