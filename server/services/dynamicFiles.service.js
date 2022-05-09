import path from "path"
import fs from "fs"
import { fileURLToPath, pathToFileURL } from "url"
import { Workflows } from "./db.service.js"
import eslint from "eslint"
import { capUnderscoreToCamelCase } from "../../util/topics.js"

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
    const importedFn = await import(fileUrl)
    DYNAMIC_IMPORTS[fileName] = importedFn
}

function getDynamicFilePath(fileName) {
    const filePath = path.join(__dirname, "..", "..", "storage", fileName)
    return filePath
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

function dynamicFileExists(fileName) {
    const filePath = getDynamicFilePath(fileName)
    const fileExists = fs.existsSync(filePath)
    return fileExists
}

function validateDynamicFile(fileName) {
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

export async function publishFile(fileName, code) {
    writeDynamicFile(fileName, code)
    if (!validateDynamicFile(fileName)) {
        return false
    }
    await dynamicallyImportFile(fileName)
    return true
}

export async function initServerFiles() {
    const allWorkflows = await Workflows.list()
    const invalidWorkflows = []
    for (const workflow of allWorkflows) {
        const { webhookTopic, code } = workflow
        const fileName = Workflows.getFileNameFromTopic(webhookTopic)
        if (!dynamicFileExists(fileName)) {
            writeDynamicFile(fileName, code)
        }
        if (!validateDynamicFile(fileName)) {
            invalidWorkflows.push(workflow)
            continue
        }
        await dynamicallyImportFile(fileName)
    }
}

export function getImport(fileName) {
    return DYNAMIC_IMPORTS[fileName]
}

export async function getAllFiles() {
    const dirPath = path.join(__dirname, "..", "..", "storage")
    const fileNames = []
    const dirFiles = fs.readdirSync(dirPath)
    for (const file of dirFiles) {
        fileNames.push(file)
    }
    return fileNames
}

export const validateDynamicFileAsync = (fileName) =>
    new Promise((resolve) => {
        const isValid = validateDynamicFile(fileName)
        resolve(isValid)
    })

export const getFunctionContents = (fileName) =>
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
