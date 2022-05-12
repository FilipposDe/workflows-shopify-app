import { capUnderscoreToCamelCase } from "../../util/topics.js"
import firebaseService from "./firebase.service.js"

function init() {
    try {
        firebaseService.db.initDB()
        console.log("App: Initialized DB")
    } catch (error) {
        console.error("Failed to init DB, exiting.", error)
        process.exit(1)
    }
}

async function findDocById(id, collection) {
    try {
        return await firebaseService.db.findById(id, collection)
    } catch (error) {
        console.error("DB Error", error)
        throw new Error("DB Error")
    }
}

async function listCollection(collection) {
    try {
        return await firebaseService.db.list(collection)
    } catch (error) {
        console.error("DB Error", error)
        throw new Error("DB Error")
    }
}

async function createDoc(body, collection, autoId) {
    try {
        return await firebaseService.db.create(body, collection, autoId)
    } catch (error) {
        console.error("DB Error", error)
        throw new Error("DB Error")
    }
}

async function updateDocById(id, body, collection) {
    try {
        return await firebaseService.db.updateById(id, body, collection)
    } catch (error) {
        console.error("DB Error", error)
        throw new Error("DB Error")
    }
}

async function deleteDocById(id, collection) {
    try {
        return await firebaseService.db.deleteById(id, collection)
    } catch (error) {
        console.error("DB Error", error)
        throw new Error("DB Error")
    }
}

async function findFirstDoc(collection) {
    try {
        return await firebaseService.db.findFirst(collection)
    } catch (error) {
        console.error("DB Error", error)
        throw new Error("DB Error")
    }
}

const Session = {
    async list() {
        return await listCollection("sessions")
    },
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

const Workflows = {
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

const Settings = {
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

const models = {
    Session,
    Workflows,
    Settings,
}

const dbService = {
    init,
    ...models,
}

export default dbService
