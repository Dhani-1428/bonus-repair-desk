/**
 * Verify data in admin_panel_db
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyAdminPanelDb() {
  console.log('🔍 Verifying data in admin_panel_db...\n');

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'admin_panel_db',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 10000,
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log(`✅ Connected to admin_panel_db\n`);

    // Check users
    const [users] = await connection.execute('SELECT id, name, email, role FROM users ORDER BY createdAt DESC');
    console.log(`👥 Users: ${users.length}`);
    users.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // Check subscriptions
    const [subs] = await connection.execute('SELECT COUNT(*) as count FROM subscriptions');
    console.log(`💳 Subscriptions: ${subs[0].count}`);

    // Check payment requests
    const [payments] = await connection.execute('SELECT COUNT(*) as count FROM payment_requests');
    console.log(`💰 Payment Requests: ${payments[0].count}`);

    // Check login history
    const [logins] = await connection.execute('SELECT COUNT(*) as count FROM login_history');
    console.log(`🔐 Login Records: ${logins[0].count}`);

    // Check testimonials
    const [tests] = await connection.execute('SELECT COUNT(*) as count FROM testimonials');
    console.log(`💬 Testimonials: ${tests[0].count}`);

    // Check subscription history
    const [subHist] = await connection.execute('SELECT COUNT(*) as count FROM subscription_history');
    console.log(`📜 Subscription History: ${subHist[0].count}`);

    // Check tenant tables
    const [tenantTables] = await connection.execute("SHOW TABLES LIKE 'tenant_%'");
    console.log(`🏢 Tenant Tables: ${tenantTables.length}`);

    await connection.end();
    console.log('\n✅ Verification complete!');
    console.log('\n📝 IMPORTANT: Update your .env file:');
    console.log('   Change: DB_NAME=defaultdb');
    console.log('   To:     DB_NAME=admin_panel_db');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

verifyAdminPanelDb();

