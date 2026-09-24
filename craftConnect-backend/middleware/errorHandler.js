import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal server error";

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    if (err.code === 11000) {
        statusCode = 400;
        message = "Duplicate field value entered";
    }
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }
    if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "Request body is not valid JSON";
    }

    // Never leak internal details (driver errors, stack info) to clients.
    if (statusCode >= 500) {
        console.error(err.stack || err);
        statusCode = 500;
        message = "Internal server error";
    }

    return res.status(statusCode).json({
        message,
        ...(err instanceof AppError && err.code ? { code: err.code } : {}),
    });
};

export default errorHandler;
