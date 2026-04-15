// middlewares/error.js
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal server error.";
  err.statusCode = err.statusCode || 500;

  // Handle duplicate key error (MongoDB)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please login again.";
    err = new ErrorHandler(message, 401);
  }

  // Handle token expired error
  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please login again.";
    err = new ErrorHandler(message, 401);
  }

  // Handle MongoDB Cast errors (invalid ID)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map(value => value.message)
      .join(", ");
    err = new ErrorHandler(message, 400);
  }

  // Handle the error message - prioritize validation errors if they exist
  const errorMessage = err.errors 
    ? Object.values(err.errors)
        .map((value) => value.message)
        .join(", ")
    : err.message;

  // Send response
  res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default ErrorHandler;