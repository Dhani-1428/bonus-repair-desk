/**
 * Check Users in defaultdb
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsers() {
  const config = {
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

  let connection;
  try {
    console.log('🔌 Connecting to defaultdb...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    const [users] = await connection.execute(
      'SELECT name, email, tenantId, role FROM users ORDER BY createdAt DESC'
    );

    console.log(`✅ Found ${users.length} user(s) in defaultdb:\n`);
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} (${u.email})`);
      console.log(`   Tenant ID: ${u.tenantId}`);
      console.log(`   Table: tenant_${u.tenantId.replace(/-/g, '_')}_repair_tickets\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkUsers();

