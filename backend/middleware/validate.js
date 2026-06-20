const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array({ onlyFirstError: true });
  console.error("[validation] Errors:", JSON.stringify(details, null, 2));
  const message = details.map((e) => `${e.path}: ${e.msg}`).join(", ");
  return next(new AppError(message, 400));
};

module.exports = validate;
