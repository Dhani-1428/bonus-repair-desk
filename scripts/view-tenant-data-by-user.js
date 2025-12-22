/**
 * View Tenant Data by User
 * 
 * This script shows all data for each user's admin panel in a readable format
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function viewTenantDataByUser() {
  console.log('📊 Viewing All Users\' Admin Panel Data...\n');

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

    // Get all regular users (not super admin)
    const [users] = await connection.execute(
      `SELECT id, name, email, tenantId, shopName, contactNumber, role, createdAt 
       FROM users 
       WHERE role != 'SUPER_ADMIN' AND role != 'super_admin' 
       ORDER BY createdAt DESC`
    );

    if (users.length === 0) {
      console.log('❌ No regular users found in database!');
      return;
    }

    console.log(`✅ Found ${users.length} user(s)\n`);
    console.log('='.repeat(80));

    // For each user, show their data
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const sanitizedTenantId = user.tenantId.replace(/-/g, '_');
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`👤 USER ${i + 1}: ${user.name} (${user.email})`);
      console.log(`${'='.repeat(80)}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Tenant ID: ${user.tenantId}`);
      console.log(`   Shop Name: ${user.shopName || 'N/A'}`);
      console.log(`   Contact: ${user.contactNumber || 'N/A'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      
      // Check repair tickets
      const repairTicketsTable = `tenant_${sanitizedTenantId}_repair_tickets`;
      try {
        const [tickets] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${repairTicketsTable}`
        );
        const ticketCount = tickets[0]?.count || 0;
        
        console.log(`\n   📋 REPAIR TICKETS: ${ticketCount}`);
        
        if (ticketCount > 0) {
          const [ticketData] = await connection.execute(
            `SELECT 
              repairNumber,
              spu,
              clientId,
              customerName,
              contact,
              brand,
              model,
              problem,
              price,
              status,
              createdAt
            FROM ${repairTicketsTable}
            ORDER BY createdAt DESC
            LIMIT 10`
          );
          
          if (ticketData.length > 0) {
            console.log(`   Latest ${Math.min(10, ticketData.length)} repair ticket(s):`);
            ticketData.forEach((ticket, idx) => {
              console.log(`   ${idx + 1}. Repair #${ticket.repairNumber} | ${ticket.customerName} | ${ticket.brand} ${ticket.model}`);
              console.log(`      Client NIF: ${ticket.clientId || 'N/A'} | Status: ${ticket.status} | Price: $${ticket.price}`);
              console.log(`      Created: ${new Date(ticket.createdAt).toLocaleString()}`);
            });
            
            if (ticketCount > 10) {
              console.log(`   ... and ${ticketCount - 10} more ticket(s)`);
            }
          }
        } else {
          console.log(`   ⚠️  No repair tickets found`);
        }
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`   ⚠️  Repair tickets table doesn't exist yet`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }

      // Check team members
      const teamMembersTable = `tenant_${sanitizedTenantId}_team_members`;
      try {
        const [members] = await connection.execute(
          `SELECT COUNT(*) as count FROM ${teamMembersTable}`
        );
        const memberCount = members[0]?.count || 0;
        
        console.log(`\n   👥 TEAM MEMBERS: ${memberCount}`);
        
        if (memberCount > 0) {
          const [memberData] = await connection.execute(
            `SELECT id, name, email, role, createdAt
            FROM ${teamMembersTable}
            ORDER BY createdAt DESC`
          );
          
          if (memberData.length > 0) {
            memberData.forEach((member, idx) => {
              console.log(`   ${idx + 1}. ${member.name} (${member.email}) - ${member.role}`);
            });
          }
        } else {
          console.log(`   ⚠️  No team members found`);
        }
      } catch (error) {
        if (error.message.includes("doesn't exist")) {
          console.log(`   ⚠️  Team members table doesn't exist yet`);
        } else {
          console.log(`   ❌ Error: ${error.message}`);
        }
      }

      // Check subscription
      try {
        const [subscriptions] = await connection.execute(
          `SELECT plan, status, startDate, endDate, isFreeTrial
          FROM subscriptions
          WHERE userId = ?
          ORDER BY createdAt DESC
          LIMIT 1`,
          [user.id]
        );
        
        if (subscriptions.length > 0) {
          const sub = subscriptions[0];
          console.log(`\n   💳 SUBSCRIPTION:`);
          console.log(`      Plan: ${sub.plan} | Status: ${sub.status}`);
          console.log(`      Start: ${new Date(sub.startDate).toLocaleDateString()}`);
          console.log(`      End: ${new Date(sub.endDate).toLocaleDateString()}`);
          console.log(`      Free Trial: ${sub.isFreeTrial ? 'Yes' : 'No'}`);
        } else {
          console.log(`\n   💳 SUBSCRIPTION: ⚠️  No subscription found`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking subscription: ${error.message}`);
      }

      // Check payment requests
      try {
        const [payments] = await connection.execute(
          `SELECT COUNT(*) as count FROM payment_requests WHERE userId = ?`,
          [user.id]
        );
        const paymentCount = payments[0]?.count || 0;
        
        if (paymentCount > 0) {
          const [paymentData] = await connection.execute(
            `SELECT planName, price, status, createdAt
            FROM payment_requests
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT 5`,
            [user.id]
          );
          
          console.log(`\n   💰 PAYMENT REQUESTS: ${paymentCount}`);
          paymentData.forEach((payment, idx) => {
            console.log(`   ${idx + 1}. ${payment.planName} - $${payment.price} (${payment.status})`);
          });
        }
      } catch (error) {
        // Ignore if table doesn't exist
      }

      console.log(`\n   📂 Table Names:`);
      console.log(`      Repair Tickets: ${repairTicketsTable}`);
      console.log(`      Team Members: ${teamMembersTable}`);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ Data View Complete!');
    console.log(`${'='.repeat(80)}\n`);

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Total Users: ${users.length}`);
    
    let totalTickets = 0;
    let totalMembers = 0;
    
    for (const user of users) {
      const sanitizedTenantId = user.tenantId.replace(/-/g, '_');
      const repairTicketsTable = `tenant_${sanitizedTenantId}_repair_tickets`;
      const teamMembersTable = `tenant_${sanitizedTenantId}_team_members`;
      
      try {
        const [tickets] = await connection.execute(`SELECT COUNT(*) as count FROM ${repairTicketsTable}`);
        totalTickets += tickets[0]?.count || 0;
      } catch (e) {}
      
      try {
        const [members] = await connection.execute(`SELECT COUNT(*) as count FROM ${teamMembersTable}`);
        totalMembers += members[0]?.count || 0;
      } catch (e) {}
    }
    
    console.log(`   Total Repair Tickets: ${totalTickets}`);
    console.log(`   Total Team Members: ${totalMembers}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
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

viewTenantDataByUser();

