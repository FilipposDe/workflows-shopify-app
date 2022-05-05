import ApiError from "./../helpers/ApiError.js"

export const errorConverter = (err, req, res, next) => {
    let error = err
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode ? 400 : 500
        const statusCodeMessage = error.statusCode
            ? "Bad request"
            : "Internal server error"
        const message = error.message || statusCodeMessage
        error = new ApiError(statusCode, message, false, err.stack)
    }
    next(error)
}

export const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err
    if (process.env.NODE_ENV === "production" && !err.isOperational) {
        statusCode = 500
        message = "Internal server error"
    }

    res.locals.errorMessage = err.message

    const response = {
        code: statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    }

    if (process.env.NODE_ENV === "development") {
        console.error(err)
    }

    res.status(statusCode).send(response)
}
