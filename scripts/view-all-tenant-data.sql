-- View All Tenant Data in MySQL
-- This script shows how to see each user's admin panel data

-- Step 1: See all users and their tenant IDs
SELECT 
    id,
    name,
    email,
    role,
    tenantId,
    shopName,
    contactNumber,
    createdAt
FROM users
WHERE role != 'SUPER_ADMIN' AND role != 'super_admin'
ORDER BY createdAt DESC;

-- Step 2: See all tenant tables in the database
SHOW TABLES LIKE 'tenant_%';

-- Step 3: For a specific user, replace {tenantId} with their actual tenantId
-- Example: If tenantId is 'abc-123-def-456', the table name would be 'tenant_abc_123_def_456_repair_tickets'

-- View repair tickets for a specific tenant
-- Replace 'YOUR_TENANT_ID' with the actual tenantId (with dashes replaced by underscores)
-- Example: tenantId 'abc-123-def' becomes table name 'tenant_abc_123_def_repair_tickets'

-- Step 4: Get tenant ID from user email
-- Replace 'user@example.com' with the actual user email
SELECT 
    u.id AS userId,
    u.name AS userName,
    u.email,
    u.tenantId,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_repair_tickets') AS repairTicketsTable,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_team_members') AS teamMembersTable
FROM users u
WHERE u.email = 'user@example.com';

-- Step 5: View repair tickets for a specific user (replace tenantId)
-- Example query (replace the table name with actual tenant table name):
/*
SELECT 
    id,
    repairNumber,
    spu,
    clientId,
    customerName,
    contact,
    imeiNo,
    brand,
    model,
    problem,
    price,
    status,
    createdAt
FROM tenant_YOUR_TENANT_ID_repair_tickets
ORDER BY createdAt DESC;
*/

-- Step 6: View team members for a specific user
/*
SELECT 
    id,
    name,
    email,
    role,
    createdAt
FROM tenant_YOUR_TENANT_ID_team_members
ORDER BY createdAt DESC;
*/

-- Step 7: Count data for each tenant
SELECT 
    u.id AS userId,
    u.name AS userName,
    u.email,
    u.tenantId,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_repair_tickets') AS repairTicketsTable,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_team_members') AS teamMembersTable
FROM users u
WHERE u.role != 'SUPER_ADMIN' AND u.role != 'super_admin'
ORDER BY u.createdAt DESC;

