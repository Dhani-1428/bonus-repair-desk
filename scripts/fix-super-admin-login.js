/**
 * Fix Super Admin Login
 * Ensures super admin exists in the correct database with correct password
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixSuperAdminLogin() {
  console.log('🔧 Fixing Super Admin Login...\n');

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

  console.log('📋 Database Configuration:');
  console.log(`   Database: ${config.database}`);
  console.log(`   Host: ${config.host}`);
  console.log('');

  try {
    const connection = await mysql.createConnection(config);
    console.log(`✅ Connected to ${config.database}\n`);

    // Check if super admin exists
    const [users] = await connection.execute(
      `SELECT id, name, email, role, password FROM users WHERE email = 'superadmin@admin.com' OR role = 'SUPER_ADMIN'`
    );

    if (users.length === 0) {
      console.log('❌ Super admin not found. Creating...\n');
      const { v4: uuidv4 } = require('uuid');
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const userId = uuidv4();
      const tenantId = uuidv4();

      await connection.execute(
        `INSERT INTO users (id, name, email, password, role, shopName, contactNumber, tenantId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, 'Super Admin', 'superadmin@admin.com', hashedPassword, 'SUPER_ADMIN', 'System Administration', 'N/A', tenantId]
      );

      console.log('✅ Super admin created!\n');
    } else {
      console.log('✅ Super admin found. Verifying password...\n');
      
      const user = users[0];
      const isValid = await bcrypt.compare('superadmin123', user.password);
      
      if (!isValid) {
        console.log('❌ Password incorrect. Updating...\n');
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        await connection.execute(
          `UPDATE users SET password = ? WHERE email = 'superadmin@admin.com'`,
          [hashedPassword]
        );
        console.log('✅ Password updated!\n');
      } else {
        console.log('✅ Password is correct!\n');
      }

      // Ensure role is correct
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'super_admin') {
        console.log('⚠️  Role incorrect. Updating to SUPER_ADMIN...\n');
        await connection.execute(
          `UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'superadmin@admin.com'`
        );
        console.log('✅ Role updated to SUPER_ADMIN!\n');
      }
    }

    // Final verification
    const [finalUser] = await connection.execute(
      `SELECT id, name, email, role FROM users WHERE email = 'superadmin@admin.com'`
    );

    if (finalUser.length > 0) {
      const [passwordCheck] = await connection.execute(
        `SELECT password FROM users WHERE email = 'superadmin@admin.com'`
      );
      const isValid = await bcrypt.compare('superadmin123', passwordCheck[0].password);

      console.log('📋 Final Verification:');
      console.log('='.repeat(60));
      console.log(`   Name: ${finalUser[0].name}`);
      console.log(`   Email: ${finalUser[0].email}`);
      console.log(`   Role: ${finalUser[0].role}`);
      console.log(`   Password: ${isValid ? '✅ CORRECT' : '❌ INCORRECT'}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('🔑 Login Credentials:');
      console.log('   Email: superadmin@admin.com');
      console.log('   Password: superadmin123');
      console.log('');
      console.log('💡 If login still fails:');
      console.log('   1. Check browser console for errors (F12)');
      console.log('   2. Verify .env file has correct DB_NAME');
      console.log('   3. Restart your development server');
      console.log('   4. Clear browser cache and cookies');
    }

    await connection.end();
    console.log('✅ Fix complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.sqlMessage) {
      console.error('   SQL Error:', error.sqlMessage);
    }
    process.exit(1);
  }
}

fixSuperAdminLogin();

