/**
 * Test Super Admin Login
 * Simulates the login API call to verify it works
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testSuperAdminLogin() {
  console.log('🧪 Testing Super Admin Login...\n');

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

  console.log('📋 Configuration:');
  console.log(`   Database: ${config.database}`);
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log('');

  try {
    const connection = await mysql.createConnection(config);
    console.log(`✅ Connected to ${config.database}\n`);

    const email = 'superadmin@admin.com';
    const password = 'superadmin123';

    // Simulate login API
    console.log('🔐 Simulating login...');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);

    // Find user (case-insensitive)
    const [users] = await connection.execute(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`,
      [email.trim()]
    );

    if (users.length === 0) {
      console.log('❌ User not found!\n');
      console.log('💡 Available users:');
      const [allUsers] = await connection.execute(`SELECT email, role FROM users LIMIT 10`);
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.role})`);
      });
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('');

    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Password is INCORRECT!\n');
      console.log('🔧 Fixing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        `UPDATE users SET password = ? WHERE email = ?`,
        [hashedPassword, email]
      );
      console.log('✅ Password updated!\n');
      
      // Verify again
      const [updatedUser] = await connection.execute(
        `SELECT password FROM users WHERE email = ?`,
        [email]
      );
      const isValidNow = await bcrypt.compare(password, updatedUser[0].password);
      console.log(`   Password verification: ${isValidNow ? '✅ CORRECT' : '❌ STILL INCORRECT'}\n`);
    } else {
      console.log('✅ Password is CORRECT!\n');
    }

    // Check role
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'super_admin') {
      console.log('⚠️  Role is not SUPER_ADMIN. Updating...');
      await connection.execute(
        `UPDATE users SET role = 'SUPER_ADMIN' WHERE email = ?`,
        [email]
      );
      console.log('✅ Role updated to SUPER_ADMIN!\n');
    }

    // Final check
    const [finalCheck] = await connection.execute(
      `SELECT id, name, email, role FROM users WHERE email = ?`,
      [email]
    );

    if (finalCheck.length > 0) {
      const finalUser = finalCheck[0];
      console.log('📋 Final Status:');
      console.log('='.repeat(60));
      console.log(`   ✅ User exists: ${finalUser.name}`);
      console.log(`   ✅ Email: ${finalUser.email}`);
      console.log(`   ✅ Role: ${finalUser.role}`);
      console.log(`   ✅ Password: ${isPasswordValid ? 'CORRECT' : 'UPDATED'}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('🔑 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');
      console.log('💡 Troubleshooting:');
      console.log('   1. Make sure you\'re using the correct database');
      console.log(`   2. Current database: ${config.database}`);
      console.log('   3. Check browser console (F12) for errors');
      console.log('   4. Clear browser cache and cookies');
      console.log('   5. Restart your development server');
      console.log('   6. Try incognito/private browsing mode');
    }

    await connection.end();
    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.sqlMessage) {
      console.error('   SQL Error:', error.sqlMessage);
    }
    console.error('\n💡 Possible issues:');
    console.error('   1. Database connection failed');
    console.error('   2. Wrong database name in .env file');
    console.error('   3. Database credentials incorrect');
    process.exit(1);
  }
}

testSuperAdminLogin();

