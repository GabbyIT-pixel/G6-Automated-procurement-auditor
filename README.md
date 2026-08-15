# G6 — Automated Public Health Procurement Auditor

A web-based platform that automatically audits government medical procurement contracts in Kenya. Every submitted contract is compared against independent KEMSA market benchmark prices, scored for risk, and — where the variance is high enough — automatically flagged for investigation, so inflated procurement can be caught before public funds are lost.

---

## Overview

Public procurement fraud is often only discovered long after payment, when the paper trail is cold. This project flips that: contracts are audited **at the point of submission**, in real time, against a trusted reference price list, and the system generates its own fraud alerts rather than waiting for a human to spot the anomaly.

## Features

- Automatic procurement price auditing on contract submission
- KEMSA market benchmark price comparison
- Real-time risk scoring (Low / Medium / High / Critical)
- Automated fraud alert generation for risky contracts
- Procurement dashboard with contracts, alerts, and analytics views
- JWT-based authentication
- RESTful API built with Express 5
- PostgreSQL-backed data storage

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form + Zod, Recharts, Framer Motion |
| Backend | Node.js, Express 5, JWT (`jsonwebtoken`), `bcryptjs`, `express-rate-limit`, `helmet` |
| Database | PostgreSQL 16 (`pg`) |
| Testing | Jest, Supertest |

## Audit Engine

The core of the system is a pure, dependency-free function (`backend/src/services/audit.service.js`) that computes how far an awarded unit price deviates from the KEMSA reference price:

```
variance_pct = ((awarded_unit_price - reference_price_kes) / reference_price_kes) × 100
```

### Risk classification

| Price variance | Risk level | Alert generated |
|---|---|---|
| < 15% | Low | No |
| 15% – 40% | Medium | Yes |
| 40% – 100% | High | Yes |
| > 100% | Critical | Yes |

Only overpricing escalates risk — prices at or below the benchmark are always Low. Whenever a contract lands at Medium risk or above, a fraud alert is generated automatically.

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection config
│   │   ├── controllers/     # auth, contract, benchmark, alert controllers
│   │   ├── middleware/      # auth middleware, error handler
│   │   ├── routes/          # auth, contract, benchmark, alert routes
│   │   ├── services/        # audit.service.js — the audit engine
│   │   ├── utils/           # asyncHandler, jwt, validators
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── .env.example
│
├── database/
│   ├── migrations/          # SQL schema migrations
│   └── seed/                # KEMSA benchmark, demo users, mock transactions
│
├── frontend/
│   └── src/
│       ├── components/      # ui, layout, contracts
│       ├── pages/           # auth, dashboard, contracts, alerts, settings
│       ├── lib/              # api client, utils
│       └── types/
│
├── docs/                    # Architecture and ERD diagrams
├── RUNNING.md                # Detailed step-by-step run guide
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 16+ running locally

### 1. Clone the repository

```bash
git clone https://github.com/GabbyIT-pixel/G6-Automated-procurement-auditor.git
cd G6-Automated-procurement-auditor
```

### 2. Install dependencies

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Configure environment variables

Create `backend/.env` (see `backend/.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=procurement_auditor

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=8h

PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 4. Create the database and run migrations

```bash
createdb -h localhost -p 5432 -U postgres procurement_auditor

psql -h localhost -p 5432 -U postgres -d procurement_auditor -f database/migrations/init_auth_and_market_baselines.sql
psql -h localhost -p 5432 -U postgres -d procurement_auditor -f database/migrations/create_procurement_ledger_and_anomaly_alerts.sql
```

> Do **not** run `database/migrations/optimize_performance_indices_and_data_constraints.sql` yet — it still references a deprecated schema (see [Known Issues](#known-issues)).

### 5. Seed demo data

```bash
cd backend
npm run seed
```

This seeds the KEMSA benchmark prices, demo users, and mock procurement transactions.

### 6. Run the app

In two terminals:

```bash
# Terminal 1 — backend
cd backend
npm start        # or npm run dev for nodemon
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

Then open `http://localhost:5173`.

**Demo login:** `jane.auditor@health.go.ke` / `password123`

For a more detailed walkthrough (including troubleshooting), see [`RUNNING.md`](./RUNNING.md).

## Useful Scripts

```bash
npm run dev      # Start backend with nodemon (backend/)
npm start        # Start backend in production mode (backend/)
npm test         # Run Jest test suite (backend/)
npm run seed     # Seed the database with benchmark and demo data (backend/)

npm run dev      # Start Vite dev server (frontend/)
npm run build    # Type-check and build for production (frontend/)
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register a user and return a JWT |
| POST | `/api/auth/login` | Public | Authenticate and return a JWT |
| GET | `/api/benchmarks` | Public | Retrieve KEMSA benchmark prices |
| POST | `/api/contracts` | Bearer token | Submit a procurement contract and trigger an audit |
| GET | `/api/contracts` | Bearer token | Retrieve the procurement ledger |
| GET | `/api/alerts` | Bearer token | Retrieve flagged procurement alerts |

## Database

Four primary tables back the system:

- `users`
- `market_baselines`
- `procurement_contracts`
- `fraud_alerts`

## Known Issues

- **Deprecated optimization script.** `database/migrations/optimize_performance_indices_and_data_constraints.sql` still references an old schema (`item_name`, `county_name`, `contracted_price_kes`, `submitted_by`, `deviation_pct`, and the obsolete `anomaly_alerts` table). Do not run it until it's updated to match the current schema.
- **Alert review workflow not yet implemented.** The `fraud_alerts` table has no `review_status` column yet; a migration adding `review_status CHECK (review_status IN ('New', 'Reviewed', 'Dismissed'))` is planned, which is a prerequisite for a future `PATCH /api/alerts/:id` endpoint.

## Roadmap

- Alert review workflow (`New` / `Reviewed` / `Dismissed`)
- Email notifications for high-risk alerts
- Procurement analytics dashboard and historical trend analysis
- County-level procurement comparison
- CSV/PDF report exports
- Machine-learning-based anomaly detection
- Role-based permissions

## Team G6

- Gabriel Mugisha
- Philip Mbogho
- Credo Iranzi
- Aimable Bancunguye
- Clive Mushipe
- James Kanneh

  ## Demo video: https://drive.google.com/file/d/1VPkK5PWfVW08wXrFxZyuKUhy5bdCQpAe/view
  ## Deployment: https://aphpa.netlify.app/ 
  

## License

Developed by Team G6 for academic purposes.
