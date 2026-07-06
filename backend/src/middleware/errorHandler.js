/** 404 handler for unmatched routes. */
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler. Translates known PostgreSQL error codes into clean
 * HTTP responses and hides internal details in non-development environments.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Postgres unique_violation (e.g. duplicate email)
  if (err.code === "23505") {
    return res.status(409).json({ error: "Resource already exists" });
  }
  // Postgres foreign_key_violation (e.g. unknown baseline_id / user_id)
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced record does not exist" });
  }
  // Postgres check_violation (e.g. bad role / negative price)
  if (err.code === "23514") {
    return res.status(400).json({ error: "A value violates a data constraint" });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error("[error]", err);
  }
  res.status(status).json({
    error: err.expose ? err.message : status >= 500 ? "Internal server error" : err.message,
  });
}

module.exports = { notFound, errorHandler };
