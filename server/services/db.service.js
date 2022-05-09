import { capUnderscoreToCamelCase } from "../../util/topics.js"
import firebaseService from "./firebase.service.js"

async function findDocById(id, collection) {
    return await firebaseService.db.findById(id, collection)
}

async function listCollection(collection) {
    return await firebaseService.db.list(collection)
}

async function createDoc(body, collection, autoId) {
    return await firebaseService.db.create(body, collection, autoId)
}

async function updateDocById(id, body, collection) {
    return await firebaseService.db.updateById(id, body, collection)
}

async function deleteDocById(id, collection) {
    return await firebaseService.db.deleteById(id, collection)
}

async function findFirstDoc(collection) {
    return await firebaseService.db.findFirst(collection)
}

export const Session = {
    async findById(id) {
        return await findDocById(id, "sessions")
    },
    async create(body) {
        return await createDoc(body, "sessions", false)
    },
    async updateById(id, body) {
        return await updateDocById(id, body, "sessions")
    },
    async deleteById(id) {
        return await deleteDocById(id, "sessions")
    },
}

export const Workflows = {
    getFileNameFromTopic(topic) {
        const fileName = capUnderscoreToCamelCase(topic) + ".js"
        return fileName
    },
    async findById(id) {
        return await findDocById(id, "workflows")
    },
    async list() {
        return await listCollection("workflows")
    },
    async create(body) {
        return await createDoc(body, "workflows")
    },
    async update(id, body) {
        return await updateDocById(id, body, "workflows")
    },
    async delete(id) {
        return await deleteDocById(id, "workflows")
    },
}

export const Settings = {
    async put(key, value) {
        const settingsData = await findFirstDoc("settings")
        if (!settingsData) {
            return await createDoc({ [key]: value }, "settings")
        }
        return await updateDocById(
            settingsData.id,
            { ...settingsData, [key]: value },
            "settings"
        )
    },
    async get(key) {
        const settingsData = await findFirstDoc("settings")
        if (!settingsData) {
            return null
        }
        return settingsData[key]
    },
}
