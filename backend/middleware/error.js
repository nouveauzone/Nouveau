const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    const method = req?.method || "UNKNOWN";
    const url = req?.originalUrl || req?.url || "unknown-url";
    console.error(`[server-error] ${method} ${url}: ${err.message}`);
    if (err?.stack) console.error(err.stack);
  }

  const payload = {
    status: err.status || (statusCode >= 500 ? "error" : "fail"),
    message: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = { notFound, errorHandler };
