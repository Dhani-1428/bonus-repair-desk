/**
 * Check Database Data
 * This script connects to the database and shows all data
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkDatabaseData() {
  console.log('🔍 Checking Database Data...\n');

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

  console.log('📋 Connection Config:');
  console.log('   Host:', config.host);
  console.log('   Port:', config.port);
  console.log('   User:', config.user);
  console.log('   Database:', config.database);
  console.log('   SSL:', config.ssl ? 'Enabled' : 'Disabled');
  console.log('');

  try {
    console.log('🔌 Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Check current database
    const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
    console.log('📂 Current Database:', dbResult[0].current_db);
    console.log('');

    // Show all tables
    console.log('📊 Tables in database:');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(tables);
    console.log('');

    // Check users table
    console.log('👥 Users Table:');
    const [users] = await connection.execute('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
    if (users.length === 0) {
      console.log('   ❌ No users found!');
    } else {
      console.log(`   ✅ Found ${users.length} user(s):`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    }
    console.log('');

    // Check subscriptions table
    console.log('💳 Subscriptions Table:');
    const [subscriptions] = await connection.execute('SELECT id, userId, plan, status, startDate, endDate FROM subscriptions ORDER BY createdAt DESC LIMIT 10');
    if (subscriptions.length === 0) {
      console.log('   ❌ No subscriptions found!');
    } else {
      console.log(`   ✅ Found ${subscriptions.length} subscription(s)`);
    }
    console.log('');

    // Check payment_requests table
    console.log('💰 Payment Requests Table:');
    const [payments] = await connection.execute('SELECT id, userId, plan, status, price FROM payment_requests ORDER BY createdAt DESC LIMIT 10');
    if (payments.length === 0) {
      console.log('   ❌ No payment requests found!');
    } else {
      console.log(`   ✅ Found ${payments.length} payment request(s)`);
    }
    console.log('');

    // Check testimonials table
    console.log('💬 Testimonials Table:');
    try {
      const [testimonials] = await connection.execute('SELECT id, name, username, status FROM testimonials ORDER BY createdAt DESC LIMIT 10');
      if (testimonials.length === 0) {
        console.log('   ❌ No testimonials found!');
      } else {
        console.log(`   ✅ Found ${testimonials.length} testimonial(s)`);
      }
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('   ⚠️  Testimonials table does not exist yet');
      } else {
        throw error;
      }
    }
    console.log('');

    // Check login_history table
    console.log('🔐 Login History Table:');
    const [loginHistory] = await connection.execute('SELECT id, userId, timestamp FROM login_history ORDER BY timestamp DESC LIMIT 10');
    if (loginHistory.length === 0) {
      console.log('   ❌ No login history found!');
    } else {
      console.log(`   ✅ Found ${loginHistory.length} login record(s)`);
    }
    console.log('');

    // Try to create super admin if it doesn't exist
    const [superAdminCheck] = await connection.execute(
      "SELECT * FROM users WHERE email = 'superadmin@admin.com'"
    );

    if (superAdminCheck.length === 0) {
      console.log('⚠️  Super admin not found. Creating...');
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
      console.log('   Email: superadmin@admin.com');
      console.log('   Password: superadmin123');
    } else {
      console.log('✅ Super admin exists:');
      console.log('   Email: superadmin@admin.com');
      console.log('   Password: superadmin123');
    }

    await connection.end();
    console.log('\n🎉 Database check complete!');

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

checkDatabaseData();

