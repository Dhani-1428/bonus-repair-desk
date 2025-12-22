/**
 * Fix Super Admin Password
 * This script updates the super admin password hash
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixSuperAdmin() {
  console.log('🔧 Fixing Super Admin Password...\n');

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 10000,
  };

  try {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Check if super admin exists
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = 'superadmin@admin.com'"
    );

    if (users.length === 0) {
      console.log('❌ Super admin not found. Creating...');
      const { v4: uuidv4 } = require('uuid');
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const userId = uuidv4();
      const tenantId = uuidv4();

      await connection.execute(
        `INSERT INTO users (id, name, email, password, role, shopName, contactNumber, tenantId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'Super Admin', 'superadmin@admin.com', hashedPassword, 'SUPER_ADMIN', 'System Administration', 'N/A', tenantId]
      );

      console.log('✅ Super admin created!');
    } else {
      console.log('👤 Super admin found. Updating password...');
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      
      await connection.execute(
        `UPDATE users SET password = ? WHERE email = 'superadmin@admin.com'`,
        [hashedPassword]
      );

      console.log('✅ Password updated!');
    }

    // Verify password
    console.log('\n🔐 Verifying password...');
    const [updatedUser] = await connection.execute(
      "SELECT * FROM users WHERE email = 'superadmin@admin.com'"
    );

    if (updatedUser.length > 0) {
      const isValid = await bcrypt.compare('superadmin123', updatedUser[0].password);
      if (isValid) {
        console.log('✅ Password verification successful!');
        console.log('\n📋 Login Credentials:');
        console.log('   Email: superadmin@admin.com');
        console.log('   Password: superadmin123');
      } else {
        console.log('❌ Password verification failed!');
      }
    }

    await connection.end();
    console.log('\n🎉 Super admin password fixed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

fixSuperAdmin();

