const { query } = require("../config/database");

const VALID_RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

/**
 * GET /api/alerts?risk_level=&page=&limit=
 * Prioritized feed of flagged contracts, newest first, joined with the
 * contract and its benchmark so the auditor sees the full picture.
 *
 * NOTE: read-only for now — the fraud_alerts table has no review_status
 * column, so "Mark Reviewed / Dismissed" is deferred until the DB team adds
 * one (see backend/README.md).
 */
async function listAlerts(req, res) {
  const { risk_level } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  if (risk_level && !VALID_RISK_LEVELS.includes(risk_level)) {
    return res.status(400).json({
      error: `risk_level must be one of: ${VALID_RISK_LEVELS.join(", ")}`,
    });
  }

  const filters = [];
  const params = [];
  if (risk_level) {
    params.push(risk_level);
    filters.push(`fa.risk_level = $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const totalRes = await query(
    `SELECT COUNT(*)::int AS total FROM fraud_alerts fa ${where}`,
    params
  );
  const total = totalRes.rows[0].total;

  params.push(limit, offset);
  const result = await query(
    `SELECT fa.alert_id, fa.risk_level, fa.variance_pct, fa.flagged_at,
            pc.contract_id, pc.supplier_name, pc.contract_date,
            pc.quantity, pc.awarded_unit_price,
            mb.item_name, mb.item_code, mb.reference_price_kes,
            ROUND((pc.awarded_unit_price - mb.reference_price_kes) * pc.quantity, 2)
              AS estimated_overpayment_kes
     FROM fraud_alerts fa
     JOIN procurement_contracts pc ON fa.contract_id = pc.contract_id
     JOIN market_baselines mb ON pc.baseline_id = mb.baseline_id
     ${where}
     ORDER BY fa.flagged_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return res.json({
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
    alerts: result.rows,
  });
}

module.exports = { listAlerts };
