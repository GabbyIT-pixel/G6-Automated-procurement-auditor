/**
 * Small, dependency-free field validators. Each returns true/false so
 * controllers can build clean 400 responses that mirror the DB CHECK
 * constraints (fail fast in the app before hitting PostgreSQL).
 */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isEmail(v) {
  return isNonEmptyString(v) && EMAIL_RE.test(v.trim());
}

function isUuid(v) {
  return isNonEmptyString(v) && UUID_RE.test(v.trim());
}

function isPositiveNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

function isPositiveInteger(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
}

/**
 * Accepts a YYYY-MM-DD (or ISO) date string that is a real date and not in
 * the future (mirrors chk_contracts_date_not_future).
 */
function isValidPastOrTodayDate(v) {
  if (!isNonEmptyString(v)) return false;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return d.getTime() <= today.getTime();
}

module.exports = {
  isNonEmptyString,
  isEmail,
  isUuid,
  isPositiveNumber,
  isPositiveInteger,
  isValidPastOrTodayDate,
};
