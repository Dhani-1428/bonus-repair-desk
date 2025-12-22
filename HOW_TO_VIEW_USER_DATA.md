# How to View Different Users' Admin Panel Data in MySQL

## ⚠️ IMPORTANT: Database Name

Your user data is stored in **`defaultdb`**, NOT `admin_panel_db`!

The `.env` file is configured to use `defaultdb`, which is where all your users and their data are stored.

## Quick Method: Use the Script

The easiest way is to run the provided script:

```bash
node scripts/view-tenant-data-by-user.js
```

This automatically connects to `defaultdb` and shows all user data.

## Manual Method: Using MySQL Commands

### Step 1: Connect to MySQL and Switch Database

```sql
-- Connect to MySQL first, then:
USE defaultdb;
```

**NOT** `admin_panel_db` - that database only has the super admin!

### Step 2: List All Users

```sql
SELECT 
    id,
    name,
    email,
    tenantId,
    shopName,
    contactNumber,
    createdAt
FROM users
WHERE role != 'SUPER_ADMIN' AND role != 'super_admin'
ORDER BY createdAt DESC;
```

### Step 3: See All Tenant Tables

```sql
SHOW TABLES LIKE 'tenant_%';
```

This shows all tenant-specific tables (repair tickets, team members, etc.)

### Step 4: View Repair Tickets for a Specific User

First, get the user's tenantId from Step 2, then replace dashes with underscores.

**Example for user "sam@samphone.com":**

```sql
-- The tenantId is: 88385eae-12e6-4b89-a5ea-84d2ed8ba94e
-- Table name becomes: tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets

SELECT 
    repairNumber,
    spu,
    clientId,
    customerName,
    contact,
    brand,
    model,
    problem,
    price,
    status,
    createdAt
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
ORDER BY createdAt DESC;
```

### Step 5: View Team Members for a User

```sql
SELECT 
    id,
    name,
    email,
    role,
    createdAt
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_team_members
ORDER BY createdAt DESC;
```

## All Your Users and Their Table Names

Based on your data, here are all users:

### User 1: Sam (sam@gmail.com)
- **Tenant ID**: `bd61aca6-d6f0-423f-be1c-f58078788e41`
- **Repair Tickets Table**: `tenant_bd61aca6_d6f0_423f_be1c_f58078788e41_repair_tickets`
- **Team Members Table**: `tenant_bd61aca6_d6f0_423f_be1c_f58078788e41_team_members`
- **Has 2 repair tickets**

### User 2: Dhani Singh Chauhan (sheetal.singh.chauhan@gmail.com)
- **Tenant ID**: `856b76a2-e90f-4d8c-ac60-78b585ccc907`
- **Repair Tickets Table**: `tenant_856b76a2_e90f_4d8c_ac60_78b585ccc907_repair_tickets`
- **Team Members Table**: `tenant_856b76a2_e90f_4d8c_ac60_78b585ccc907_team_members`
- **Has 0 repair tickets**

### User 3: Sam (sam@samphone.com)
- **Tenant ID**: `88385eae-12e6-4b89-a5ea-84d2ed8ba94e`
- **Repair Tickets Table**: `tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets`
- **Team Members Table**: `tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_team_members`
- **Has 7 repair tickets**

### User 4: Dhani Singh Chauhan (chauhandhani26@gmail.com)
- **Tenant ID**: `b41c87b9-2d43-4965-88d2-d6fb369e288e`
- **Repair Tickets Table**: `tenant_b41c87b9_2d43_4965_88d2_d6fb369e288e_repair_tickets`
- **Team Members Table**: `tenant_b41c87b9_2d43_4965_88d2_d6fb369e288e_team_members`
- **Has 0 repair tickets**

## Example Queries

### View all repair tickets for user "sam@samphone.com":

```sql
USE defaultdb;

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

### View all repair tickets for user "sam@gmail.com":

```sql
USE defaultdb;

SELECT 
    repairNumber,
    customerName,
    clientId,
    brand,
    model,
    price,
    status,
    createdAt
FROM tenant_bd61aca6_d6f0_423f_be1c_f58078788e41_repair_tickets
ORDER BY createdAt DESC;
```

### Get table names for any user:

```sql
USE defaultdb;

SELECT 
    u.name,
    u.email,
    u.tenantId,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_repair_tickets') AS repairTicketsTable,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_team_members') AS teamMembersTable
FROM users u
WHERE u.email = 'sam@samphone.com';
```

## Quick Reference

1. **Always use `defaultdb`** - not `admin_panel_db`
2. **Replace dashes with underscores** in tenantId for table names
3. **Each user has 4 tables**:
   - `tenant_{tenantId}_repair_tickets`
   - `tenant_{tenantId}_team_members`
   - `tenant_{tenantId}_deleted_tickets`
   - `tenant_{tenantId}_deleted_members`

## Summary

✅ **Database**: `defaultdb` (NOT `admin_panel_db`)
✅ **Users**: 4 regular users + 1 super admin
✅ **Total Repair Tickets**: 9 tickets across all users
✅ **Script**: `node scripts/view-tenant-data-by-user.js` (easiest method)
✅ **SQL File**: `scripts/view-tenant-data-sql.sql` (ready-to-use queries)

