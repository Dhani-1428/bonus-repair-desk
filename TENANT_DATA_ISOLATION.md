# Tenant Data Isolation Guide

## Overview

This application uses **automatic tenant table creation** to ensure each user's data is completely isolated in their own separate tables within the same database.

## How It Works

### 1. **Automatic Table Creation on Signup**

When a user signs up:
1. A unique `tenantId` is generated (UUID)
2. The user is created in the `users` table with their `tenantId`
3. **Four tenant-specific tables are automatically created:**
   - `tenant_{tenantId}_repair_tickets` - All repair tickets
   - `tenant_{tenantId}_team_members` - All team members
   - `tenant_{tenantId}_deleted_tickets` - Soft-deleted tickets
   - `tenant_{tenantId}_deleted_members` - Soft-deleted members

### 2. **Data Storage**

All user data is automatically saved to their tenant tables:

- **Repair Tickets**: Saved to `tenant_{tenantId}_repair_tickets`
- **Team Members**: Saved to `tenant_{tenantId}_team_members`
- **Deleted Items**: Moved to `tenant_{tenantId}_deleted_*` tables

### 3. **Automatic Table Creation on First Use**

If tables don't exist when a user first creates data:
- Tables are created automatically before saving
- No manual intervention required
- Works seamlessly in the background

## Verification

### Check Tenant Data

Run the verification script to see all tenant data:

```bash
node scripts/verify-tenant-data.js
```

This will show:
- All users and their tenant IDs
- Which tables exist for each tenant
- Data counts for each tenant
- Latest entries in each table

### Manual SQL Check

```sql
-- See all tenant tables
SHOW TABLES LIKE 'tenant_%';

-- Check a specific user's tenant ID
SELECT id, name, email, tenantId FROM users WHERE email = 'user@example.com';

-- Check user's repair tickets (replace tenantId)
SELECT * FROM tenant_{tenantId}_repair_tickets;

-- Check user's team members
SELECT * FROM tenant_{tenantId}_team_members;
```

## Table Naming Convention

Tables are named using the pattern:
```
tenant_{sanitizedTenantId}_{table_type}
```

Where:
- `sanitizedTenantId` = tenantId with dashes replaced by underscores
- `table_type` = `repair_tickets`, `team_members`, `deleted_tickets`, `deleted_members`

Example:
- Tenant ID: `abc-123-def-456`
- Tables:
  - `tenant_abc_123_def_456_repair_tickets`
  - `tenant_abc_123_def_456_team_members`
  - `tenant_abc_123_def_456_deleted_tickets`
  - `tenant_abc_123_def_456_deleted_members`

## Data Isolation Guarantees

✅ **Complete Isolation**: Each user's data is in separate tables
✅ **No Cross-Tenant Access**: Users can only access their own tenant's data
✅ **Super Admin Access**: Super admin can view all tenant data
✅ **Automatic Creation**: Tables created automatically, no manual setup needed
✅ **Error Handling**: If table creation fails, it retries on next data entry

## Logging

The system logs all tenant operations:

```
[API] Creating tenant tables for tenantId: abc-123-def
[API] ✅ Tenant tables created for user: user-123
[API] Saving repair ticket to tenant table: tenant_abc_123_def_repair_tickets
[API] ✅ Repair ticket saved successfully
```

Check your server terminal for these logs to verify data is being saved correctly.

## Troubleshooting

### Tables Not Created

If tables aren't created on signup:
1. Check server logs for errors
2. Tables will be created automatically on first data entry
3. Run verification script to check: `node scripts/verify-tenant-data.js`

### Data Not Appearing

If data isn't appearing:
1. Verify user has a `tenantId` in the `users` table
2. Check which tenant table the data should be in
3. Verify tables exist: `SHOW TABLES LIKE 'tenant_%'`
4. Check server logs for save confirmations

### Multiple Users See Same Data

This should never happen! If it does:
1. Check that each user has a unique `tenantId`
2. Verify API routes are using the correct `tenantId`
3. Check server logs to see which table data is being saved to

## Benefits

1. **Complete Data Isolation**: Each user's data is completely separate
2. **Easy Backup**: Backup individual tenant tables
3. **Easy Migration**: Move tenant data between databases easily
4. **Super Admin Access**: View all tenant data from one database
5. **Scalability**: Add unlimited tenants without affecting others
6. **Security**: Tenant-level isolation prevents data leaks

## Summary

✅ **Automatic**: Tables created on signup
✅ **Isolated**: Each user has their own tables
✅ **Verified**: Use verification script to check
✅ **Logged**: All operations are logged
✅ **Secure**: Complete data isolation guaranteed
