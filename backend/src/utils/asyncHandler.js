/**
 * Wraps an async Express handler so any thrown/rejected error is forwarded
 * to the central error-handling middleware instead of crashing the process.
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
