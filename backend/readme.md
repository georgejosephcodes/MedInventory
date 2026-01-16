# 🏥 MedInventory

A **backend-heavy medical inventory management system** designed to model **real hospital workflows** with **auditability, safety, and scalability** as first-class concerns.

This project focuses on **correct domain modeling**, **transaction safety**, and **compliance-grade audit trails**, rather than UI-heavy features.

---

## 📌 Problem Statement

Hospitals and pharmacies must manage medicines with:

- Multiple batches per medicine
- Different expiry dates
- Strict audit requirements
- Role-based access control
- Zero tolerance for stock inconsistencies

Most simple inventory systems fail to:

- Handle expiry correctly
- Track **who did what and when**
- Prevent partial or invalid stock operations

**MedInventory** solves these problems using **proper data modeling**, **MongoDB transactions**, and **immutable audit logs**.

---

## 🎯 Core Features

### 🔐 Authentication & Authorization

- JWT-based authentication (stateless)
- Role-Based Access Control (RBAC)

**Roles**
- **ADMIN** – system control & reporting
- **PHARMACIST** – stock management
- **STAFF** – medicine consumption

---

### 💊 Inventory Management (Real-World Model)

- Medicine master data (**no quantity stored here**)
- Batch-level inventory with:
  - Quantity
  - Expiry date
- FEFO (First-Expire-First-Out) stock issuance
- Partial batch consumption supported

---

### 🧾 Audit & Compliance

- **Immutable stock logs**
  - `STOCK_IN`
  - `STOCK_OUT`
  - `EXPIRED`
- Every log tracks:
  - Who performed the action
  - When it happened
  - Which medicine & batch were involved

Audit logs are **never updated or deleted**.

---

### 🔁 Transaction Safety

MongoDB transactions are used for:

- Stock-In
- Stock-Out

This prevents:

- Partial updates
- Negative stock
- Missing or inconsistent audit logs

Either **everything succeeds**, or **nothing changes**.

---

### ⏰ Background Jobs (Cron)

- Daily auto-expiry of medicines
- Daily inventory alert emails:
  - Medicines expiring within 30 days
  - Low stock (below minimum threshold)

---

### 📊 Reports & Metrics

- Monthly medicine usage
- Top consumed medicines
- Expired wastage report

---

### 📧 Clean Email System

- Secure password reset via email token
- Inventory alert emails for admins
- Reusable HTML email templates

---

## 🧠 Key Design Decisions

### Why Medicine & Batch Are Separate

A single medicine can have:

- Multiple batches
- Different expiry dates
- Different quantities

Storing quantity on the medicine level leads to **incorrect expiry handling**.

**Correct model**
Medicine → Batch → StockLog


---

### Why Audit Logs Are Immutable

Audit logs are **events**, not state.

They are never updated or deleted, enabling:

- Full traceability
- Compliance readiness
- Accurate reporting

---

### Why FEFO (First-Expire-First-Out)

Hospitals must always issue medicines that expire first to:

- Reduce wastage
- Maintain patient safety

Stock-out operations always consume batches sorted by **earliest expiry date**.

---

### Why Transactions Are Mandatory

Stock operations touch multiple documents:

- Batch updates
- Stock logs

Transactions guarantee:

- Atomicity
- Consistency
- Failure safety

---

## 🧩 Architecture Overview

Client (UI / Postman)
↓
Express API
↓
Controllers
↓
Services (Business Logic)
↓
MongoDB
├── Medicines
├── Batches
├── StockLogs
└── Users


Background cron jobs run alongside the API process.

---

## 🔑 Roles & Permissions

| Action            | ADMIN | PHARMACIST | STAFF |
|-------------------|-------|------------|-------|
| Create users      | ✅    | ❌         | ❌    |
| Add stock         | ❌    | ✅         | ❌    |
| Issue stock       | ❌    | ✅         | ✅    |
| View audit logs   | ✅    | ✅         | ❌    |
| View reports      | ✅    | ❌         | ❌    |

---

## 🔄 API Highlights

### Auth
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Inventory
- `POST /medicines` (ADMIN)
- `POST /batches/stock-in` (PHARMACIST)
- `POST /batches/stock-out` (STAFF / PHARMACIST)

### Audit
- `GET /audit/stock-logs`

### Reports
- `GET /reports/monthly-usage`
- `GET /reports/top-consumed`
- `GET /reports/expired-wastage`

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Background Jobs:** node-cron
- **Email:** Nodemailer (Gmail App Password)
- **Security:** RBAC, hashed passwords, protected routes

---

## 🚀 Getting Started

### 1️⃣ Install dependencies
```bash
npm install

2️⃣ Create .env file
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
ALERT_EMAIL=yourgmail@gmail.com
ALERT_EMAIL_PASSWORD=app_password
FRONTEND_URL=http://localhost:3000

3️⃣ Run the server
npm run dev

🛡️ Security Notes
Passwords are never stored or retrievable in plaintext
Admins cannot view user passwords
Password recovery uses time-limited tokens
Sensitive operations are role-restricted
Audit logs cannot be altered

📈 Future Enhancements (Planned)
Prescription module
Billing integration
Dashboard visualizations
Advanced concurrency handling
Mobile app integration