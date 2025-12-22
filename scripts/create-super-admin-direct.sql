-- Create Super Admin User
-- Password: superadmin123
-- This hash is for 'superadmin123' generated with bcrypt

-- First, generate the password hash using Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('superadmin123', 10).then(hash => console.log(hash));

-- Then use this SQL (replace HASH_HERE with the generated hash):
INSERT INTO users (id, name, email, password, role, shopName, contactNumber, tenantId)
VALUES (
  UUID(),
  'Super Admin',
  'superadmin@admin.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- bcrypt hash for 'superadmin123'
  'SUPER_ADMIN',
  'System Administration',
  'N/A',
  UUID()
)
ON DUPLICATE KEY UPDATE email=email;

