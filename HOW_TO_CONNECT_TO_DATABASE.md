# How to Connect to Your Database and View User Data

## ⚠️ Important: You're Using Aiven Cloud Database

Your database is hosted on **Aiven Cloud**, not localhost. You need to connect using the cloud server details.

## Connection Information

From your `.env` file:
- **Host**: `mysql-2d150b00-dhani.d.aivencloud.com`
- **Port**: `21649`
- **User**: `avnadmin`
- **Database**: `defaultdb`
- **SSL**: Required (Aiven uses SSL)

## Method 1: MySQL Command Line (Recommended)

### Step 1: Connect to Aiven Database

```bash
mysql -h mysql-2d150b00-dhani.d.aivencloud.com -P 21649 -u avnadmin -p --ssl-mode=REQUIRED defaultdb
```

**OR** if your MySQL client doesn't support `--ssl-mode`:

```bash
mysql -h mysql-2d150b00-dhani.d.aivencloud.com -P 21649 -u avnadmin -p --ssl defaultdb
```

**OR** if you need to disable SSL verification (for testing):

```bash
mysql -h mysql-2d150b00-dhani.d.aivencloud.com -P 21649 -u avnadmin -p --ssl --ssl-verify-server-cert=0 defaultdb
```

### Step 2: Enter Password

When prompted, enter your Aiven database password (from your `.env` file: `DB_PASSWORD`)

### Step 3: You're Connected!

You should see:
```
mysql>
```

### Step 4: View Users

```sql
SELECT id, name, email, tenantId, shopName, contactNumber 
FROM users 
ORDER BY createdAt DESC;
```

### Step 5: View Repair Tickets for a User

```sql
-- Example for sam@samphone.com
SELECT 
    repairNumber,
    customerName,
    clientId,
    brand,
    model,
    price,
    status,
    createdAt
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
ORDER BY createdAt DESC;
```

## Method 2: Use the Script (Easiest)

Just run:

```bash
node scripts/view-tenant-data-by-user.js
```

This automatically connects to the correct database and shows all user data.

## Method 3: MySQL Workbench / GUI Tool

1. **Create New Connection:**
   - Host: `mysql-2d150b00-dhani.d.aivencloud.com`
   - Port: `21649`
   - Username: `avnadmin`
   - Password: (from your `.env` file)
   - Default Schema: `defaultdb`
   - SSL: Enable SSL

2. **Connect** and then run queries

## Troubleshooting

### Error: "Unknown database 'defaultdb'"

**This means you're connected to the wrong MySQL server!**

**Solution:**
1. Make sure you're connecting to the Aiven host: `mysql-2d150b00-dhani.d.aivencloud.com`
2. Make sure you're using port `21649` (not the default 3306)
3. Use the connection command above with the correct host and port

### Error: "Access denied"

**Solution:**
1. Check your password in `.env` file (`DB_PASSWORD`)
2. Make sure you're using the correct username: `avnadmin`

### Error: "SSL connection required"

**Solution:**
Add `--ssl` flag to your MySQL command:
```bash
mysql -h mysql-2d150b00-dhani.d.aivencloud.com -P 21649 -u avnadmin -p --ssl defaultdb
```

## Quick Reference

### Your 4 Users and Their Tables:

1. **Sam (sam@gmail.com)**
   - Table: `tenant_bd61aca6_d6f0_423f_be1c_f58078788e41_repair_tickets`

2. **Dhani Singh Chauhan (sheetal.singh.chauhan@gmail.com)**
   - Table: `tenant_856b76a2_e90f_4d8c_ac60_78b585ccc907_repair_tickets`

3. **Sam (sam@samphone.com)**
   - Table: `tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets`

4. **Dhani Singh Chauhan (chauhandhani26@gmail.com)**
   - Table: `tenant_b41c87b9_2d43_4965_88d2_d6fb369e288e_repair_tickets`

## Summary

✅ **Database**: `defaultdb` (on Aiven Cloud)
✅ **Host**: `mysql-2d150b00-dhani.d.aivencloud.com`
✅ **Port**: `21649`
✅ **User**: `avnadmin`
✅ **SSL**: Required
✅ **Easiest Method**: Run `node scripts/view-tenant-data-by-user.js`

