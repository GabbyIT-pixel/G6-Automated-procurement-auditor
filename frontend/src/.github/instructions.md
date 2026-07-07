

## Project

Project Name:

Automated Public Health Procurement Auditor

## Purpose

This application helps auditors and public health officials in Kenya detect procurement fraud by comparing procurement contract prices against benchmark prices from KEMSA.

The application DOES NOT determine guilt.

It simply flags suspicious contracts for human review.

---

# Users

- Government Auditors
- Oversight Officers
- Public Health Officials

---

# Tech Stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- TanStack Query
- Axios
- Framer Motion
- React Hook Form
- Zod
- Recharts
- Lucide React

Backend

- Node.js
- Express REST API
- JWT Authentication

Database

- PostgreSQL

---

# Database Tables

users

market_baselines

procurement_contracts

anomaly_alerts

---

# Main Features

Authentication

Dashboard

Contracts

Fraud Alerts

Reports

Settings

---

# UI Style

The UI must look like an enterprise SaaS application.

Design inspiration:

- Stripe
- Vercel
- Linear
- Atlassian
- Microsoft Fabric
- Datadog

Never generate outdated UI.

Never generate Bootstrap-looking pages.

Use:

- Lots of whitespace
- Rounded corners (16px)
- Soft shadows
- Clean typography
- Inter font
- Accessible components
- Responsive layouts
- Dark mode support
- Skeleton loaders
- Empty states
- Toast notifications
- Framer Motion animations

---

# Color Palette

Background

#F8FAFC

Cards

#FFFFFF

Primary

#2563EB

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Secondary Text

#64748B

---

# Coding Standards

Always:

- Use TypeScript
- Create reusable components
- Keep components small
- Use feature-based architecture
- Use custom hooks
- Use TanStack Query
- Use Axios instance
- Use React Hook Form
- Use Zod validation
- Keep files organized
- Avoid duplicate code
- Write production-ready code
- Use meaningful names
- Follow React best practices

---

# Folder Structure

src/

components/

features/

pages/

hooks/

services/

types/

contexts/

layouts/

routes/

utils/

constants/

assets/

styles/

---

# API

Authentication

POST /api/login

Contracts

POST /api/contracts

GET /api/contracts

Alerts

GET /api/alerts

---

# Risk Levels

Low

Deviation < 15%

Medium

Deviation 15–40%

High

Deviation > 40%

---

# Components

Always prefer reusable components.

Examples:

Button

Card

Table

Modal

Drawer

Sidebar

Navbar

StatCard

RiskBadge

SearchBar

Pagination

LoadingSkeleton

EmptyState

AlertCard

ChartCard

---

# General Rules

Never hardcode data unless creating mock data.

Never duplicate components.

Always separate UI from business logic.

Prefer composition over large components.

Always think like a senior software engineer.