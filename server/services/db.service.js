import firebaseService from "./firebase.service.js"

async function findDocById(id, collection) {
    return await firebaseService.db.findById(id, collection)
}

async function createDoc(body, collection) {
    return await firebaseService.db.create(body, collection)
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
        return await createDoc(body, "sessions")
    },
    async updateById(id, body) {
        return await updateDocById(id, body, "sessions")
    },
    async deleteById(id) {
        return await deleteDocById(id, "sessions")
    },
}

export const Settings = {
    async put(key, value) {
        const settingsData = await findFirstDoc("settings")
        if (!settingsData) {
            return await createDoc({ key: value }, "settings")
        }
        return await updateDocById(
            settingsData.id,
            { ...settingsData, key: value },
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
