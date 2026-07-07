# G6 — Automated Public Health Procurement Auditor

A proactive web-based platform that automatically audits government medical procurement contracts in Kenya. The system compares awarded contract prices against independent KEMSA market benchmarks to identify inflated procurement before public funds are lost.

---

## Overview

The Automated Public Health Procurement Auditor is designed to improve transparency and accountability in public procurement by automatically evaluating submitted medical supply contracts against trusted market reference prices.

Every submitted contract is analyzed in real time, assigned a risk level, and—where necessary—flagged for further investigation.

---

## Features

-  Automatic procurement price auditing
-  KEMSA market price comparison
-  Real-time fraud risk detection
-  Procurement dashboard
-  JWT-based authentication
-  Contract management
-  Automated fraud alert generation
-  PostgreSQL-backed data storage
-  RESTful API built with Express

---

## System Architecture

The application follows a classic **three-tier architecture**.

| Layer | Component | Technology |
|--------|-----------|------------|
| Presentation | Dashboard UI | React + Vite |
| Application | REST API | Node.js + Express 5 |
| Data | Database | PostgreSQL 16 |

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express 5
- JWT Authentication
- PostgreSQL (`pg`)
- Jest

### Database

- PostgreSQL 16

---

## Audit Engine

Each procurement contract is evaluated using the following formula:

```text
variance_pct =
((awarded_unit_price - reference_price_kes)
 / reference_price_kes)
× 100
```

### Risk Classification

| Price Variance | Risk Level | Alert Generated |
|---------------|------------|-----------------|
| Less than 15% | Low | ❌ No |
| 15%–40% | Medium | ✅ Yes |
| 40%–100% | High | ✅ Yes |
| Above 100% | Critical | ✅ Yes |

Whenever a contract exceeds the acceptable variance threshold, an alert is automatically inserted into the `fraud_alerts` table within the same database transaction.

---

# Project Structure

```
.
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── database/
│   ├── migrations/
│   ├── seed/
│   └── scripts/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

---

# Backend Setup

## Prerequisites

- Node.js 18+
- PostgreSQL 16
- npm

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd g6-automated-procurement-auditor
```

---

## 2. Create the Database

Create a PostgreSQL database named:

```text
procurement_auditor
```

Run all migration scripts located in:

```
database/migrations/
```

This creates the following tables:

- users
- market_baselines
- procurement_contracts
- fraud_alerts

---

## 3. Install Dependencies

```bash
cd backend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the **backend** directory.

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

---

## 5. Start the Development Server

```bash
npm run dev
```

---

## Useful Scripts

```bash
npm run dev      # Start development server (nodemon)

npm test         # Run Jest tests

npm run seed     # Seed database with KEMSA benchmark prices
```

---

# API Endpoints

| Method | Endpoint | Authentication | Description |
|---------|----------|----------------|-------------|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register user and return JWT |
| POST | `/api/auth/login` | Public | Authenticate user and return JWT |
| GET | `/api/benchmarks` | Public | Retrieve KEMSA benchmark prices |
| POST | `/api/contracts` | Bearer Token | Submit procurement contract and trigger audit |
| GET | `/api/contracts` | Bearer Token | Retrieve procurement ledger |
| GET | `/api/alerts` | Bearer Token | Retrieve flagged procurement alerts |

---

# Database

The system currently uses four primary tables:

- `users`
- `market_baselines`
- `procurement_contracts`
- `fraud_alerts`

---

# Active Development

## Pending Feature

### Alert Status Workflow

The `fraud_alerts` table currently does not include a `review_status` column.

A migration is planned to introduce:

```sql
review_status
CHECK (
    review_status IN (
        'New',
        'Reviewed',
        'Dismissed'
    )
)
```

This migration is required before implementing:

```
PATCH /api/alerts/:id
```

---

## Known Issue

### Deprecated Optimization Script

The SQL script:

```
optimize_performance_indices_and_data_constraints.sql
```

still references deprecated columns including:

- item_name
- county_name
- contracted_price_kes
- submitted_by
- deviation_pct

and the obsolete table:

```
anomaly_alerts
```

Do **not** execute this script until it has been updated to match the current schema.

---

# Future Improvements

- Alert review workflow
- Email notifications
- Procurement analytics dashboard
- Historical trend analysis
- County procurement comparison
- CSV/PDF report exports
- Machine-learning anomaly detection
- Role-based permissions

---

# Team G6

- Gabriel Mugisha
- Philip Mbogho
- Credo Iranzi
- Aimable Bancunguye
- Clive Mushipe
- James Kanneh

---

## License

This project was developed by **Team G6** for academic purposes.
