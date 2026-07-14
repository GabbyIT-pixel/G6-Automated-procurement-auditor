// Load environment from the backend root .env using an absolute path so it
// works regardless of the current working directory. dotenv does not override
// variables that are already set, so this is safe alongside config/database.js.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const contractRoutes = require("./routes/contract.routes");
const alertRoutes = require("./routes/alert.routes");
const benchmarkRoutes = require("./routes/benchmark.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ── Security layer (architecture diagram) ──────────────────────────────
app.use(helmet());
// CORS middleware - allow all origins for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.json({ limit: "1mb" }));

// Rate-limit the auth endpoints to slow down credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again later" },
});

// ── Root / status endpoint ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "procurement-auditor-api", message: "Welcome to the Procurement Auditor backend" });
});

// ── Health check ────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "procurement-auditor-api" });
});

// ── Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/benchmarks", benchmarkRoutes);

// ── Error handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
