/* =========================================================
   MIDDLEWARE — Global Error Handler
   Catches errors passed via next(err) and returns
   a consistent JSON error response.
========================================================= */

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message    = err.message    || "Internal server error";

    // ── Mongoose validation error ─────────────────────
    if (err.name === "ValidationError") {
        statusCode = 400;
        const messages = Object.values(err.errors).map((e) => e.message);
        message = messages.join(". ");
    }

    // ── Mongoose duplicate key (unique field violation) ─
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `A record with this ${field} already exists`;
    }

    // ── Mongoose CastError (invalid ObjectId format) ──
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // ── JWT errors ────────────────────────────────────
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token. Please log in again.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Your session has expired. Please log in again.";
    }

    // ── Log in development ────────────────────────────
    if (process.env.NODE_ENV === "development") {
        console.error("❌ Error:", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
