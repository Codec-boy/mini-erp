# Mini ERP + CRM Operations Portal

A production-grade, full-stack **Mini ERP + CRM Operations Portal** built for wholesale and distribution enterprises. It handles multi-role authentication (RBAC), CRM customer management, real-time inventory quantity tracking, stock movement audit ledgers, and atomic sales order challan dispatches.

---

## 🌐 Live Application Links

- 🚀 **Live Frontend App (Vercel)**: [https://mini-erp-omega.vercel.app/](https://mini-erp-omega.vercel.app/)
- ⚙️ **Live Backend API (Render)**: [https://mini-erp-zrna.onrender.com](https://mini-erp-zrna.onrender.com)
- 🏥 **Backend Health Check**: [https://mini-erp-zrna.onrender.com/health](https://mini-erp-zrna.onrender.com/health)

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **ADMIN**: Full system control (User management, Customer CRM, Catalog, Stock movements, Sales Challan workflow).
   - **SALES**: Customer management, Product & Stock catalog read-only, Sales Challan creation (`DRAFT`) and Approval (`APPROVED`).
   - **WAREHOUSE**: Product catalog view, Manual Stock Inward/Adjustments, Sales Challan Dispatch processing (`DISPATCHED`).
   - **ACCOUNTS**: Customer credit limit management, Sales Challan Delivery verification (`DELIVERED`) and customer ledger updates.

2. **Atomic Inventory & Stock Management**:
   - **Strict Non-Negative Stock Policy**: Database transactions ensure stock can *never* become negative. Attempting to dispatch an order exceeding available stock throws an `INSUFFICIENT_STOCK` error and rolls back completely.
   - **Real-Time Threshold Monitoring**: Low-stock and out-of-stock watchlist alerts based on configurable `minThresholdQuantity` per product.
   - **Complete Audit Trail**: Every stock change (`INWARD_PURCHASE`, `OUTWARD_DISPATCH`, `ADJUSTMENT_ADD`, `ADJUSTMENT_SUBTRACT`, `RETURN`) logs a `StockMovement` entry with reference IDs and user timestamps.

3. **Wholesale Sales Challan Workflow State Machine**:
   ```
   [DRAFT] ──(Sales/Admin)──> [APPROVED] ──(Warehouse/Admin)──> [DISPATCHED] ──(Accounts/Admin)──> [DELIVERED]
      │                                                           │
      └──────────────────────────(Cancel)─────────────────────────┴──> [CANCELLED] (Stock Restored)
   ```

4. **Production-Quality Tech Stack & UI**:
   - **Frontend**: React 18, TypeScript, Vite, React Router v6, Axios, Lucide Icons, Custom CSS Design System (Glassmorphism, Dark Theme).
   - **Backend**: Node.js, Express.js, TypeScript, Prisma ORM 7, PostgreSQL, JWT Authentication, bcryptjs, Zod validation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database server running locally or via cloud (e.g. Supabase, Neon)

### 1. Database & Environment Configuration

Create a `.env` file inside the `server/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minierp_crm?schema=public"
JWT_SECRET="super-secret-jwt-key-minierp-crm-2026"
JWT_EXPIRES_IN="24h"
CLIENT_URL="http://localhost:5173"
```

### 2. Backend Setup & Database Seeding

Navigating into the `server/` directory:
```bash
cd server
npm install
npx prisma generate
npm run prisma:seed
```

Start the backend development server:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend Client Setup

Open a new terminal tab and navigate into the `client/` directory:
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 🔑 Demo Login Credentials

The database seed populates 4 pre-configured role accounts (Password for all: `Password123!`):

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@minierp.com` | `Password123!` | All modules, User provisioning, Full CRUD |
| **Sales** | `sales@minierp.com` | `Password123!` | Customer CRM, Create & Approve Sales Challans |
| **Warehouse** | `warehouse@minierp.com` | `Password123!` | Stock Inward, Manual Adjustments, Dispatch Challans |
| **Accounts** | `accounts@minierp.com` | `Password123!` | Customer Credit Limits, Mark Challans Delivered |

---

## 📡 REST API Reference

All requests and responses use JSON. Unauthenticated requests return `401 Unauthorized`. Forbidden role access returns `403 Forbidden`.

### 1. Authentication
- `POST /api/v1/auth/login` - Authenticate user & return JWT token.
- `GET /api/v1/auth/me` - Fetch profile of currently logged-in user.

### 2. Customer CRM
- `GET /api/v1/customers?page=1&limit=10&search=Apex` - List paginated customers.
- `GET /api/v1/customers/:id` - Fetch customer details & recent order history.
- `POST /api/v1/customers` - Create new CRM customer record.
- `PUT /api/v1/customers/:id` - Update customer info & credit limit.

### 3. Products & Stock
- `GET /api/v1/products?page=1&limit=10&lowStockOnly=true` - List products & current stock levels.
- `GET /api/v1/products/:id` - Product detail & recent stock movement logs.
- `POST /api/v1/products` - Create product & initial stock threshold.
- `PUT /api/v1/products/:id` - Edit product details.

### 4. Inventory Ledger
- `GET /api/v1/inventory/overview` - Summary metric counts (Total products, total stock, low stock count).
- `GET /api/v1/inventory/movements?page=1&limit=10` - View inventory movement audit ledger.
- `POST /api/v1/inventory/movements` - Log stock inward or manual adjustment.

### 5. Sales Order Challans
- `GET /api/v1/sales-challans?page=1&limit=10&status=APPROVED` - List sales challans.
- `GET /api/v1/sales-challans/:id` - Fetch sales challan breakdown & line items.
- `POST /api/v1/sales-challans` - Create new sales challan (`DRAFT`).
- `PATCH /api/v1/sales-challans/:id/approve` - Approve sales challan (`DRAFT` → `APPROVED`).
- `PATCH /api/v1/sales-challans/:id/dispatch` - Dispatch sales challan (`APPROVED` → `DISPATCHED`). *Deducts inventory stock atomically inside DB transaction*.
- `PATCH /api/v1/sales-challans/:id/deliver` - Mark sales challan delivered (`DISPATCHED` → `DELIVERED`). *Updates customer outstanding balance*.
- `PATCH /api/v1/sales-challans/:id/cancel` - Cancel sales challan. *Restores stock if already dispatched*.

---

## 🔒 Business Logic & Security Hardening

- **Atomic DB Transactions**: Multi-table updates execute inside `prisma.$transaction`.
- **Negative Stock Guard**: Verified at database level before stock decrements.
- **Credit Limit Control**: Checks `customer.outstandingBalance + challanTotal <= customer.creditLimit`.
- **Zero Secrets Leakage**: Passwords hashed with bcrypt (10 rounds) and excluded from Prisma `select` queries.
