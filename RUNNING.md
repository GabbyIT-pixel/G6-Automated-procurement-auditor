# Running the App (Step by Step)

This guide is written to work on any PC (macOS, Linux, or Windows with a shell).

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 16+ running locally

Quick checks:

```bash
node -v
npm -v
pg_isready -h localhost -p 5432
```

Expected DB check output:

```text
localhost:5432 - accepting connections
```

## First-Time Setup (New PC or Fresh Clone)

### 1) Clone and enter project

```bash
git clone <your-repo-url>
cd G6-Automated-procurement-auditor
```

### 2) Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 3) Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4) Configure backend environment

Create or edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=procurement_auditor

JWT_SECRET=replace-with-a-secure-secret
JWT_EXPIRES_IN=8h
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

Notes:

- `DB_PORT` must match your running PostgreSQL port
- `PORT` should stay `5000` (frontend proxy is configured for this)

### 5) Create database

```bash
createdb -h localhost -p 5432 -U postgres procurement_auditor
```

If `createdb` is not in PATH, use `psql` and run:

```sql
CREATE DATABASE procurement_auditor;
```

### 6) Run required migrations

From project root:

```bash
psql -h localhost -p 5432 -U postgres -d procurement_auditor -f database/migrations/init_auth_and_market_baselines.sql
psql -h localhost -p 5432 -U postgres -d procurement_auditor -f database/migrations/create_procurement_ledger_and_anomaly_alerts.sql
```

Do not run `database/migrations/optimize_performance_indices_and_data_constraints.sql` for now.

### 7) Seed demo data

```bash
cd backend
npm run seed
cd ..
```

## Daily Run (After Setup)

### 1) Start backend (Terminal 1)

```bash
cd backend
npm start
```

Expected logs include:

```text
Attempting PostgreSQL connection: { host: 'localhost', port: 5432, user: 'postgres', database: 'procurement_auditor' }
PostgreSQL connected — DB time: ...
Procurement Auditor API listening on http://localhost:5000
```

### 2) Start frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

Demo login:

- Email: `jane.auditor@health.go.ke`
- Password: `password123`

## When You Need npm install Again

Run `npm install` again only when:

- It is a new machine
- You just cloned the repo
- `package.json` or `package-lock.json` changed
- `node_modules` was deleted

You do not need `npm install` every time you run the app.

## Stop Services

- Backend terminal: `Ctrl+C`
- Frontend terminal: `Ctrl+C`

## Troubleshooting

- `password authentication failed for user "postgres"`
  `DB_PASSWORD` in `backend/.env` does not match your PostgreSQL password.

- `database "procurement_auditor" does not exist`
  Create it first (see First-Time Setup, Step 5).

- API 404 from frontend
  Ensure backend is running and `PORT=5000` in `backend/.env`.

- `cd frontend` fails
  Confirm you are in the repository root first, then run `cd frontend`.
