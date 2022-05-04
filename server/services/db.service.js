import firebaseService from "./firebase.service"

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

const Session = {
    async findById(id) {
        return await findDocById(id, "sessions")
    },
    async create(body) {
        return await createDoc(body, "sessions")
    },
    async update(id, body) {
        return await updateDocById(id, body, "sessions")
    },
    async delete(id) {
        return await deleteDocById(id, "sessions")
    },
}

export { Session }
