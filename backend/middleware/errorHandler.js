// Centralized error handler. Keeps route/controller code free of repeated
// try/catch boilerplate for the response-formatting part of error handling.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
}

module.exports = { errorHandler };
