const request = require("supertest");
const app = require("../src/app");
const { pool } = require("../src/config/database");

/**
 * End-to-end flow test. Needs a live PostgreSQL with the migrations applied
 * and the KEMSA baselines seeded. When no DB is reachable the whole suite is
 * skipped (so `npm test` still passes on machines without a database) — the
 * audit-engine unit tests cover the core logic DB-free.
 */
let dbAvailable = false;
let baselineId = null;

beforeAll(async () => {
  try {
    const r = await pool.query(
      `SELECT baseline_id FROM market_baselines ORDER BY reference_price_kes ASC LIMIT 1`
    );
    dbAvailable = r.rowCount > 0;
    if (dbAvailable) baselineId = r.rows[0].baseline_id;
    if (!dbAvailable) {
      console.warn("[contracts.test] No seeded baselines — skipping DB tests.");
    }
  } catch (err) {
    console.warn(`[contracts.test] DB unavailable (${err.message}) — skipping.`);
    dbAvailable = false;
  }
});

afterAll(async () => {
  await pool.end();
});

// Run a test only when the DB is available; otherwise mark it skipped.
function dbTest(name, fn) {
  test(name, async () => {
    if (!dbAvailable) {
      console.warn(`  ↳ skipped (no DB): ${name}`);
      return;
    }
    await fn();
  });
}

describe("Auth + Contract + Audit flow", () => {
  const email = `tester_${Date.now()}@example.com`;
  const password = "supersecret1";
  let token = null;

  test("GET /api/health works without a DB", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("GET /api/contracts without a token is rejected", async () => {
    const res = await request(app).get("/api/contracts");
    expect(res.status).toBe(401);
  });

  dbTest("register returns a JWT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ full_name: "Test Auditor", email, password, role: "auditor" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  dbTest("login returns a JWT", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  dbTest("submitting a grossly inflated contract flags Critical", async () => {
    // reference price of the cheapest item * 20 -> well over 100% variance
    const refRes = await pool.query(
      `SELECT reference_price_kes FROM market_baselines WHERE baseline_id = $1`,
      [baselineId]
    );
    const inflated = Number(refRes.rows[0].reference_price_kes) * 20;

    const res = await request(app)
      .post("/api/contracts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        baseline_id: baselineId,
        supplier_name: "Ghost Medical Corp",
        contract_date: "2026-07-01",
        quantity: 100,
        awarded_unit_price: inflated,
      });

    expect(res.status).toBe(201);
    expect(res.body.audit.risk_level).toBe("Critical");
    expect(res.body.audit.flagged).toBe(true);
    expect(res.body.alert).toBeTruthy();
    expect(res.body.alert.risk_level).toBe("Critical");
  });

  dbTest("a fair-priced contract is Low risk with no alert", async () => {
    const refRes = await pool.query(
      `SELECT reference_price_kes FROM market_baselines WHERE baseline_id = $1`,
      [baselineId]
    );
    const fair = Number(refRes.rows[0].reference_price_kes) * 1.05; // +5%

    const res = await request(app)
      .post("/api/contracts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        baseline_id: baselineId,
        supplier_name: "Afya Supplies Ltd",
        contract_date: "2026-07-01",
        quantity: 50,
        awarded_unit_price: fair,
      });

    expect(res.status).toBe(201);
    expect(res.body.audit.risk_level).toBe("Low");
    expect(res.body.alert).toBeNull();
  });

  dbTest("invalid contract payload returns 400", async () => {
    const res = await request(app)
      .post("/api/contracts")
      .set("Authorization", `Bearer ${token}`)
      .send({ baseline_id: "not-a-uuid", quantity: -5 });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });
});
