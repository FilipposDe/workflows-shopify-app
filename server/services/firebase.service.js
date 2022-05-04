import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

initializeApp({
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_BUCKET,
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    }),
})

const firestore = getFirestore()
const storage = getStorage()

async function findById(id, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    const data = await ref.get()
    return data
}

async function create(body, collection) {
    const ref = await firestore.collection(collection).add(body)
    const data = await ref.get()
    return data
}

async function updateById(id, body, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    await ref.update(body)
    const doc = await ref.get()
    return doc
}

async function deleteById(id, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    await ref.delete()
}

const db = {
    findById,
    create,
    updateById,
    deleteById,
}

export default {
    db,
    storage,
}
