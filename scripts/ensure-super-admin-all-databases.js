/**
 * Ensure Super Admin exists in both databases
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function ensureSuperAdmin() {
  console.log('🔧 Ensuring Super Admin in all databases...\n');

  const baseConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 10000,
  };

  const databases = ['defaultdb', 'admin_panel_db'];

  for (const dbName of databases) {
    console.log(`\n📂 Checking database: ${dbName}`);
    console.log('-'.repeat(60));

    try {
      const connection = await mysql.createConnection({
        ...baseConfig,
        database: dbName,
      });

      // Check if super admin exists
      const [users] = await connection.execute(
        `SELECT id, name, email, role FROM users WHERE email = 'superadmin@admin.com'`
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
        console.log('✅ Super admin found');
        const user = users[0];
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        // Verify password
        const [pwdCheck] = await connection.execute(
          `SELECT password FROM users WHERE email = 'superadmin@admin.com'`
        );
        const isValid = await bcrypt.compare('superadmin123', pwdCheck[0].password);

        if (!isValid) {
          console.log('⚠️  Password incorrect. Updating...');
          const hashedPassword = await bcrypt.hash('superadmin123', 10);
          await connection.execute(
            `UPDATE users SET password = ? WHERE email = 'superadmin@admin.com'`,
            [hashedPassword]
          );
          console.log('✅ Password updated!');
        } else {
          console.log('✅ Password is correct');
        }

        // Ensure role is correct
        if (user.role !== 'SUPER_ADMIN' && user.role !== 'super_admin') {
          console.log('⚠️  Role incorrect. Updating...');
          await connection.execute(
            `UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'superadmin@admin.com'`
          );
          console.log('✅ Role updated!');
        }
      }

      await connection.end();
    } catch (error) {
      if (error.code === 'ER_BAD_DB_ERROR') {
        console.log(`⚠️  Database '${dbName}' does not exist (skipping)`);
      } else {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Super admin check complete!');
  console.log('');
  console.log('🔑 Login Credentials:');
  console.log('   Email: superadmin@admin.com');
  console.log('   Password: superadmin123');
  console.log('');
  console.log('💡 Make sure your .env file has the correct DB_NAME');
  console.log('   Current DB_NAME in .env:', process.env.DB_NAME);
}

ensureSuperAdmin();

