const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    let statusCode = err.statusCode || 500;
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

    return res.status(statusCode).json({
        message,
    });
};

export default errorHandler;
