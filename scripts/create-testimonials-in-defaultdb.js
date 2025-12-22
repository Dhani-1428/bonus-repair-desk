/**
 * Create Testimonials Table in defaultdb
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestimonialsTable() {
  console.log('🔧 Creating Testimonials Table...\n');

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
    console.log('🔌 Connecting to database:', config.database);
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Create testimonials table
    await connection.execute(`
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

    console.log('✅ Testimonials table created successfully!');

    // Verify table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'testimonials'");
    if (tables.length > 0) {
      console.log('✅ Table verified in database');
    }

    await connection.end();
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

createTestimonialsTable();

