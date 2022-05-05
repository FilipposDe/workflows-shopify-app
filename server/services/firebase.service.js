import { initializeApp, cert, applicationDefault } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

let credential
if (process.env.NODE_ENV === "development") {
    credential = cert(applicationDefault())
} else {
    credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    })
}

initializeApp({
    databaseURL: process.env.FIREBASE_DB_URL,
    storageBucket: process.env.FIREBASE_BUCKET,
    credential,
})

const firestore = getFirestore()
const storage = getStorage()

async function findById(id, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    const data = await (await ref.get()).data()
    console.log("F", data)
    return data
}

async function findFirst(collection) {
    const refs = await firestore.collection(collection).listDocuments()
    const data = await refs?.[0]?.get()?.data()
    return data
}

async function create(body, collection) {
    const collectionRef = await firestore.collection(collection)
    const ref = collectionRef.doc(body.id)
    await ref.set(body)
    // const ref = await firestore.doc()

    // const ref = await firestore.doc().set(body)

    const data = (await ref.get()).data()
    console.log("C", data)
    return data
}

async function updateById(id, body, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    await ref.update(body)
    const data = (await ref.get()).data()
    console.log("Y", data)
    return data
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
    findFirst,
}

const firebaseService = {
    db,
    storage,
}

export default firebaseService
