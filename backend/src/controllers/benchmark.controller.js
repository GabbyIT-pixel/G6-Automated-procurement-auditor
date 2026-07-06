const { query } = require("../config/database");

/**
 * GET /api/benchmarks?category=&search=
 * Public list of KEMSA reference prices. Feeds the contract-entry form and the
 * audit engine (per the architecture diagram, this endpoint needs no auth).
 */
async function listBenchmarks(req, res) {
  const { category, search } = req.query;

  const filters = [];
  const params = [];
  if (category) {
    params.push(category);
    filters.push(`category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    filters.push(`LOWER(item_name) LIKE $${params.length}`);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const result = await query(
    `SELECT baseline_id, item_name, item_code, unit_of_measure, category,
            reference_price_kes, price_source, price_verified_date, tolerance_pct
     FROM market_baselines
     ${where}
     ORDER BY item_name ASC`,
    params
  );

  return res.json({ count: result.rows.length, benchmarks: result.rows });
}

module.exports = { listBenchmarks };
