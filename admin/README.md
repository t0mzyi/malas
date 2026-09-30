# Malas Electronics LLC — Enterprise Admin Portal & MariaDB 10.6.28

Bespoke operations portal and database integration for managing client RFP consultations, engineering dispatch, and system telemetry.

The Admin application is structured into decoupled **Backend** and **Frontend** folders.

---

## 1. Directory Structure

```
admin/
├── backend/                  # Node.js + Express API & MariaDB Database Integration
│   ├── config/
│   │   └── db.js             # MariaDB connection pool & connection diagnostics
│   ├── middleware/
│   │   └── auth.js           # JWT & cookie verification middleware
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login, logout, me
│   │   ├── inquiries.js      # GET, POST, PATCH, DELETE for RFP inquiries
│   │   └── dashboard.js      # GET /api/dashboard/stats, health checks
│   ├── scripts/
│   │   ├── init-db.js        # Automated MariaDB database & schema migration
│   │   └── seed-admin.js     # CLI utility to create/reset admin credentials
│   ├── .env                  # Active environment variables (DB password added here)
│   ├── .env.example          # Environment template
│   ├── package.json          # Backend dependencies (express, mysql2, bcryptjs, jwt)
│   ├── schema.sql            # MariaDB 10.6.28 table definitions
│   └── server.js             # Express server on port 5000
│
├── frontend/                 # High-End Dark Architectural Single-Page Admin UI
│   ├── index.html            # Admin login screen & full inquiries dispatch dashboard
│   ├── styles.css            # Malas OLED dark theme & telemetry badges
│   ├── app.js                # Frontend client logic & real-time telemetry
│   └── logo.png              # Malas brand asset
│
└── README.md
```

---

## 2. Quick Start Guide

### Step 1: Add Database Password in `.env`
Open `admin/backend/.env` and insert your MariaDB database password:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=malasele_db
DB_PASSWORD=your_mariadb_password_here
DB_NAME=malasele_db

PORT=5000
JWT_SECRET=your_secure_random_jwt_secret_2026
```

---

### Step 2: Initialize Database & Schema
From the `admin/backend` folder, run:
```bash
cd admin/backend
npm run init-db
```
This script will:
1. Connect to your MariaDB 10.6.28 instance on `localhost:3306`.
2. Create the `malasele_db` database if not present.
3. Execute `schema.sql` (creating `admins`, `rfp_inquiries`, `audit_logs`, `site_settings`).
4. Seed the initial Chief Administrator account.

---

### Step 3: Default Administrator Credentials
- **Username**: `admin`
- **Email**: `admin@malaselectronics.com`
- **Initial Password**: `Admin@Malas2026!`

*(You can also reset or create additional admins anytime with: `node scripts/seed-admin.js <username> <password> <email>`)*

---

### Step 4: Start Backend & Admin Portal
```bash
cd admin/backend
npm start
```
Then open your browser and navigate to:
**[http://localhost:5000](http://localhost:5000)**

*(The Express backend automatically serves the frontend interface from `admin/frontend`, with full CORS support if the frontend is also hosted on an independent port).*

---

## 3. Database Schema Overview (`malasele_db`)

| Table Name | Description | Key Fields |
|---|---|---|
| `admins` | Operational administrators with bcrypt hashes | `id`, `username`, `email`, `password_hash`, `role`, `status`, `last_login` |
| `rfp_inquiries` | Client project scopes from landing page | `id`, `client_name`, `email`, `phone`, `sector`, `venue_type`, `scope_notes`, `status` |
| `audit_logs` | Security activity & admin actions | `id`, `admin_id`, `action`, `details`, `ip_address`, `created_at` |
| `site_settings` | Dynamic operational configurations | `setting_key`, `setting_value`, `description`, `updated_at` |

---

## 4. API Reference

### Authentication
- `POST /api/auth/login`: Authenticates credentials, issues JWT cookie & token.
- `POST /api/auth/logout`: Clears session cookie.
- `GET /api/auth/me`: Returns profile of currently signed-in admin.

### RFP & Client Inquiries
- `GET /api/inquiries`: Lists inquiries (supports `?status=new|in_review|quoted` and `?search=term`).
- `POST /api/inquiries`: Public endpoint for landing page consultation forms.
- `PATCH /api/inquiries/:id`: Updates inquiry status or assigned engineer.
- `DELETE /api/inquiries/:id`: Permanently removes inquiry record.

### Telemetry & Diagnostics
- `GET /api/dashboard/stats`: Returns live inquiry counters and MariaDB version info.
- `GET /api/dashboard/health`: Checks active connectivity to `malasele_db`.
