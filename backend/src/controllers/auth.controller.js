const bcrypt = require("bcryptjs");
const { query } = require("../config/database");
const { sign } = require("../utils/jwt");
const { isEmail, isNonEmptyString } = require("../utils/validators");

const VALID_ROLES = ["admin", "auditor", "officer"];
const SALT_ROUNDS = 10;

function publicUser(row) {
  return {
    user_id: row.user_id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
  };
}

/**
 * POST /api/auth/register
 * Creates a user with a bcrypt-hashed password and returns a JWT.
 */
async function register(req, res) {
  const { full_name, email, password } = req.body || {};
  let { role } = req.body || {};
  role = role || "officer";

  if (!isNonEmptyString(full_name)) {
    return res.status(400).json({ error: "full_name is required" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  if (!isNonEmptyString(password) || password.length < 8) {
    return res
      .status(400)
      .json({ error: "password must be at least 8 characters" });
  }
  if (!VALID_ROLES.includes(role)) {
    return res
      .status(400)
      .json({ error: `role must be one of: ${VALID_ROLES.join(", ")}` });
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, full_name, email, role, created_at`,
    [full_name.trim(), email.trim().toLowerCase(), password_hash, role]
  );

  const user = result.rows[0];
  const token = sign({ user_id: user.user_id, role: user.role, email: user.email });

  return res.status(201).json({ user: publicUser(user), token });
}

/**
 * POST /api/auth/login
 * Verifies credentials, stamps last_login_at and returns a JWT.
 */
async function login(req, res) {
  const { email, password } = req.body || {};

  if (!isEmail(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const result = await query(
    `SELECT user_id, full_name, email, role, password_hash, created_at
     FROM users WHERE email = $1`,
    [email.trim().toLowerCase()]
  );

  const user = result.rows[0];
  // Constant-ish response: same message whether email or password is wrong.
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  await query(`UPDATE users SET last_login_at = NOW() WHERE user_id = $1`, [
    user.user_id,
  ]);

  const token = sign({ user_id: user.user_id, role: user.role, email: user.email });
  return res.json({ user: publicUser(user), token });
}

module.exports = { register, login };
