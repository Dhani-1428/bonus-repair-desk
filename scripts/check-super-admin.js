/**
 * Check Super Admin User
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkSuperAdmin() {
  console.log('🔍 Checking Super Admin User...\n');

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

    // Check super admin user
    const [users] = await connection.execute(
      `SELECT id, name, email, role, tenantId, createdAt FROM users WHERE email = 'superadmin@admin.com' OR role = 'SUPER_ADMIN'`
    );

    if (users.length === 0) {
      console.log('❌ Super admin user not found!\n');
      console.log('🔧 Creating super admin user...\n');
      
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
      console.log('📋 Login Credentials:');
      console.log('   Email: superadmin@admin.com');
      console.log('   Password: superadmin123\n');
    } else {
      console.log('✅ Super admin user found:\n');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Tenant ID: ${user.tenantId}`);
        console.log(`      Created: ${user.createdAt}`);
        console.log('');
      });

      // Test password
      const [passwordCheck] = await connection.execute(
        `SELECT password FROM users WHERE email = 'superadmin@admin.com'`
      );

      if (passwordCheck.length > 0) {
        const isValid = await bcrypt.compare('superadmin123', passwordCheck[0].password);
        if (isValid) {
          console.log('✅ Password verification: CORRECT');
          console.log('   Email: superadmin@admin.com');
          console.log('   Password: superadmin123\n');
        } else {
          console.log('❌ Password verification: FAILED');
          console.log('🔧 Updating password...\n');
          
          const hashedPassword = await bcrypt.hash('superadmin123', 10);
          await connection.execute(
            `UPDATE users SET password = ? WHERE email = 'superadmin@admin.com'`,
            [hashedPassword]
          );
          
          console.log('✅ Password updated!');
          console.log('   Email: superadmin@admin.com');
          console.log('   Password: superadmin123\n');
        }
      }
    }

    await connection.end();
    console.log('✅ Check complete!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

checkSuperAdmin();

