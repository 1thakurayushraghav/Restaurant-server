const { ApiError } = require("../utils/apiResponse");

// 404 handler — mount after all routes
function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`, "NOT_FOUND"));
}

// Centralized error handler — mount last
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";
  let code = err.code || "SERVER_ERROR";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_KEY";
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : "Duplicate value";
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid identifier provided";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" && statusCode === 500 ? "Something went wrong" : message,
    code,
  });
}

module.exports = { notFound, errorHandler, ApiError };
