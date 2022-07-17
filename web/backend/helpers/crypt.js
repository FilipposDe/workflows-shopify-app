import crypto from "crypto"
import config from "../config.js"

export function encrypt(text) {
    if (!text) return null
    const iv = crypto.randomBytes(16)
    const hash = crypto.createHash("sha256")
    hash.update(config.SERVER_SECRET)
    const key = hash.digest("hex").slice(0, 32)
    const cipher = crypto.createCipheriv("aes-256-ctr", key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const result = `${iv.toString("hex")}|${encrypted.toString("hex")}`
    return result
}

export function decrypt(text) {
    if (!text) return null
    let decrypted = null
    try {
        const hash = crypto.createHash("sha256")
        hash.update(config.SERVER_SECRET)
        const key = hash.digest("hex").slice(0, 32)
        const input = text.split("|")
        const iv = Buffer.from(input[0], "hex")
        const encryptedText = Buffer.from(input[1], "hex")
        const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv)
        decrypted = decipher.update(encryptedText)
        decrypted = Buffer.concat([decrypted, decipher.final()])
    } catch (error) {
        // TODO handle and throw error
        console.error("error")
        return null
    }
    return decrypted.toString()
}
