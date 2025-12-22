/**
 * MySQL Setup Script
 * This script will help verify and set up the database connection
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Load .env file manually if dotenv not available
try {
  require('dotenv').config();
} catch (e) {
  // If dotenv not installed, load .env manually
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

async function setupDatabase() {
  console.log('🔧 Starting MySQL Setup...\n');

  // Check environment variables
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'admin_panel_db',
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 10000,
  };

  console.log('📋 Database Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Password: ${config.password ? '***' : 'NOT SET'}\n`);

  if (!config.password) {
    console.error('❌ ERROR: DB_PASSWORD not set in .env file!');
    console.log('   Please add: DB_PASSWORD=your_mysql_password');
    process.exit(1);
  }

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection successful!\n');

    // Check if tables exist
    console.log('📊 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);

    console.log(`   Found ${tableNames.length} tables:`, tableNames.join(', ') || 'None');

    if (tableNames.length === 0) {
      console.log('\n⚠️  No tables found. Please run the SQL script:');
      console.log('   1. Open MySQL: mysql -u root -p');
      console.log('   2. Run: USE admin_panel_db;');
      console.log('   3. Run: SOURCE scripts/init-database.sql;');
    } else if (tableNames.length < 5) {
      console.log('\n⚠️  Some tables are missing. Expected 5 tables.');
      console.log('   Please run: scripts/init-database.sql');
    } else {
      console.log('✅ All required tables exist!\n');
    }

    // Check for super admin
    console.log('👤 Checking for super admin...');
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = 'superadmin@admin.com'"
    );

    if (users.length === 0) {
      console.log('   Super admin not found. Creating...');
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
      console.log('   Password: superadmin123\n');
    } else {
      console.log('✅ Super admin already exists!\n');
    }

    await connection.end();
    console.log('🎉 Setup complete! You can now start the application with: npm run dev');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Fix: Check your DB_PASSWORD in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Fix: Database does not exist. Create it first:');
      console.log('   CREATE DATABASE admin_panel_db;');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Fix: MySQL server is not running or wrong host/port');
    }
    
    process.exit(1);
  }
}

setupDatabase();

