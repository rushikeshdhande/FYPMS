// middlewares/error.js
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Default values
  let error = { ...err };
  error.message = err.message || "Internal server error.";
  error.statusCode = err.statusCode || 500;

  // Log error for debugging (in production, use logging service)
  if (process.env.NODE_ENV === "development") {
    console.error("Error Details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    // Production: Log error to file or monitoring service
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  }

  // Handle duplicate key error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists. Please use a different ${field}.`;
    error = new ErrorHandler(message, 400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please login again.";
    error = new ErrorHandler(message, 401);
  }

  // Handle token expired error
  if (err.name === "TokenExpiredError") {
    const message = "Session expired. Please login again.";
    error = new ErrorHandler(message, 401);
  }

  // Handle MongoDB Cast errors (invalid ID)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}. Resource not found.`;
    error = new ErrorHandler(message, 400);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map(value => value.message)
      .join(", ");
    error = new ErrorHandler(message, 400);
  }

  // Handle mongoose bad format errors
  if (err.name === "BSONError" || err.name === "MongoServerError") {
    const message = "Invalid data format. Please check your input.";
    error = new ErrorHandler(message, 400);
  }

  // Handle rate limiting errors
  if (err.name === "RateLimitError") {
    const message = "Too many requests. Please try again later.";
    error = new ErrorHandler(message, 429);
  }

  // Handle file upload errors
  if (err.name === "MulterError") {
    let message = "File upload error.";
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 5MB.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files. Maximum allowed is 5.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field.";
    }
    error = new ErrorHandler(message, 400);
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    message: error.message,
  };

  // Add stack trace only in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.errorType = err.name;
    errorResponse.path = req.path;
    errorResponse.method = req.method;
  }

  // For production, don't expose internal error details
  if (process.env.NODE_ENV === "production" && error.statusCode === 500) {
    errorResponse.message = "Something went wrong. Please try again later.";
  }

  res.status(error.statusCode).json(errorResponse);
};

export default ErrorHandler;