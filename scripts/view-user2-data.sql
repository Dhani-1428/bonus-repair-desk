-- View Data for User 2: Sam (sam@samphone.com)
-- Tenant ID: 88385eae-12e6-4b89-a5ea-84d2ed8ba94e

USE admin_panel_db;

-- 1. View User Information
SELECT id, name, email, shopName, contactNumber, tenantId, createdAt 
FROM users 
WHERE email = 'sam@samphone.com';

-- 2. View All Repair Tickets for User 2
SELECT * 
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets 
ORDER BY createdAt DESC;

-- 3. View Repair Tickets Count
SELECT COUNT(*) as total_tickets 
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets;

-- 4. View Repair Tickets by Status
SELECT status, COUNT(*) as count 
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets 
GROUP BY status;

-- 5. View Team Members for User 2
SELECT * 
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_team_members 
ORDER BY createdAt DESC;

-- 6. View Deleted Tickets (if any)
SELECT * 
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_deleted_tickets 
ORDER BY deletedAt DESC;

-- 7. View Deleted Team Members (if any)
SELECT * 
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_deleted_members 
ORDER BY deletedAt DESC;

-- 8. View Subscription Information
SELECT * 
FROM subscriptions 
WHERE userId = (SELECT id FROM users WHERE email = 'sam@samphone.com');

-- 9. View Payment Requests
SELECT * 
FROM payment_requests 
WHERE userId = (SELECT id FROM users WHERE email = 'sam@samphone.com')
ORDER BY createdAt DESC;

-- 10. View Login History
SELECT * 
FROM login_history 
WHERE userId = (SELECT id FROM users WHERE email = 'sam@samphone.com')
ORDER BY timestamp DESC
LIMIT 20;

-- 11. View All Tables for This Tenant
SHOW TABLES LIKE 'tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e%';

-- 12. Summary Query - Get all data at once
SELECT 
    'User Info' as data_type,
    u.name,
    u.email,
    u.shopName,
    u.tenantId,
    (SELECT COUNT(*) FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets) as repair_tickets_count,
    (SELECT COUNT(*) FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_team_members) as team_members_count
FROM users u
WHERE u.email = 'sam@samphone.com';

