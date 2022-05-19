import path from "path"
import fs from "fs"
import eslint from "eslint"
import { fileURLToPath, pathToFileURL } from "url"
import dbService from "./db.service.js"
import { capUnderscoreToCamelCase } from "../../util/topics.js"
import ApiError from "../helpers/ApiError.js"
import logger from "../logger.js"
const { Workflows, Settings } = dbService

// TODO more error handling

const DYNAMIC_IMPORTS = {}
const CONSTANTS = {}

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
    try {
        const filePath = getDynamicFilePath(fileName)
        const fileUrl =
            pathToFileURL(filePath).toString() + `?update=${Date.now()}`
        const { default: importedFn } = await import(fileUrl)
        DYNAMIC_IMPORTS[fileName] = importedFn
        return importedFn
    } catch (error) {
        logger.error(error)
        return null
    }
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
    // const fileContent = `export default async function ${
    //     fileName.split(".")[0]
    //     // TODO continue work
    // }(data) {
    //     ${text}
    // }`
    // fs.writeFileSync(filePath, fileContent)
    fs.writeFileSync(filePath, text)
}

function deleteDynamicFile(fileName) {
    try {
        const filePath = getDynamicFilePath(fileName)
        fs.unlinkSync(filePath)
    } catch (error) {
        logger.error(error)
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
    const text = file.toString().trim()

    const hasOneDefaultExport =
        text.match(/^export default\s*(async?)*\sfunction/gm)?.length === 1
    if (!hasOneDefaultExport) {
        throw new Error("Did not find a single default export")
    }

    const { Linter } = eslint
    const linter = new Linter()
    const lintMessages = linter.verify(text, lintConfig)
    if (lintMessages.some((message) => message.fatal)) {
        throw new Error("Linting error")
    }

    // const functionName = fileName.split(".")[0]
    // const textStart = `export default async function ${functionName}(data) {`
    // const textEnd = `}`
    // if (!trimmed.startsWith(textStart) || !trimmed.endsWith(textEnd)) {
    //     return false
    // }
}

function addFile(fileName, code) {
    writeDynamicFile(fileName, code)
    try {
        lintDynamicFile(fileName)
    } catch (error) {
        throw new ApiError(400, "Found file validation") // TODO
    }
}

function getImport(topic) {
    const fileName = Workflows.getFileNameFromTopic(topic)
    return DYNAMIC_IMPORTS[fileName]
}

async function setConstants() {
    const constantsStr = await Settings.get("constants")
    const constants = JSON.parse(constantsStr) || []
    for (const { name, value } of constants) {
        CONSTANTS[name] = value
    }
}

function getConstants() {
    return CONSTANTS
}

function getConstant(key) {
    return CONSTANTS[key]
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
            try {
                lintDynamicFile(fileName)
            } catch (error) {
                logger.error(error)
                throw new Error(`Found invalid code in ${fileName}, exiting.`)
            }
            validTopics.push(topic)
            await dynamicallyImportFile(fileName)
        }

        return validTopics
    } catch (error) {
        logger.error("Error initializing handler, exiting.", error)
        process.exit()
    }
}

const lintDynamicFileAsync = (fileName) =>
    new Promise((resolve, reject) => {
        try {
            const isValid = lintDynamicFile(fileName)
            resolve(isValid)
        } catch (error) {
            reject(error)
        }
    })

const getFunctionContents = (fileName) =>
    new Promise((resolve) => {
        const filePath = getDynamicFilePath(fileName)
        const text = fs.readFileSync(filePath, { encoding: "utf8" })
        const trimmed = text.toString().trim()
        let result = trimmed
        // let result = ""
        // result = trimmed.replace(
        //     /^\s*export default async function [a-zA-Z]*\(data\) {\s*/,
        //     ""
        // )
        // result = result.replace(/}\s*$/, "")
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
    getConstants,
    setConstants,
    getConstant,
}

export default dynamicFilesService
