# Procurement Auditor — Backend API

REST API (Tier 2) for the **G6 Automated Public Health Procurement Auditor**.
Node.js + Express + PostgreSQL. It ingests procurement contracts, compares the
awarded price against KEMSA benchmark prices, scores the risk, and auto-flags
suspicious contracts for human review.

## Stack
- Node.js + Express 5
- PostgreSQL (`pg` pool — see `src/config/database.js`)
- JWT auth (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`)
- Security: `helmet`, CORS restricted to the frontend origin, `express-rate-limit` on `/api/auth`
- Tests: `jest` + `supertest`

## Setup
1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Ensure PostgreSQL is running and the `procurement_auditor` database exists with
   the migrations in `../database/migrations/` applied (users, market_baselines,
   procurement_contracts, fraud_alerts).
3. Populate the project **root** `.env` (copy keys from `backend/.env.example`):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   DB_NAME=procurement_auditor
   JWT_SECRET=<long random string>
   JWT_EXPIRES_IN=8h
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   ```
4. (Optional) seed KEMSA benchmarks: `npm run seed`.

## Run
```bash
npm run dev     # nodemon, auto-reload
npm start       # production start
npm test        # jest (audit-engine unit tests + guarded e2e flow)
```
The server logs `PostgreSQL connected` on a healthy boot.

## Audit engine
`variance_pct = ((awarded_unit_price − reference_price_kes) / reference_price_kes) × 100`

| Variance | Risk | Alert? |
|---|---|---|
| < 15% | Low | no |
| 15–40% | Medium | yes |
| 40–100% | High | yes |
| > 100% | Critical | yes |

Prices at/below benchmark are Low risk. The contract insert and its fraud-alert
insert run in a single transaction. Logic lives in `src/services/audit.service.js`
(pure/DB-free, fully unit tested).

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | public | liveness check |
| POST | `/api/auth/register` | public | create user, returns JWT |
| POST | `/api/auth/login` | public | login, returns JWT |
| POST | `/api/contracts` | Bearer | submit contract → runs audit → returns risk + alert |
| GET | `/api/contracts?page=&limit=` | Bearer | paginated ledger |
| GET | `/api/alerts?risk_level=&page=&limit=` | Bearer | flagged-contract feed |
| GET | `/api/benchmarks?category=&search=` | public | KEMSA reference prices |

Protected routes expect `Authorization: Bearer <token>`.

## Quick smoke test
```bash
# register
curl -s -X POST localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"Jane Auditor","email":"jane@moh.go.ke","password":"supersecret1","role":"auditor"}'

# list benchmarks (grab a baseline_id)
curl -s localhost:5000/api/benchmarks

# submit an inflated contract (replace TOKEN and BASELINE_ID)
curl -s -X POST localhost:5000/api/contracts \
  -H 'Authorization: Bearer TOKEN' -H 'Content-Type: application/json' \
  -d '{"baseline_id":"BASELINE_ID","supplier_name":"Ghost Medical Corp","contract_date":"2026-07-01","quantity":200,"awarded_unit_price":4500}'

# see the alert
curl -s 'localhost:5000/api/alerts?risk_level=Critical' -H 'Authorization: Bearer TOKEN'
```

## Known cross-team notes (database layer — outside this folder's scope)
1. **Alerts are read-only.** The `fraud_alerts` table has no `review_status`
   column, so the diagram's "Mark Reviewed / Dismissed" action is not yet
   implemented. Add a `review_status` column (e.g. `CHECK IN ('New','Reviewed','Dismissed')`)
   in a DB migration, then a `PATCH /api/alerts/:id` endpoint can be added.
2. **`optimize_performance_indices_and_data_constraints.sql` is stale.** It
   references columns/tables that no longer exist in the current schema
   (`item_name`/`county_name`/`contracted_price_kes`/`submitted_by` on contracts,
   `anomaly_alerts`, `deviation_pct`, `review_status`). It will fail if run as-is
   and needs to be reconciled with `create_procurement_ledger_and_anomaly_alerts.sql`.
