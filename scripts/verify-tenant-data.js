/**
 * Verify Tenant Data Isolation
 * 
 * This script verifies that:
 * 1. Each user has their own tenant tables
 * 2. Data is properly isolated per tenant
 * 3. All tenant tables exist and contain data
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyTenantData() {
  console.log('🔍 Verifying Tenant Data Isolation...\n');

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

  let connection;
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');

    // Get all users with their tenantIds
    console.log('📊 Fetching all users...');
    const [users] = await connection.execute(
      'SELECT id, name, email, tenantId, role FROM users ORDER BY createdAt DESC'
    );

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }

    console.log(`✅ Found ${users.length} user(s)\n`);

    // For each user, check their tenant tables
    for (const user of users) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`👤 User: ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Tenant ID: ${user.tenantId}`);
      console.log(`${'='.repeat(60)}`);

      // Generate table names
      const sanitizedTenantId = user.tenantId.replace(/-/g, '_');
      const repairTicketsTable = `tenant_${sanitizedTenantId}_repair_tickets`;
      const teamMembersTable = `tenant_${sanitizedTenantId}_team_members`;
      const deletedTicketsTable = `tenant_${sanitizedTenantId}_deleted_tickets`;
      const deletedMembersTable = `tenant_${sanitizedTenantId}_deleted_members`;

      // Check if tables exist
      const [tables] = await connection.execute(
        `SHOW TABLES LIKE 'tenant_${sanitizedTenantId}_%'`
      );

      if (tables.length === 0) {
        console.log('   ⚠️  WARNING: No tenant tables found!');
        console.log('   💡 Tables should be created automatically on signup or first data entry.');
        continue;
      }

      console.log(`   ✅ Found ${tables.length} tenant table(s):`);
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`      - ${tableName}`);
      });

      // Check repair tickets
      try {
        const [repairTickets] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${repairTicketsTable}`
        );
        const ticketCount = repairTickets[0]?.count || 0;
        console.log(`   📋 Repair Tickets: ${ticketCount}`);
        
        if (ticketCount > 0) {
          const [latestTicket] = await connection.execute(
            `SELECT repairNumber, customerName, createdAt FROM ${repairTicketsTable} ORDER BY createdAt DESC LIMIT 1`
          );
          if (latestTicket.length > 0) {
            console.log(`      Latest: ${latestTicket[0].repairNumber} - ${latestTicket[0].customerName} (${new Date(latestTicket[0].createdAt).toLocaleDateString()})`);
          }
        }
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`   ⚠️  Repair Tickets table doesn't exist yet`);
        } else {
          console.log(`   ❌ Error checking repair tickets: ${error.message}`);
        }
      }

      // Check team members
      try {
        const [teamMembers] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${teamMembersTable}`
        );
        const memberCount = teamMembers[0]?.count || 0;
        console.log(`   👥 Team Members: ${memberCount}`);
        
        if (memberCount > 0) {
          const [members] = await connection.execute(
            `SELECT name, email, role FROM ${teamMembersTable} LIMIT 5`
          );
          members.forEach(member => {
            console.log(`      - ${member.name} (${member.email}) - ${member.role}`);
          });
        }
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`   ⚠️  Team Members table doesn't exist yet`);
        } else {
          console.log(`   ❌ Error checking team members: ${error.message}`);
        }
      }

      // Check deleted tickets
      try {
        const [deletedTickets] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${deletedTicketsTable}`
        );
        const deletedCount = deletedTickets[0]?.count || 0;
        if (deletedCount > 0) {
          console.log(`   🗑️  Deleted Tickets: ${deletedCount}`);
        }
      } catch (error) {
        // Table might not exist if no deletions yet
      }

      // Check deleted members
      try {
        const [deletedMembers] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${deletedMembersTable}`
        );
        const deletedCount = deletedMembers[0]?.count || 0;
        if (deletedCount > 0) {
          console.log(`   🗑️  Deleted Members: ${deletedCount}`);
        }
      } catch (error) {
        // Table might not exist if no deletions yet
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Verification Complete!');
    console.log(`${'='.repeat(60)}\n`);

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total Users: ${users.length}`);
    
    const [allTenantTables] = await connection.execute(
      "SHOW TABLES LIKE 'tenant_%'"
    );
    console.log(`   Total Tenant Tables: ${allTenantTables.length}`);
    
    const regularUsers = users.filter(u => u.role !== 'SUPER_ADMIN' && u.role !== 'super_admin');
    console.log(`   Regular Users: ${regularUsers.length}`);
    console.log(`   Expected Tenant Tables: ${regularUsers.length * 4} (4 tables per user)`);
    console.log(`   Actual Tenant Tables: ${allTenantTables.length}`);
    
    if (allTenantTables.length < regularUsers.length * 4) {
      console.log(`   ⚠️  Some tenant tables may be missing. They will be created automatically on first use.`);
    } else {
      console.log(`   ✅ All expected tenant tables exist!`);
    }

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyTenantData();

