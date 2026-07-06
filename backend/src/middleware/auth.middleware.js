const { verify } = require("../utils/jwt");

/**
 * JWT authentication middleware. Runs on every protected route:
 *  - extracts the Bearer token from the Authorization header
 *  - verifies the signature and expiry
 *  - attaches the decoded user to req.user
 * Rejects missing / invalid / expired tokens with 401.
 */
function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const decoded = verify(token);
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
      email: decoded.email,
    };
    return next();
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    return res
      .status(401)
      .json({ error: expired ? "Token expired" : "Invalid token" });
  }
}

/**
 * Role-gating middleware factory. Use after verifyToken.
 * Example: router.post("/", verifyToken, requireRole("admin", "auditor"), handler)
 */
function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Insufficient role for this action" });
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };
