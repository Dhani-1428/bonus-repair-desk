/**
 * View Data for a Specific User
 * 
 * Usage: node scripts/view-specific-user-data.js <user-email>
 * Example: node scripts/view-specific-user-data.js sam@samphone.com
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function viewSpecificUserData(userEmail) {
  if (!userEmail) {
    console.log('❌ Please provide a user email!');
    console.log('Usage: node scripts/view-specific-user-data.js <user-email>');
    console.log('Example: node scripts/view-specific-user-data.js sam@samphone.com');
    process.exit(1);
  }

  console.log(`📊 Viewing Data for User: ${userEmail}\n`);

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

    // Get user information
    const [users] = await connection.execute(
      `SELECT id, name, email, tenantId, shopName, contactNumber, role, createdAt 
       FROM users 
       WHERE email = ?`,
      [userEmail]
    );

    if (users.length === 0) {
      console.log(`❌ User with email "${userEmail}" not found!`);
      return;
    }

    const user = users[0];
    const sanitizedTenantId = user.tenantId.replace(/-/g, '_');
    const repairTicketsTable = `tenant_${sanitizedTenantId}_repair_tickets`;
    const teamMembersTable = `tenant_${sanitizedTenantId}_team_members`;
    const deletedTicketsTable = `tenant_${sanitizedTenantId}_deleted_tickets`;
    const deletedMembersTable = `tenant_${sanitizedTenantId}_deleted_members`;

    console.log('='.repeat(80));
    console.log(`👤 USER: ${user.name} (${user.email})`);
    console.log('='.repeat(80));
    console.log(`   User ID: ${user.id}`);
    console.log(`   Tenant ID: ${user.tenantId}`);
    console.log(`   Shop Name: ${user.shopName || 'N/A'}`);
    console.log(`   Contact: ${user.contactNumber || 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}\n`);

    // Get repair tickets
    try {
      const [tickets] = await connection.execute(
        `SELECT 
          id, repairNumber, spu, clientId, customerName, contact, 
          imeiNo, brand, model, serialNo, warranty, 
          simCard, memoryCard, charger, battery, waterDamaged, loanEquipment,
          equipmentObs, repairObs, selectedServices, condition, problem, price, status, createdAt
         FROM ${repairTicketsTable}
         ORDER BY createdAt DESC`
      );

      console.log(`📋 REPAIR TICKETS: ${tickets.length}`);
      if (tickets.length > 0) {
        console.log(`   Showing all ${tickets.length} repair ticket(s):\n`);
        tickets.forEach((ticket, index) => {
          const services = typeof ticket.selectedServices === 'string' 
            ? JSON.parse(ticket.selectedServices || '[]').join(', ') 
            : (Array.isArray(ticket.selectedServices) ? ticket.selectedServices.join(', ') : 'N/A');
          
          console.log(`   ${index + 1}. Repair #${ticket.repairNumber || 'N/A'} | ${ticket.customerName || 'N/A'} | ${ticket.brand || 'N/A'} ${ticket.model || 'N/A'}`);
          console.log(`      Client NIF: ${ticket.clientId || 'N/A'} | Status: ${ticket.status || 'N/A'} | Price: $${parseFloat(ticket.price || 0).toFixed(2)}`);
          console.log(`      IMEI: ${ticket.imeiNo || 'N/A'} | Serial: ${ticket.serialNo || 'N/A'}`);
          console.log(`      Services: ${services}`);
          console.log(`      Problem: ${ticket.problem || 'N/A'}`);
          console.log(`      Equipment: SIM: ${ticket.simCard ? 'Yes' : 'No'}, Memory: ${ticket.memoryCard ? 'Yes' : 'No'}, Charger: ${ticket.charger ? 'Yes' : 'No'}, Battery: ${ticket.battery ? 'Yes' : 'No'}, Water: ${ticket.waterDamaged ? 'Yes' : 'No'}`);
          console.log(`      Created: ${new Date(ticket.createdAt).toLocaleString()}\n`);
        });
      } else {
        console.log('   ⚠️  No repair tickets found\n');
      }
    } catch (error) {
      console.log('   ⚠️  Could not fetch repair tickets (table may not exist)\n');
    }

    // Get team members
    try {
      const [members] = await connection.execute(
        `SELECT id, name, email, role, username, createdAt 
         FROM ${teamMembersTable}
         ORDER BY createdAt DESC`
      );

      console.log(`👥 TEAM MEMBERS: ${members.length}`);
      if (members.length > 0) {
        members.forEach((member, index) => {
          console.log(`   ${index + 1}. ${member.name} (${member.email})`);
          console.log(`      Role: ${member.role} | Username: ${member.username || 'N/A'}`);
          console.log(`      Created: ${new Date(member.createdAt).toLocaleString()}\n`);
        });
      } else {
        console.log('   ⚠️  No team members found\n');
      }
    } catch (error) {
      console.log('   ⚠️  Could not fetch team members (table may not exist)\n');
    }

    // Get subscription
    try {
      const [subscriptions] = await connection.execute(
        `SELECT plan, status, startDate, endDate, isFreeTrial, createdAt 
         FROM subscriptions 
         WHERE userId = ? 
         ORDER BY createdAt DESC 
         LIMIT 1`,
        [user.id]
      );

      if (subscriptions.length > 0) {
        const sub = subscriptions[0];
        console.log(`💳 SUBSCRIPTION:`);
        console.log(`   Plan: ${sub.plan || 'N/A'} | Status: ${sub.status || 'N/A'}`);
        console.log(`   Start: ${new Date(sub.startDate).toLocaleDateString()}`);
        console.log(`   End: ${new Date(sub.endDate).toLocaleDateString()}`);
        console.log(`   Free Trial: ${sub.isFreeTrial ? 'Yes' : 'No'}\n`);
      } else {
        console.log(`💳 SUBSCRIPTION: No subscription found\n`);
      }
    } catch (error) {
      console.log(`💳 SUBSCRIPTION: Could not fetch subscription data\n`);
    }

    // Get payment requests
    try {
      const [payments] = await connection.execute(
        `SELECT plan, amount, status, createdAt 
         FROM payment_requests 
         WHERE userId = ? 
         ORDER BY createdAt DESC`,
        [user.id]
      );

      if (payments.length > 0) {
        console.log(`💰 PAYMENT REQUESTS: ${payments.length}`);
        payments.forEach((payment, index) => {
          console.log(`   ${index + 1}. ${payment.plan} - $${parseFloat(payment.amount || 0).toFixed(2)} (${payment.status})`);
          console.log(`      Created: ${new Date(payment.createdAt).toLocaleString()}\n`);
        });
      }
    } catch (error) {
      // Payment requests table might not exist, ignore
    }

    // Show table names
    console.log(`📂 Table Names:`);
    console.log(`   Repair Tickets: ${repairTicketsTable}`);
    console.log(`   Team Members: ${teamMembersTable}`);
    console.log(`   Deleted Tickets: ${deletedTicketsTable}`);
    console.log(`   Deleted Members: ${deletedMembersTable}\n`);

    console.log('='.repeat(80));
    console.log('✅ Data View Complete!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('   Table does not exist. Make sure the user has data.');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Get email from command line arguments
const userEmail = process.argv[2];
viewSpecificUserData(userEmail).catch(console.error);

