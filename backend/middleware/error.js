/**
 * Error Handling Middleware
 * Centralized error handling for Express routes
 */

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}

/**
 * Error Handler
 * Global error handler for all errors
 */
function errorHandler(err, req, res, next) {
  // Default to 500 if no status code is set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });

  // Log error details
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
};
