# 🏥 MedInventory

A **backend-heavy medical inventory management system** designed to model **real hospital workflows** with **auditability, safety, and scalability** as first-class concerns.

This project focuses on **correct domain modeling**, **transaction safety**, **compliance-grade audit trails**, and **ML-based anomaly detection**.

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
- Detect suspicious or unusual stock activity

**MedInventory** solves these problems using **proper data modeling**, **MongoDB transactions**, **immutable audit logs**, and **ML-based anomaly detection**.

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

### 🤖 ML-Based Anomaly Detection

- Detects **unusual stock-out patterns** per medicine using **Isolation Forest** (scikit-learn)
- Runs as a **scheduled nightly job** — no manual trigger needed
- Flags suspicious logs with an ⚠️ indicator in the Audit Logs UI
- Built as a **Python Flask microservice**, integrated with the Node.js backend via REST API
- Per-medicine detection — each medicine's "normal" consumption is learned independently

**Why Isolation Forest?**
- Unsupervised — no labeled training data needed
- Learns normal consumption patterns automatically
- Short isolation path = anomaly (e.g. 50 units issued when normal is 2-3)

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
- **Nightly anomaly detection** — flags unusual stock-out patterns using ML

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

**Correct model:**
```
Medicine → Batch → StockLog
```

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

### Why ML Anomaly Detection (Not Simple Rules)

A rule-based threshold (e.g. "flag if > 20 units") fails because:

- Different medicines have different normal quantities
- Thresholds need constant manual tuning

Isolation Forest learns per-medicine consumption patterns automatically and adapts to the data.

---

## 🧩 Architecture Overview

```
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

Python Flask ML Service (port 5001)
├── Isolation Forest model
└── /detect endpoint

Background cron jobs:
├── Expire stock (daily 2AM)
├── Inventory alerts (daily 9AM)
└── Anomaly detection (daily midnight)
```

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
- **Email:** Resend
- **Cache:** Redis (ioredis)
- **ML Service:** Python, Flask, scikit-learn (Isolation Forest)
- **Security:** RBAC, hashed passwords, protected routes

---

## 🚀 Getting Started

### Backend

#### 1️⃣ Install dependencies
```bash
cd backend
npm install
```

#### 2️⃣ Create `.env` file
```
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RESEND_API_KEY=your_resend_key
ML_SERVICE_URL=http://127.0.0.1:5001
SYSTEM_USER_ID=your_admin_user_id
```

#### 3️⃣ Run the server
```bash
npm run dev
```

---

### ML Service

#### 1️⃣ Install dependencies
```bash
cd ml
pip install -r requirements.txt
```

#### 2️⃣ Run the Flask server
```bash
python app.py
```

---

## 🛡️ Security Notes

- Passwords are never stored or retrievable in plaintext
- Admins cannot view user passwords
- Password recovery uses time-limited tokens
- Sensitive operations are role-restricted
- Audit logs cannot be altered

---

## 📈 Future Enhancements (Planned)

- Prescription module
- Billing integration
- Advanced concurrency handling
- Mobile app integration
