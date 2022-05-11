import { initializeApp, cert, applicationDefault } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import config from "../config.js"

let firestore
let storage

function initDB() {
    let credential
    if (config.isDev) {
        credential = cert(applicationDefault())
    } else {
        credential = cert({
            projectId: config.FIREBASE_PROJECT_ID,
            clientEmail: config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            privateKey: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        })
    }

    initializeApp({
        databaseURL: config.FIREBASE_DB_URL,
        storageBucket: config.FIREBASE_BUCKET,
        credential,
    })

    firestore = getFirestore()
    storage = getStorage()
}

async function list(collection) {
    const collectionRef = await firestore.collection(collection)
    const querySnapshot = await collectionRef.get()
    const docs = await querySnapshot.docs
    const data = docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    return data
}

async function findById(id, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    const data = await (await ref.get()).data()
    return data
}

async function findFirst(collection) {
    const collectionRef = await firestore.collection(collection)
    const querySnapshot = await collectionRef.get()
    const docs = await querySnapshot.docs
    const data = docs[0]?.data()
    if (!data) {
        return null
    }
    return { ...data, id: docs[0].id }
}

async function create(body, collection, autoId = true) {
    const collectionRef = await firestore.collection(collection)
    let ref
    if (autoId) {
        ref = await collectionRef.doc()
    } else {
        ref = await collectionRef.doc(body.id)
    }
    await ref.set(body)
    const data = (await ref.get()).data()
    return data
}

async function updateById(id, body, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    await ref.update(body)
    const data = (await ref.get()).data()
    return data
}

async function deleteById(id, collection) {
    const ref = await firestore.doc(`${collection}/${id}`)
    await ref.delete()
}

const db = {
    initDB,
    findById,
    create,
    updateById,
    deleteById,
    findFirst,
    list,
}

const firebaseService = {
    db,
    storage,
}

export default firebaseService
