# Quick Start Guide - MySQL Setup

## ✅ Step 1: Database Created ✓
You've already created the database!

## Step 2: Run SQL Script in MySQL

In your MySQL command line (where you see `mysql>`), run:

```sql
USE admin_panel_db;
SOURCE scripts/init-database.sql;
```

**OR** copy and paste the SQL commands from `scripts/init-database.sql` directly into MySQL.

**OR** from your terminal (outside MySQL), run:

```bash
mysql -u root -p admin_panel_db < scripts/init-database.sql
```

This will create:
- `users` table
- `subscriptions` table  
- `subscription_history` table
- `login_history` table
- `payment_requests` table

## Step 3: Create Super Admin with Proper Password

The script has a placeholder password hash. Let's create the super admin properly.

**Option A: Let the app create it automatically**
- The super admin will be created automatically when you first start the app
- Just make sure to register/login with: `superadmin@admin.com` / `superadmin123`

**Option B: Create manually in MySQL**

First, generate a password hash. In Node.js:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('superadmin123', 10).then(hash => console.log(hash));
```

Then in MySQL:
```sql
USE admin_panel_db;
INSERT INTO users (id, name, email, password, role, shopName, contactNumber, tenantId)
VALUES (
  UUID(),
  'Super Admin',
  'superadmin@admin.com',
  '$2a$10$YOUR_HASH_HERE', -- Replace with hash from above
  'SUPER_ADMIN',
  'System Administration',
  'N/A',
  UUID()
);
```

## Step 4: Configure .env File

Create/update `.env` file in project root:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=admin_panel_db
```

**Replace `your_mysql_password_here` with your actual MySQL root password!**

## Step 5: Start the Application

```bash
npm run dev
```

## Step 6: Test Login

1. Open http://localhost:3000
2. Go to `/register` and create a new user
   - OR login with super admin (if created manually)
3. The app will automatically create tenant tables for new users

## Verify Tables Were Created

In MySQL, check:

```sql
USE admin_panel_db;
SHOW TABLES;
```

You should see:
- users
- subscriptions
- subscription_history
- login_history
- payment_requests

## What Happens Next

- **New User Registration**: Tenant tables (`tenant_xxx_repair_tickets`, etc.) are created automatically
- **Super Admin**: Can access all tenant data via super admin panel
- **Each User**: Has isolated tables in the same database

## Troubleshooting

**Error: "Table doesn't exist"**
- Make sure you ran the SQL script
- Check: `SHOW TABLES;` in MySQL

**Error: "Access denied"**
- Check `.env` file has correct password
- Verify MySQL user has permissions

**Error: "Can't connect to MySQL"**
- Check MySQL is running
- Verify DB_HOST, DB_PORT in `.env`

