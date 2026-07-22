const ApiError = require('../utils/ApiError');

// Validates req.body (default) or another req property against a Zod schema.
// Replaces req[property] with the parsed (and thus coerced/defaulted) value.
const validate = (schema, property = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[property]);
  if (!result.success) {
    return next(ApiError.badRequest('Validation failed', result.error.flatten()));
  }
  req[property] = result.data;
  return next();
};

module.exports = validate;
