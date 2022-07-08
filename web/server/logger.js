import winston from "winston"

import Transport from "winston-transport"
import config from "./config.js"
import dbService from "./services/db.service.js"

const { Logs } = dbService

const MAX_FIRESTORE_CAP = 1000

class FirebaseTransport extends Transport {
    constructor(opts) {
        super(opts)
        this.counter = 0
        // this.updateDBCount()
    }

    async log(info, callback) {
        const { level, message = "", metadata } = info
        const date = new Date()
        try {
            await Logs.create({
                id: date.toISOString(),
                level,
                message,
                date: date.getTime(),
                metadata: hasMeta(metadata) ? JSON.stringify(metadata) : null,
            })
            this.counter++
            if (this.counter % 500 === 0) {
                this.checkCapSize()
            }
            callback(null, true)
        } catch (error) {
            console.error(error)
            callback()
        }
    }

    async updateDBCount() {
        try {
            this.lastMeasuredDBCount = await Logs.count()
        } catch (error) {
            console.error(error)
        }
    }

    async cleanUp(count) {
        await Logs.deleteEntriesFromEnd(count)
    }

    async checkCapSize() {
        await this.updateDBCount()
        const exceedCount = this.lastMeasuredDBCount - MAX_FIRESTORE_CAP
        if (exceedCount > 0) {
            await this.cleanUp(exceedCount)
        }
    }
}

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack })
    }
    return info
})

function hasMeta(meta) {
    return Object?.keys(meta)?.length
}

export function initLogger() {
    try {
        return winston.createLogger({
            level: config.NODE_ENV === "development" ? "debug" : "info",
            format: winston.format.combine(
                enumerateErrorFormat(),
                winston.format.metadata(),
                winston.format.splat()
            ),
            transports: [
                new winston.transports.Console({
                    stderrLevels: ["error"],
                    format: winston.format.combine(
                        config.NODE_ENV === "development"
                            ? winston.format.colorize()
                            : winston.format.uncolorize(),
                        winston.format.printf(
                            ({ level, message, metadata }) =>
                                `${level}: ${message} ${
                                    hasMeta(metadata)
                                        ? JSON.stringify(metadata)
                                        : ""
                                }`
                        )
                    ),
                }),
                new FirebaseTransport({
                    level: "error",
                    format: winston.format.combine(
                        winston.format.uncolorize()
                        // winston.format.printf(
                        //     ({ level, message, metadata }) =>
                        //         `${level}: ${message} ${JSON.stringify(
                        //             metadata
                        //         )}`
                        // )
                    ),
                }),
            ],
        })
    } catch (error) {
        console.error("Error initializing logger service, exiting.", error)
        process.exit(1)
    }
}

let logger

if (!logger) logger = initLogger()

export default logger
