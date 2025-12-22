/**
 * Migrate all data from defaultdb to admin_panel_db
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function migrateDatabase() {
  console.log('🔄 Migrating data from defaultdb to admin_panel_db...\n');

  const sourceConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'defaultdb',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 10000,
  };

  const targetConfig = {
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
    console.log('🔌 Connecting to source database (defaultdb)...');
    const sourceConn = await mysql.createConnection(sourceConfig);
    console.log('✅ Connected to defaultdb\n');

    console.log('🔌 Connecting to target database (admin_panel_db)...');
    const targetConn = await mysql.createConnection(targetConfig);
    console.log('✅ Connected to admin_panel_db\n');

    // Create testimonials table if it doesn't exist
    console.log('📋 Creating testimonials table...');
    await targetConn.execute(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        img VARCHAR(500),
        status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_createdAt (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Testimonials table created\n');

    // Migrate USERS
    console.log('👥 Migrating users...');
    const [users] = await sourceConn.execute('SELECT * FROM users');
    if (users.length > 0) {
      // Clear existing users first
      await targetConn.execute('DELETE FROM users');
      
      for (const user of users) {
        await targetConn.execute(
          `INSERT INTO users (id, name, email, password, role, shopName, contactNumber, tenantId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.id, user.name, user.email, user.password, user.role, user.shopName, user.contactNumber, user.tenantId, user.createdAt, user.updatedAt]
        );
      }
      console.log(`✅ Migrated ${users.length} user(s)\n`);
    } else {
      console.log('⚠️  No users to migrate\n');
    }

    // Migrate SUBSCRIPTIONS
    console.log('💳 Migrating subscriptions...');
    const [subscriptions] = await sourceConn.execute('SELECT * FROM subscriptions');
    if (subscriptions.length > 0) {
      // Clear existing subscriptions first
      await targetConn.execute('DELETE FROM subscriptions');
      
      for (const sub of subscriptions) {
        await targetConn.execute(
          `INSERT INTO subscriptions (id, userId, tenantId, plan, status, startDate, endDate, price, paymentStatus, paymentId, isFreeTrial, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [sub.id, sub.userId, sub.tenantId, sub.plan, sub.status, sub.startDate, sub.endDate, sub.price, sub.paymentStatus, sub.paymentId, sub.isFreeTrial, sub.createdAt, sub.updatedAt]
        );
      }
      console.log(`✅ Migrated ${subscriptions.length} subscription(s)\n`);
    } else {
      console.log('⚠️  No subscriptions to migrate\n');
    }

    // Migrate SUBSCRIPTION_HISTORY
    console.log('📜 Migrating subscription history...');
    try {
      const [subHistory] = await sourceConn.execute('SELECT * FROM subscription_history');
      if (subHistory.length > 0) {
        await targetConn.execute('DELETE FROM subscription_history');
        
        for (const hist of subHistory) {
          await targetConn.execute(
            `INSERT INTO subscription_history (id, userId, tenantId, plan, status, startDate, endDate, price, paymentStatus, paymentId, isFreeTrial, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [hist.id, hist.userId, hist.tenantId, hist.plan, hist.status, hist.startDate, hist.endDate, hist.price, hist.paymentStatus, hist.paymentId, hist.isFreeTrial, hist.createdAt]
          );
        }
        console.log(`✅ Migrated ${subHistory.length} subscription history record(s)\n`);
      } else {
        console.log('⚠️  No subscription history to migrate\n');
      }
    } catch (error) {
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        throw error;
      }
      console.log('⚠️  Subscription history table does not exist in source\n');
    }

    // Migrate PAYMENT_REQUESTS
    console.log('💰 Migrating payment requests...');
    const [payments] = await sourceConn.execute('SELECT * FROM payment_requests');
    if (payments.length > 0) {
      await targetConn.execute('DELETE FROM payment_requests');
      
      for (const payment of payments) {
        await targetConn.execute(
          `INSERT INTO payment_requests (id, userId, tenantId, plan, planName, price, months, startDate, endDate, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [payment.id, payment.userId, payment.tenantId, payment.plan, payment.planName, payment.price, payment.months, payment.startDate, payment.endDate, payment.status, payment.createdAt, payment.updatedAt]
        );
      }
      console.log(`✅ Migrated ${payments.length} payment request(s)\n`);
    } else {
      console.log('⚠️  No payment requests to migrate\n');
    }

    // Migrate LOGIN_HISTORY
    console.log('🔐 Migrating login history...');
    const [loginHistory] = await sourceConn.execute('SELECT * FROM login_history ORDER BY timestamp DESC LIMIT 1000');
    if (loginHistory.length > 0) {
      await targetConn.execute('DELETE FROM login_history');
      
      for (const login of loginHistory) {
        await targetConn.execute(
          `INSERT INTO login_history (id, userId, tenantId, timestamp, ip)
           VALUES (?, ?, ?, ?, ?)`,
          [login.id, login.userId, login.tenantId, login.timestamp, login.ip]
        );
      }
      console.log(`✅ Migrated ${loginHistory.length} login record(s)\n`);
    } else {
      console.log('⚠️  No login history to migrate\n');
    }

    // Migrate TESTIMONIALS
    console.log('💬 Migrating testimonials...');
    try {
      const [testimonials] = await sourceConn.execute('SELECT * FROM testimonials');
      if (testimonials.length > 0) {
        await targetConn.execute('DELETE FROM testimonials');
        
        for (const test of testimonials) {
          await targetConn.execute(
            `INSERT INTO testimonials (id, name, username, body, img, status, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [test.id, test.name, test.username, test.body, test.img, test.status, test.createdAt, test.updatedAt]
          );
        }
        console.log(`✅ Migrated ${testimonials.length} testimonial(s)\n`);
      } else {
        console.log('⚠️  No testimonials to migrate\n');
      }
    } catch (error) {
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        throw error;
      }
      console.log('⚠️  Testimonials table does not exist in source\n');
    }

    // Migrate tenant-specific tables (repair tickets, team members, etc.)
    console.log('🏢 Migrating tenant-specific tables...');
    const [tenantTables] = await sourceConn.execute(
      "SHOW TABLES LIKE 'tenant_%'"
    );
    
    if (tenantTables.length > 0) {
      console.log(`   Found ${tenantTables.length} tenant table(s) to migrate`);
      
      for (const table of tenantTables) {
        const tableName = Object.values(table)[0];
        console.log(`   Migrating ${tableName}...`);
        
        try {
          // Check if table exists in target, create if not
          const [targetTable] = await targetConn.execute(
            `SHOW TABLES LIKE '${tableName}'`
          );
          
          if (targetTable.length === 0) {
            // Get table structure from source
            const [createTable] = await sourceConn.execute(
              `SHOW CREATE TABLE \`${tableName}\``
            );
            const createStatement = createTable[0]['Create Table'];
            
            // Create table in target
            await targetConn.execute(createStatement);
            console.log(`     ✅ Created table ${tableName}`);
          }
          
          // Migrate data
          const [tableData] = await sourceConn.execute(`SELECT * FROM \`${tableName}\``);
          if (tableData.length > 0) {
            await targetConn.execute(`DELETE FROM \`${tableName}\``);
            
            // Get column names
            const [columns] = await sourceConn.execute(`SHOW COLUMNS FROM \`${tableName}\``);
            const columnNames = columns.map(col => col.Field);
            const placeholders = columnNames.map(() => '?').join(', ');
            
            for (const row of tableData) {
              const values = columnNames.map(col => row[col]);
              await targetConn.execute(
                `INSERT INTO \`${tableName}\` (${columnNames.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
                values
              );
            }
            console.log(`     ✅ Migrated ${tableData.length} row(s) from ${tableName}`);
          }
        } catch (error) {
          console.log(`     ⚠️  Error migrating ${tableName}: ${error.message}`);
        }
      }
      console.log('');
    } else {
      console.log('⚠️  No tenant tables to migrate\n');
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const [targetUsers] = await targetConn.execute('SELECT COUNT(*) as count FROM users');
    const [targetSubs] = await targetConn.execute('SELECT COUNT(*) as count FROM subscriptions');
    const [targetPayments] = await targetConn.execute('SELECT COUNT(*) as count FROM payment_requests');
    const [targetLogins] = await targetConn.execute('SELECT COUNT(*) as count FROM login_history');
    
    console.log(`   Users: ${targetUsers[0].count}`);
    console.log(`   Subscriptions: ${targetSubs[0].count}`);
    console.log(`   Payment Requests: ${targetPayments[0].count}`);
    console.log(`   Login Records: ${targetLogins[0].count}`);
    console.log('');

    await sourceConn.end();
    await targetConn.end();
    
    console.log('='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Update your .env file: DB_NAME=admin_panel_db');
    console.log('   2. Restart your application');
    console.log('   3. Verify data in admin_panel_db database');

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.sqlMessage) {
      console.error('   SQL Error:', error.sqlMessage);
    }
    process.exit(1);
  }
}

migrateDatabase();

