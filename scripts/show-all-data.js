/**
 * Show All Database Data in Detail
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function showAllData() {
  console.log('📊 SHOWING ALL DATABASE DATA\n');
  console.log('='.repeat(60));

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
    const connection = await mysql.createConnection(config);
    console.log(`✅ Connected to database: ${config.database}\n`);

    // USERS
    console.log('👥 USERS TABLE:');
    console.log('-'.repeat(60));
    const [users] = await connection.execute('SELECT * FROM users ORDER BY createdAt DESC');
    if (users.length === 0) {
      console.log('   ❌ No users found\n');
    } else {
      console.log(`   ✅ Total: ${users.length} user(s)\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name}`);
        console.log(`      ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Shop: ${user.shopName || 'N/A'}`);
        console.log(`      Tenant ID: ${user.tenantId}`);
        console.log(`      Created: ${user.createdAt}`);
        console.log('');
      });
    }

    // SUBSCRIPTIONS
    console.log('💳 SUBSCRIPTIONS TABLE:');
    console.log('-'.repeat(60));
    const [subscriptions] = await connection.execute('SELECT * FROM subscriptions ORDER BY createdAt DESC');
    if (subscriptions.length === 0) {
      console.log('   ❌ No subscriptions found\n');
    } else {
      console.log(`   ✅ Total: ${subscriptions.length} subscription(s)\n`);
      subscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Subscription ID: ${sub.id}`);
        console.log(`      User ID: ${sub.userId}`);
        console.log(`      Plan: ${sub.plan}`);
        console.log(`      Status: ${sub.status}`);
        console.log(`      Start Date: ${sub.startDate}`);
        console.log(`      End Date: ${sub.endDate}`);
        console.log(`      Price: ${sub.price || 'N/A'}`);
        console.log(`      Payment Status: ${sub.paymentStatus || 'N/A'}`);
        console.log(`      Is Free Trial: ${sub.isFreeTrial ? 'Yes' : 'No'}`);
        console.log(`      Created: ${sub.createdAt}`);
        console.log('');
      });
    }

    // PAYMENT REQUESTS
    console.log('💰 PAYMENT REQUESTS TABLE:');
    console.log('-'.repeat(60));
    const [payments] = await connection.execute('SELECT * FROM payment_requests ORDER BY createdAt DESC');
    if (payments.length === 0) {
      console.log('   ❌ No payment requests found\n');
    } else {
      console.log(`   ✅ Total: ${payments.length} payment request(s)\n`);
      payments.forEach((payment, index) => {
        console.log(`   ${index + 1}. Payment ID: ${payment.id}`);
        console.log(`      User ID: ${payment.userId}`);
        console.log(`      Plan: ${payment.planName} (${payment.plan})`);
        console.log(`      Price: ${payment.price}`);
        console.log(`      Months: ${payment.months}`);
        console.log(`      Status: ${payment.status}`);
        console.log(`      Start Date: ${payment.startDate}`);
        console.log(`      End Date: ${payment.endDate}`);
        console.log(`      Created: ${payment.createdAt}`);
        console.log('');
      });
    }

    // LOGIN HISTORY
    console.log('🔐 LOGIN HISTORY TABLE:');
    console.log('-'.repeat(60));
    const [loginHistory] = await connection.execute('SELECT * FROM login_history ORDER BY timestamp DESC LIMIT 20');
    if (loginHistory.length === 0) {
      console.log('   ❌ No login history found\n');
    } else {
      console.log(`   ✅ Total: ${loginHistory.length} login record(s) (showing last 20)\n`);
      loginHistory.forEach((login, index) => {
        console.log(`   ${index + 1}. User ID: ${login.userId}`);
        console.log(`      Timestamp: ${login.timestamp}`);
        console.log(`      IP: ${login.ip || 'N/A'}`);
        console.log('');
      });
    }

    // TESTIMONIALS
    console.log('💬 TESTIMONIALS TABLE:');
    console.log('-'.repeat(60));
    try {
      const [testimonials] = await connection.execute('SELECT * FROM testimonials ORDER BY createdAt DESC');
      if (testimonials.length === 0) {
        console.log('   ❌ No testimonials found\n');
      } else {
        console.log(`   ✅ Total: ${testimonials.length} testimonial(s)\n`);
        testimonials.forEach((test, index) => {
          console.log(`   ${index + 1}. ${test.name} (@${test.username})`);
          console.log(`      Status: ${test.status}`);
          console.log(`      Comment: ${test.body.substring(0, 100)}...`);
          console.log(`      Created: ${test.createdAt}`);
          console.log('');
        });
      }
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('   ⚠️  Testimonials table does not exist\n');
      } else {
        throw error;
      }
    }

    // SUMMARY
    console.log('📈 SUMMARY:');
    console.log('-'.repeat(60));
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [subCount] = await connection.execute('SELECT COUNT(*) as count FROM subscriptions');
    const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payment_requests');
    const [loginCount] = await connection.execute('SELECT COUNT(*) as count FROM login_history');
    
    let testimonialCount = 0;
    try {
      const [testCount] = await connection.execute('SELECT COUNT(*) as count FROM testimonials');
      testimonialCount = testCount[0].count;
    } catch (e) {
      testimonialCount = 0;
    }

    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Subscriptions: ${subCount[0].count}`);
    console.log(`   Payment Requests: ${paymentCount[0].count}`);
    console.log(`   Login Records: ${loginCount[0].count}`);
    console.log(`   Testimonials: ${testimonialCount}`);
    console.log('');

    await connection.end();
    console.log('='.repeat(60));
    console.log('✅ All data displayed!');
    console.log(`\n💡 Note: Your application is connected to database: ${config.database}`);
    console.log('   If you created tables in a different database, switch to this one in MySQL.');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

showAllData();

