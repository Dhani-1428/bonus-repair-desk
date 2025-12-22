
-- View Tenant Data in MySQL
-- IMPORTANT: Your data is in 'defaultdb' on Aiven Cloud!

-- CONNECTION INFO:
-- Host: mysql-2d150b00-dhani.d.aivencloud.com
-- Port: 21649
-- User: avnadmin
-- Database: defaultdb
-- SSL: Required

-- To connect via MySQL command line:
-- mysql -h mysql-2d150b00-dhani.d.aivencloud.com -P 21649 -u avnadmin -p --ssl defaultdb

-- Step 1: You should already be connected to defaultdb
-- If not, connect using the command above

-- Step 2: See all users (excluding super admin)
SELECT 
    id,
    name,
    email,
    tenantId,
    shopName,
    contactNumber,
    role,
    createdAt
FROM users
WHERE role != 'SUPER_ADMIN' AND role != 'super_admin'
ORDER BY createdAt DESC;

-- Step 3: See all tenant tables
SHOW TABLES LIKE 'tenant_%';

-- Step 4: Get table names for a specific user
-- Replace 'sam@samphone.com' with the actual user email
SELECT 
    u.id AS userId,
    u.name AS userName,
    u.email,
    u.tenantId,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_repair_tickets') AS repairTicketsTable,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_team_members') AS teamMembersTable
FROM users u
WHERE u.email = 'sam@samphone.com';

-- Step 5: View repair tickets for user "sam@samphone.com"
-- Tenant ID: 88385eae-12e6-4b89-a5ea-84d2ed8ba94e
-- Table name: tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
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
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
ORDER BY createdAt DESC;

-- Step 6: View team members for user "sam@samphone.com"
SELECT 
    id,
    name,
    email,
    role,
    createdAt
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_team_members
ORDER BY createdAt DESC;

-- Step 7: View repair tickets for user "Sam (sam@gmail.com)"
-- Tenant ID: bd61aca6-d6f0-423f-be1c-f58078788e41
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

-- Step 8: Count repair tickets per user
SELECT 
    u.name,
    u.email,
    u.tenantId,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_repair_tickets') AS tableName
FROM users u
WHERE u.role != 'SUPER_ADMIN' AND u.role != 'super_admin'
ORDER BY u.createdAt DESC;

-- Step 9: View all data for all users (summary)
-- This shows each user with their tenant table names
SELECT 
    u.id,
    u.name,
    u.email,
    u.tenantId,
    u.shopName,
    u.contactNumber,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_repair_tickets') AS repairTicketsTable,
    CONCAT('tenant_', REPLACE(u.tenantId, '-', '_'), '_team_members') AS teamMembersTable
FROM users u
WHERE u.role != 'SUPER_ADMIN' AND u.role != 'super_admin'
ORDER BY u.createdAt DESC;

