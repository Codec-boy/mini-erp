# Mini ERP + CRM Operations Portal

A production-grade, full-stack **Mini ERP + CRM Operations Portal** built for wholesale and distribution enterprises. It handles multi-role authentication (RBAC), CRM customer management, real-time inventory quantity tracking, stock movement audit ledgers, and atomic sales order challan dispatches.

Built as a submission for the **Full Stack Developer Case Study — Mini ERP + CRM Operations Portal** assignment.

---

## 🌐 Live Application Links

- 🚀 **Live Frontend App (Vercel)**: https://mini-erp-omega.vercel.app/
- ⚙️ **Live Backend API (Render)**: https://mini-erp-zrna.onrender.com
- 🏥 **Backend Health Check**: https://mini-erp-zrna.onrender.com/health

---

## 📁 Project Structure

```
mini-erp-crm/
├── package.json
├── postman_collection.json
├── README.md
├── render.yaml
│
├── client/                          # React + TypeScript frontend
│   ├── index.html
│   ├── package.json
│   ├── README.md
│   ├── vercel.json
│   ├── vite.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── App.tsx
│       ├── index.css
│       ├── main.tsx
│       ├── api/                     # Axios API clients
│       │   ├── authApi.ts
│       │   ├── axiosClient.ts
│       │   ├── challanApi.ts
│       │   ├── customerApi.ts
│       │   ├── inventoryApi.ts
│       │   ├── productApi.ts
│       │   └── userApi.ts
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   │   ├── Badge.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Pagination.tsx
│       │   │   └── ProtectedRoutes.tsx
│       │   └── layout/
│       │       └── DashboardLayout.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── pages/
│       │   ├── auth/
│       │   │   └── LoginPage.tsx
│       │   ├── challans/
│       │   │   └── SalesChallansPage.tsx
│       │   ├── customers/
│       │   │   └── CustomersPage.tsx
│       │   ├── dashboard/
│       │   │   └── DashboardPage.tsx
│       │   ├── products/
│       │   │   └── ProductsPage.tsx
│       │   ├── stock/
│       │   │   └── StockMovementsPage.tsx
│       │   └── users/
│       │       └── UsersPage.tsx
│       └── types/
│           └── index.ts
│
└── server/                          # Node.js + Express + Prisma backend
    ├── package.json
    ├── prisma.config.ts
    ├── skills-lock.json
    ├── tsconfig.json
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── app.ts
        ├── server.ts
        ├── test_flow.ts
        ├── config/
        │   ├── db.config.ts
        │   └── env.config.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── challan.controller.ts
        │   ├── customer.controller.ts
        │   ├── inventory.controller.ts
        │   ├── product.controller.ts
        │   └── user.controller.ts
        ├── errors/
        │   └── custom.error.ts
        ├── middlewares/
        │   ├── auth.middleware.ts
        │   ├── error.middleware.ts
        │   ├── rbac.middleware.ts
        │   └── validate.middleware.ts
        ├── prisma/
        │   └── seed.ts
        ├── routes/
        │   ├── api.router.ts
        │   ├── auth.routes.ts
        │   ├── challan.routes.ts
        │   ├── customer.routes.ts
        │   ├── inventory.routes.ts
        │   ├── product.routes.ts
        │   └── user.routes.ts
        ├── services/
        │   ├── auth.service.ts
        │   ├── challan.service.ts
        │   ├── customer.service.ts
        │   ├── inventory.service.ts
        │   ├── product.service.ts
        │   └── user.service.ts
        ├── utils/
        │   ├── auth.util.ts
        │   └── response.util.ts
        └── validators/
            ├── auth.validator.ts
            ├── challan.validator.ts
            ├── customer.validator.ts
            ├── inventory.validator.ts
            ├── product.validator.ts
            └── user.validator.ts
```

The backend follows a **layered architecture**: `routes → controllers → services → Prisma (DB)`, with `middlewares` handling auth/RBAC/validation and `validators` defining Zod schemas per module. The frontend follows a standard **feature-folder React structure**: `api/` (Axios clients) → `pages/` (route-level screens) → `components/` (shared UI) → `context/` (global auth state).

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
| Role | Capabilities |
|---|---|
| **ADMIN** | Full system control — user management, Customer CRM, Catalog, Stock movements, Sales Challan workflow (all stages) |
| **SALES** | Customer management, Product & Stock catalog (read-only), Sales Challan creation (`DRAFT`) and Approval (`APPROVED`) |
| **WAREHOUSE** | Product catalog view, Manual Stock Inward/Adjustments, Sales Challan Dispatch processing (`DISPATCHED`) |
| **ACCOUNTS** | Customer credit limit management, Sales Challan Delivery verification (`DELIVERED`) and customer ledger updates |

### 2. Customer CRM Module
Add, edit, search, and view detailed customer records — name, mobile, email, business name, optional GST number, customer type (Retail/Wholesale/Distributor), address, status (Lead/Active/Inactive), follow-up date, and notes — with follow-up note tracking.

### 3. Product & Inventory Module
- Product catalog with SKU/code, category, unit price, current stock, minimum threshold quantity, and warehouse/location.
- **Strict Non-Negative Stock Policy**: DB transactions ensure stock can never go negative; dispatching beyond available stock throws an `INSUFFICIENT_STOCK` error and rolls back completely.
- **Real-Time Threshold Monitoring**: Low-stock and out-of-stock watchlist alerts based on configurable `minThresholdQuantity` per product.
- **Complete Audit Trail**: Every stock change (`INWARD_PURCHASE`, `OUTWARD_DISPATCH`, `ADJUSTMENT_ADD`, `ADJUSTMENT_SUBTRACT`, `RETURN`) logs a `StockMovement` entry with quantity, reason, reference IDs, created-by user, and timestamp.

### 4. Wholesale Sales Challan Workflow (State Machine)
```
[DRAFT] ──(Sales/Admin)──> [APPROVED] ──(Warehouse/Admin)──> [DISPATCHED] ──(Accounts/Admin)──> [DELIVERED]
   │                                                             │
   └────────────────────────(Cancel)────────────────────────────┴──> [CANCELLED]  (Stock Restored)
```
- Auto-generated challan numbers, customer selection, multi-product line items with quantities, and a stored **product snapshot** (not just a product ID reference) so historical challans remain accurate even if product data later changes.
- Stock is deducted atomically only at `DISPATCHED`, and restored automatically if a dispatched challan is later `CANCELLED`.
- Delivery confirmation updates the customer's outstanding balance/ledger.

### 5. Production-Quality Tech Stack & UI
- **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios, Lucide Icons, custom CSS design system (Glassmorphism, Dark Theme), fully responsive.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM 7, PostgreSQL, JWT authentication, bcryptjs, Zod validation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL database server (local, or a free cloud instance such as Supabase / Neon)

### 1. Clone the repository
```bash
git clone <repository-url>
cd mini-erp-crm
```

### 2. Backend Setup & Environment Configuration

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp_crm?schema=public"
JWT_SECRET="super-secret-jwt-key-minierp-crm-2026"
JWT_EXPIRES_IN="24h"
CLIENT_URL="http://localhost:5173"
```

Install dependencies, generate the Prisma client, and seed the database:
```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy   # or: npx prisma db push (first-time local setup)
npm run prisma:seed
```

Start the backend development server:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal tab and navigate into the `client/` directory:
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

### 4. Environment Variable Management
- All secrets (`JWT_SECRET`, `DATABASE_URL`) are kept out of source control via `.env`, which is git-ignored.
- The frontend reads the backend base URL from a Vite environment variable (e.g. `VITE_API_BASE_URL`), so `client/.env` should point to `http://localhost:5000/api/v1` locally and to the Render URL in production (`vercel.json` / Vercel project environment variables).
- On Render, environment variables are configured via `render.yaml` and the Render dashboard (`DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `NODE_ENV=production`).

---

## 🔑 Demo Login Credentials

The database seed script (`server/src/prisma/seed.ts`) populates 4 pre-configured role accounts (password for all: `Password123!`):

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `Password123!` | All modules, user provisioning, full CRUD |
| **Sales** | `sales@minierp.com` | `Password123!` | Customer CRM, create & approve sales challans |
| **Warehouse** | `warehouse@minierp.com` | `Password123!` | Stock inward, manual adjustments, dispatch challans |
| **Accounts** | `accounts@minierp.com` | `Password123!` | Customer credit limits, mark challans delivered |

---

## 📡 REST API Reference

All requests/responses use JSON. Unauthenticated requests return `401 Unauthorized`; forbidden role access returns `403 Forbidden`. A full request/response collection is provided in `postman_collection.json`.

### 1. Authentication
- `POST /api/v1/auth/login` — Authenticate user & return JWT token.
- `GET /api/v1/auth/me` — Fetch profile of the currently logged-in user.

### 2. Customer CRM
- `GET /api/v1/customers?page=1&limit=10&search=Apex` — List paginated customers, with search.
- `GET /api/v1/customers/:id` — Fetch customer details & recent order history.
- `POST /api/v1/customers` — Create new CRM customer record.
- `PUT /api/v1/customers/:id` — Update customer info & credit limit.

### 3. Products & Stock
- `GET /api/v1/products?page=1&limit=10&lowStockOnly=true` — List products & current stock levels, with low-stock filter.
- `GET /api/v1/products/:id` — Product detail & recent stock movement logs.
- `POST /api/v1/products` — Create product & initial stock threshold.
- `PUT /api/v1/products/:id` — Edit product details.

### 4. Inventory Ledger
- `GET /api/v1/inventory/overview` — Summary metrics (total products, total stock, low-stock count).
- `GET /api/v1/inventory/movements?page=1&limit=10` — Paginated inventory movement audit ledger.
- `POST /api/v1/inventory/movements` — Log stock inward or manual adjustment.

### 5. Sales Order Challans
- `GET /api/v1/sales-challans?page=1&limit=10&status=APPROVED` — List sales challans, with status filter.
- `GET /api/v1/sales-challans/:id` — Fetch sales challan breakdown & line items.
- `POST /api/v1/sales-challans` — Create new sales challan (`DRAFT`).
- `PATCH /api/v1/sales-challans/:id/approve` — Approve sales challan (`DRAFT → APPROVED`).
- `PATCH /api/v1/sales-challans/:id/dispatch` — Dispatch sales challan (`APPROVED → DISPATCHED`); deducts inventory stock atomically inside a DB transaction.
- `PATCH /api/v1/sales-challans/:id/deliver` — Mark sales challan delivered (`DISPATCHED → DELIVERED`); updates customer outstanding balance.
- `PATCH /api/v1/sales-challans/:id/cancel` — Cancel sales challan; restores stock if already dispatched.

### 6. User Management (Admin only)
- `GET /api/v1/users` — List all system users.
- `POST /api/v1/users` — Provision a new user with a role.

---

## 🔒 Business Logic & Security Hardening

- **Atomic DB Transactions**: All multi-table updates (challan status transitions, stock deductions/restorations) execute inside `prisma.$transaction`.
- **Negative Stock Guard**: Stock availability is verified at the database level before any decrement; insufficient stock throws `INSUFFICIENT_STOCK` and rolls back the entire operation.
- **Credit Limit Control**: On challan creation/approval, the system checks `customer.outstandingBalance + challanTotal <= customer.creditLimit`.
- **Product Snapshots**: Challan line items store a snapshot of product name/price/SKU at time of order, not just a foreign key, so historical records stay accurate.
- **Zero Secrets Leakage**: Passwords are hashed with bcrypt (10 rounds) and excluded from all Prisma `select` queries; JWTs are signed with a server-only secret and expire after `JWT_EXPIRES_IN`.
- **Input Validation**: Every endpoint validates its payload with Zod schemas (`validators/`) before hitting the service layer.
- **Centralized Error Handling**: A shared `error.middleware.ts` + `custom.error.ts` normalize error shapes and HTTP status codes across the API.

---

## 🏗️ Architecture Overview

- **Backend** — Layered Express + TypeScript API: `routes` define endpoints → `middlewares` (auth, RBAC, validation) guard them → `controllers` parse requests/responses → `services` hold business logic and Prisma transactions → PostgreSQL via Prisma ORM.
- **Frontend** — React 18 + TypeScript SPA on Vite: role-aware routing (`ProtectedRoutes.tsx`) and a global `AuthContext` gate access to each module; `api/` clients wrap Axios calls per resource; `pages/` are route-level screens composed from shared `components/`.
- **Deployment** — Frontend hosted on Vercel (`vercel.json`), backend on Render (`render.yaml`) with a managed/cloud PostgreSQL instance (e.g. Supabase/Neon/Render Postgres). Health is exposed at `/health` for uptime checks.

---

## 📝 Assumptions Made
- A wholesale/distribution business context was assumed; "challan" is used as the sales-order/dispatch document, consistent with common ERP terminology in this domain.
- Simple JWT-based auth (no refresh tokens/OAuth) was used, as explicitly permitted by the assignment.
- GST number is optional per customer, as not all customer types (e.g. Retail) may be GST-registered.
- Credit limit checks apply at the customer level and block challan approval/dispatch rather than silently allowing over-limit orders.
- Free-tier hosting (Vercel/Render) was used in place of AWS, per the assignment's note that AWS deployment is optional/bonus.

## ⚠️ Known Limitations / Incomplete Parts
- Invoice PDF export, AWS S3 image upload, Docker setup, and GitHub Actions CI/CD are not implemented (all were listed as bonus/optional in the case study).
- Render's free-tier backend may cold-start after inactivity, causing a delayed first response on the live demo.
- No automated test suite (unit/integration) is included; `test_flow.ts` provides a manual end-to-end smoke script instead.

---