const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "procurement_auditor",
  max:              10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const dbConfigSummary = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  database: process.env.DB_NAME || "procurement_auditor",
};

pool.on("connect", () => {
  console.log("New client connected to PostgreSQL pool");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

async function testConnection() {
  try {
    console.log("Attempting PostgreSQL connection:", dbConfigSummary);
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() AS current_time");
    client.release();
    console.log("PostgreSQL connected — DB time:", result.rows[0].current_time);
  } catch (err) {
    console.error("PostgreSQL target:", dbConfigSummary);
    console.error("PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
}

async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

module.exports = { pool, query, testConnection };
