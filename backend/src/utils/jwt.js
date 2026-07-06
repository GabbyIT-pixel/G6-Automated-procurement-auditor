const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_insecure_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

if (!process.env.JWT_SECRET) {
  console.warn(
    "[jwt] JWT_SECRET is not set — using an insecure development fallback. " +
      "Set JWT_SECRET in the root .env before deploying."
  );
}

/**
 * Sign a JWT for an authenticated user.
 * @param {{ user_id: string, role: string, email: string }} payload
 */
function sign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT and return its decoded payload. Throws if invalid/expired.
 */
function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { sign, verify };
