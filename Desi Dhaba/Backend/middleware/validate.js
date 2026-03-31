const { validationResult } = require("express-validator");

/**
 * Central validation error handler.
 * Place this AFTER express-validator check() chains in any route.
 * Returns 422 with array of field errors if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = validate;
