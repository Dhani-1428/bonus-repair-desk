-- View All Repair Tickets for sam@samphone.com
-- Database: defaultdb
-- Tenant ID: 88385eae-12e6-4b89-a5ea-84d2ed8ba94e
-- Table: tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets

USE defaultdb;

-- Query 1: View all tickets with basic information
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
    serialNo,
    problem,
    price,
    status,
    createdAt,
    updatedAt
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
ORDER BY createdAt DESC;

-- Query 2: View all tickets with detailed information (including equipment check)
SELECT 
    id,
    repairNumber,
    spu,
    clientId AS 'Client NIF',
    customerName AS 'Customer Name',
    contact AS 'Phone',
    imeiNo AS 'IMEI',
    brand,
    model,
    serialNo AS 'Serial Number',
    warranty,
    simCard,
    memoryCard,
    charger,
    battery,
    waterDamaged,
    equipmentObs AS 'Equipment Observations',
    repairObs AS 'Repair Observations',
    selectedServices AS 'Services',
    condition AS 'Condition on Arrival',
    problem AS 'Technician Notes',
    price,
    status,
    createdAt AS 'Entry Date',
    updatedAt AS 'Last Updated'
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
ORDER BY createdAt DESC;

-- Query 3: Count tickets by status
SELECT 
    status,
    COUNT(*) AS ticket_count
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
GROUP BY status
ORDER BY ticket_count DESC;

-- Query 4: Get total count and summary
SELECT 
    COUNT(*) AS total_tickets,
    SUM(price) AS total_revenue,
    AVG(price) AS average_price,
    MIN(createdAt) AS first_ticket_date,
    MAX(createdAt) AS last_ticket_date
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets;

-- Query 5: View tickets by status (filtered)
-- For PENDING tickets:
SELECT 
    repairNumber,
    customerName,
    brand,
    model,
    problem,
    price,
    createdAt
FROM tenant_88385eae_12e6_4b89_a5ea_84d2ed8ba94e_repair_tickets
WHERE status = 'PENDING'
ORDER BY createdAt DESC;

-- Query 6: View recent tickets (last 10)
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
ORDER BY createdAt DESC
LIMIT 10;

