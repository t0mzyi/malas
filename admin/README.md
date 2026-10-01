# Malas Electronics LLC — Enterprise Admin Portal & MariaDB 10.6.28

Bespoke operations portal and database integration for managing client RFP consultations, engineering dispatch, and system telemetry.

The portal provides **dual deployment options**:
1. **DirectAdmin / Apache (PHP Edition - Recommended for Production)**: Native PDO connection to MariaDB on `localhost`, zero daemons to maintain, ready for drag-and-drop upload to DirectAdmin.
2. **Node.js + Express (Local Development Edition)**: Available in `admin/backend` with dual SQLite/MariaDB engines.

---

## 1. Directory Structure

```
admin/
├── index.html            # Main Admin Login & Dispatch Dashboard Single-Page App
├── styles.css            # Dark Architectural OLED Aesthetic Design System
├── app.js                # Frontend Client Logic (auto-detects PHP / Node API)
├── logo.png              # Malas Electronics Brand Identity
├── .htaccess             # Apache / DirectAdmin Security & Routing Configuration
│
├── api/                  # Native PHP Backend (DirectAdmin / Apache)
│   ├── config.php        # MariaDB 10.6 PDO connection & pure PHP RFC-7519 JWT engine
│   ├── auth.php          # Login, Logout, /me Admin Profile
│   ├── inquiries.php     # Inquiries CRUD (Status, Filters, Assignee)
│   ├── dashboard.php     # Dashboard Metrics & MariaDB Diagnostics
│   └── .htaccess         # API Route Rewrites & Security Headers
│
├── backend/              # Node.js + Express Edition (Alternative / Local Dev)
│   ├── config/db.js
│   ├── routes/
│   ├── server.js
│   └── schema.sql
│
└── README.md
```

---

## 2. DirectAdmin / Shared Hosting Deployment (PHP)

### Step 1: Upload the `admin` Folder
1. Log in to your DirectAdmin control panel at `https://host7.cloudindianserver.com:2222/`.
2. Open **File Manager** and navigate into `public_html/`.
3. Upload the `admin/` folder so it resides at `public_html/admin/`.

### Step 2: MariaDB Database Connection
The credentials are pre-configured in `admin/api/config.php`:
- **DB Host**: `localhost` (connects internally via server socket)
- **DB Name**: `malasele_db`
- **DB User**: `malasele_db`
- **DB Password**: `MERyhcyxUdEVeF34VzkG`

*Note: On first visit, `admin/api/config.php` will automatically create the required database tables (`admins`, `rfp_inquiries`, `audit_logs`, `site_settings`) and seed the default chief administrator account.*

### Step 3: Access the Portal
Navigate in your browser to:
**`https://malaselectronics.ae/admin/`**

### Step 4: Login Credentials
- **Username**: `admin` (or `admin@malaselectronics.com`)
- **Initial Password**: `Admin@Malas2026!`

---

## 3. Database Schema Overview (`malasele_db`)

| Table Name | Description | Key Fields |
|---|---|---|
| `admins` | Operational administrators with bcrypt hashes | `id`, `username`, `email`, `password_hash`, `role`, `status`, `last_login` |
| `rfp_inquiries` | Client project scopes from landing page | `id`, `client_name`, `email`, `phone`, `sector`, `venue_type`, `scope_notes`, `status` |
| `audit_logs` | Security activity & admin actions | `id`, `admin_id`, `action`, `details`, `ip_address`, `created_at` |
| `site_settings` | Key-value store for site and company metadata | `setting_key`, `setting_value`, `description`, `updated_at` |

---

## 4. Why PHP on DirectAdmin?
- **Internal `localhost` Access**: DirectAdmin blocks external MySQL connections on port 3306 by default. Because PHP runs directly on the server, it connects to MariaDB 10.6 internally with zero network latency and no firewall blocks.
- **Maintenance Free**: PHP scripts execute per request and terminate cleanly. There is no daemon process (like PM2 or Docker) that needs to be monitored or restarted.
- **Clean REST API**: Pure PHP implementation with RFC-7519 JWT verification, prepared statements to prevent SQL injection, and bcrypt password hashing.
