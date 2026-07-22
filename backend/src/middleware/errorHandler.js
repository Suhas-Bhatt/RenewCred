const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Unexpected/programmer errors: log full detail, don't leak internals.
    logger.error(err);
    error = ApiError.internal();
  } else if (error.statusCode >= 500) {
    logger.error(err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    details: error.details,
  });
}

module.exports = { notFoundHandler, errorHandler };
