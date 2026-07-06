const { pool, query } = require("../config/database");
const audit = require("../services/audit.service");
const {
  isNonEmptyString,
  isUuid,
  isPositiveNumber,
  isPositiveInteger,
  isValidPastOrTodayDate,
} = require("../utils/validators");

/**
 * POST /api/contracts
 * Validates the submission, runs the audit engine against the KEMSA baseline,
 * inserts the contract and — when the risk is Medium or above — auto-inserts a
 * fraud alert. Contract + alert are written in a single transaction so the
 * ledger and the alert feed can never disagree.
 */
async function createContract(req, res) {
  const {
    baseline_id,
    supplier_name,
    contract_date,
    quantity,
    awarded_unit_price,
  } = req.body || {};

  // ── Field validation (mirrors the DB CHECK constraints) ──────────────
  const errors = [];
  if (!isUuid(baseline_id)) errors.push("baseline_id must be a valid UUID");
  if (!isNonEmptyString(supplier_name)) errors.push("supplier_name is required");
  if (!isValidPastOrTodayDate(contract_date))
    errors.push("contract_date must be a valid date, not in the future");
  if (!isPositiveInteger(quantity)) errors.push("quantity must be a positive integer");
  if (!isPositiveNumber(awarded_unit_price))
    errors.push("awarded_unit_price must be greater than zero");
  if (errors.length) return res.status(400).json({ errors });

  // ── Look up the benchmark that this contract is measured against ──────
  const baselineRes = await query(
    `SELECT baseline_id, item_name, item_code, unit_of_measure,
            reference_price_kes, tolerance_pct
     FROM market_baselines WHERE baseline_id = $1`,
    [baseline_id]
  );
  const baseline = baselineRes.rows[0];
  if (!baseline) {
    return res.status(404).json({ error: "Unknown baseline_id" });
  }

  // ── Run the audit engine (pure) ──────────────────────────────────────
  const { variancePct, riskLevel, flagged } = audit.runAudit(
    awarded_unit_price,
    baseline.reference_price_kes
  );

  // ── Persist contract (+ alert) atomically ────────────────────────────
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const contractRes = await client.query(
      `INSERT INTO procurement_contracts
         (user_id, baseline_id, supplier_name, contract_date, quantity, awarded_unit_price)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING contract_id, user_id, baseline_id, supplier_name,
                 contract_date, quantity, awarded_unit_price, created_at`,
      [
        req.user.user_id,
        baseline_id,
        supplier_name.trim(),
        contract_date,
        quantity,
        awarded_unit_price,
      ]
    );
    const contract = contractRes.rows[0];

    let alert = null;
    if (flagged) {
      const alertRes = await client.query(
        `INSERT INTO fraud_alerts (contract_id, risk_level, variance_pct)
         VALUES ($1, $2, $3)
         RETURNING alert_id, contract_id, risk_level, variance_pct, flagged_at`,
        [contract.contract_id, riskLevel, variancePct]
      );
      alert = alertRes.rows[0];
    }

    await client.query("COMMIT");

    return res.status(201).json({
      contract,
      audit: {
        item_name: baseline.item_name,
        reference_price_kes: baseline.reference_price_kes,
        awarded_unit_price: contract.awarded_unit_price,
        variance_pct: variancePct,
        risk_level: riskLevel,
        flagged,
      },
      alert,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * GET /api/contracts?page=&limit=
 * Paginated contract ledger joined with its benchmark item.
 */
async function listContracts(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const totalRes = await query(`SELECT COUNT(*)::int AS total FROM procurement_contracts`);
  const total = totalRes.rows[0].total;

  const result = await query(
    `SELECT pc.contract_id, pc.supplier_name, pc.contract_date, pc.quantity,
            pc.awarded_unit_price, pc.created_at,
            mb.item_name, mb.item_code, mb.unit_of_measure, mb.reference_price_kes,
            u.full_name AS submitted_by,
            fa.alert_id, fa.risk_level, fa.variance_pct, fa.flagged_at
     FROM procurement_contracts pc
     JOIN market_baselines mb ON pc.baseline_id = mb.baseline_id
     JOIN users u ON pc.user_id = u.user_id
     LEFT JOIN fraud_alerts fa ON fa.contract_id = pc.contract_id
     ORDER BY pc.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return res.json({
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
    contracts: result.rows,
  });
}

module.exports = { createContract, listContracts };
