// ./middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";

  // Log the error for server side debugging
  console.error(err);

  // Respond with the error
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
};
