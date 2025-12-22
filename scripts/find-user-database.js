/**
 * Find which database contains user data
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function findUserDatabase() {
  console.log('🔍 Finding which database contains user data...\n');
  console.log('📋 Connection Info:');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   Database: ${process.env.DB_NAME}\n`);

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.DB_HOST?.includes('aivencloud.com') ? {
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 10000,
  };

  let connection;
  try {
    console.log('🔌 Connecting to MySQL server...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // List all databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📂 Available databases:');
    databases.forEach(db => {
      console.log(`   - ${db.Database}`);
    });
    console.log('');

    // Check each database for users
    const dbNames = databases.map(db => db.Database).filter(db => 
      !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db)
    );

    console.log('🔍 Checking databases for user data...\n');

    for (const dbName of dbNames) {
      try {
        await connection.execute(`USE ${dbName}`);
        const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
        
        if (tables.length > 0) {
          const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
          const [regularUsers] = await connection.execute(
            'SELECT COUNT(*) as count FROM users WHERE role != "SUPER_ADMIN" AND role != "super_admin"'
          );
          
          if (users[0].count > 0) {
            console.log(`✅ ${dbName}:`);
            console.log(`   Total users: ${users[0].count}`);
            console.log(`   Regular users: ${regularUsers[0].count}`);
            
            if (regularUsers[0].count > 0) {
              const [userList] = await connection.execute(
                'SELECT name, email FROM users WHERE role != "SUPER_ADMIN" AND role != "super_admin" LIMIT 5'
              );
              console.log(`   Sample users:`);
              userList.forEach(u => console.log(`      - ${u.name} (${u.email})`));
            }
            console.log('');
          }
        }
      } catch (error) {
        // Skip databases that don't have users table or have access issues
      }
    }

    // Check defaultdb specifically
    console.log('🎯 Checking defaultdb specifically...');
    try {
      await connection.execute('USE defaultdb');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const [regularUsers] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role != "SUPER_ADMIN" AND role != "super_admin"'
      );
      
      console.log(`   ✅ defaultdb exists and has ${users[0].count} total users`);
      console.log(`   ✅ ${regularUsers[0].count} regular users\n`);
      
      if (regularUsers[0].count > 0) {
        const [userList] = await connection.execute(
          'SELECT name, email, tenantId FROM users WHERE role != "SUPER_ADMIN" AND role != "super_admin" LIMIT 10'
        );
        console.log('   Users in defaultdb:');
        userList.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.name} (${u.email})`);
          console.log(`      Tenant ID: ${u.tenantId}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error accessing defaultdb: ${error.message}\n`);
    }

    // Check admin_panel_db
    console.log('🎯 Checking admin_panel_db...');
    try {
      await connection.execute('USE admin_panel_db');
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const [regularUsers] = await connection.execute(
        'SELECT COUNT(*) as count FROM users WHERE role != "SUPER_ADMIN" AND role != "super_admin"'
      );
      
      console.log(`   ✅ admin_panel_db exists and has ${users[0].count} total users`);
      console.log(`   ✅ ${regularUsers[0].count} regular users\n`);
    } catch (error) {
      console.log(`   ❌ Error accessing admin_panel_db: ${error.message}\n`);
    }

    console.log('\n💡 To connect in MySQL command line:');
    console.log(`   mysql -h ${process.env.DB_HOST} -P ${process.env.DB_PORT} -u ${process.env.DB_USER} -p defaultdb`);
    console.log(`   (Enter password when prompted)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

findUserDatabase();

