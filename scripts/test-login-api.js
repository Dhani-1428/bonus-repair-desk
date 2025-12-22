/**
 * Test Login API Directly
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLoginAPI() {
  console.log('🧪 Testing Login API Logic...\n');

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
  console.log('');

  try {
    const connection = await mysql.createConnection(config);
    console.log(`✅ Connected to ${config.database}\n`);

    const email = 'superadmin@admin.com';
    const password = 'superadmin123';

    console.log('🔐 Testing login logic...\n');

    // Step 1: Find user
    console.log('1️⃣ Finding user...');
    const [users] = await connection.execute(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(?)`,
      [email.trim()]
    );

    if (users.length === 0) {
      console.log('❌ User not found!\n');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log('');

    // Step 2: Verify password
    console.log('2️⃣ Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Password is INCORRECT!\n');
      await connection.end();
      return;
    }
    
    console.log('✅ Password is CORRECT!\n');

    // Step 3: Test login history insert
    console.log('3️⃣ Testing login history insert...');
    try {
      const loginId = `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await connection.execute(
        `INSERT INTO login_history (id, userId, tenantId, ip) VALUES (?, ?, ?, ?)`,
        [loginId, user.id, user.tenantId, '127.0.0.1']
      );
      console.log('✅ Login history inserted successfully!\n');
    } catch (historyError) {
      console.log('⚠️  Login history insert failed (non-critical):', historyError.message);
      console.log('   This should not block login\n');
    }

    // Step 4: Prepare user response
    console.log('4️⃣ Preparing user response...');
    const { password: _, ...userWithoutPassword } = user;
    console.log('✅ User data prepared (password excluded)');
    console.log(`   User ID: ${userWithoutPassword.id}`);
    console.log(`   Email: ${userWithoutPassword.email}`);
    console.log(`   Role: ${userWithoutPassword.role}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('');
    console.log('💡 If login still fails in the browser:');
    console.log('   1. Check browser console (F12) for detailed errors');
    console.log('   2. Check server terminal for API errors');
    console.log('   3. Verify the development server is running');
    console.log('   4. Try clearing browser cache');
    console.log('   5. Check network tab in browser DevTools');

    await connection.end();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.sqlMessage) {
      console.error('   SQL Error:', error.sqlMessage);
    }
    console.error('\n💡 This error might be causing the login failure.');
    process.exit(1);
  }
}

testLoginAPI();

