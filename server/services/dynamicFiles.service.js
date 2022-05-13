import path from "path"
import fs from "fs"
import eslint from "eslint"
import { fileURLToPath, pathToFileURL } from "url"
import dbService from "./db.service.js"
import { capUnderscoreToCamelCase } from "../../util/topics.js"
import ApiError from "../helpers/ApiError.js"
const { Workflows } = dbService

const DYNAMIC_IMPORTS = {}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const lintConfig = {
    env: {
        es2021: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
}

async function dynamicallyImportFile(fileName) {
    const filePath = getDynamicFilePath(fileName)
    const fileUrl = pathToFileURL(filePath).toString()
    const { default: importedFn } = await import(fileUrl)
    DYNAMIC_IMPORTS[fileName] = importedFn
    return importedFn
}

function getDynamicFilePath(fileName) {
    const filePath = path.join(__dirname, "..", "..", "storage", fileName)
    return filePath
}

function deleteImport(key) {
    delete DYNAMIC_IMPORTS[key]
}

function writeDynamicFile(fileName, text) {
    const filePath = getDynamicFilePath(fileName)
    const fileContent = `export default async function ${
        fileName.split(".")[0]
        // TODO continue work
    }(data) {
        ${text}
    }`
    fs.writeFileSync(filePath, fileContent)
}

function deleteDynamicFile(fileName) {
    try {
        const filePath = getDynamicFilePath(fileName)
        fs.unlinkSync(filePath)
    } catch (error) {
        console.error(error)
        throw new Error(`Failed to delete file ${fileName}`)
    }
}

function dynamicFileExists(fileName) {
    const filePath = getDynamicFilePath(fileName)
    const fileExists = fs.existsSync(filePath)
    return fileExists
}

function lintDynamicFile(fileName) {
    const filePath = getDynamicFilePath(fileName)
    const file = fs.readFileSync(filePath, { encoding: "utf8" })
    const text = file.toString()
    const functionName = fileName.split(".")[0]
    const textStart = `export default async function ${functionName}(data) {`
    const textEnd = `}`
    const trimmed = text.trim()
    if (!trimmed.startsWith(textStart) || !trimmed.endsWith(textEnd)) {
        return false
    }
    const { Linter } = eslint
    const linter = new Linter()
    const lintMessages = linter.verify(trimmed, lintConfig)
    if (lintMessages.some((message) => message.fatal)) {
        return false
    }
    return true
}

function addFile(fileName, code) {
    writeDynamicFile(fileName, code)
    if (!lintDynamicFile(fileName)) {
        throw new ApiError(400, "Found linting errors") // TODO
    }
}

// async function publishFile(fileName, code) {
//     writeDynamicFile(fileName, code)
//     if (!lintDynamicFile(fileName)) {
//         return false
//     }
//     await dynamicallyImportFile(fileName)
//     return true
// }

function getImport(topic) {
    const fileName = Workflows.getFileNameFromTopic(topic)
    return DYNAMIC_IMPORTS[fileName]
}

async function initServerFiles() {
    try {
        const allWorkflows = await Workflows.list()
        const publishedWorkflows = allWorkflows.filter((item) => item.published)
        // const invalidWorkflows = []
        const validTopics = []
        for (const workflow of publishedWorkflows) {
            const { topic, code } = workflow
            const fileName = Workflows.getFileNameFromTopic(topic)
            if (!dynamicFileExists(fileName)) {
                writeDynamicFile(fileName, code)
            }
            if (!lintDynamicFile(fileName)) {
                // TODO
                throw new Error(`Found invalid code in ${fileName}, exiting.`)
                // invalidWorkflows.push(workflow)
                // continue
            }
            validTopics.push(topic)
            await dynamicallyImportFile(fileName)
        }

        return validTopics
    } catch (error) {
        console.error("Error initializing handler, exiting.", error)
        process.exit()
    }
}

async function getAllFiles() {
    const dirPath = path.join(__dirname, "..", "..", "storage")
    const fileNames = []
    const dirFiles = fs.readdirSync(dirPath)
    for (const file of dirFiles) {
        fileNames.push(file)
    }
    return fileNames
}

const lintDynamicFileAsync = (fileName) =>
    new Promise((resolve) => {
        const isValid = lintDynamicFile(fileName)
        resolve(isValid)
    })

const getFunctionContents = (fileName) =>
    new Promise((resolve) => {
        const filePath = getDynamicFilePath(fileName)
        const text = fs.readFileSync(filePath, { encoding: "utf8" })
        const trimmed = text.toString().trim()
        let result = ""
        result = trimmed.replace(
            /^\s*export default async function [a-zA-Z]*\(data\) {\s*/,
            ""
        )
        result = result.replace(/}\s*$/, "")
        resolve(result)
    })

const dynamicFilesService = {
    dynamicallyImportFile,
    addFile,
    deleteImport,
    deleteDynamicFile,
    lintDynamicFileAsync,
    getFunctionContents,
    initServerFiles,
    getImport,
    dynamicFileExists,
}

export default dynamicFilesService
