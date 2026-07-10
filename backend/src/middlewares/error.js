import ApiError from "../utils/apiError.js";
import { isProduction } from "../config/index.js";

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;

  if (err.code === 11000) {
    statusCode = 409;
    message = "Email is already registered";
  }

  if (!statusCode) {
    statusCode = 500;
  }

  if (statusCode === 500) {
    console.error(err);
    if (isProduction) message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(!isProduction && statusCode === 500 && { stack: err.stack }),
  });
};
