const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kmmedia',
});

async function testPaymentDashboard() {
  console.log('🔍 Testing payment dashboard data...');
  
  try {
    const client = await pool.connect();
    
    // Test user ID 5 (from the payment test)
    const userId = 5;
    
    console.log(`\n📊 Testing dashboard data for user ID: ${userId}`);
    
    // Test student dashboard data
    console.log('\n🎓 STUDENT DASHBOARD DATA:');
    
    // Get user's registrations with course details
    const registrationsQuery = `
      SELECT r.*, c.name as "courseName", c.description as "courseDescription", 
             c.duration, c.price, c."maxStudents"
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC
    `;

    const registrationsResult = await client.query(registrationsQuery, [userId]);
    const registrations = registrationsResult.rows;
    
    console.log(`📋 Registrations found: ${registrations.length}`);
    registrations.forEach((reg, index) => {
      console.log(`${index + 1}. Course: ${reg.courseName}, Status: ${reg.status}, Created: ${reg.createdAt}`);
    });

    // Get recent payments
    const paymentsQuery = `
      SELECT p.*, c.name as "courseName"
      FROM payments p
      JOIN courses c ON p."courseId" = c.id
      WHERE p."userId" = $1
      ORDER BY p."createdAt" DESC
      LIMIT 5
    `;

    const paymentsResult = await client.query(paymentsQuery, [userId]);
    const payments = paymentsResult.rows;
    
    console.log(`💰 Payments found: ${payments.length}`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Course: ${payment.courseName}, Status: ${payment.status}, Amount: ${payment.amount}, Reference: ${payment.reference}`);
    });

    // Calculate total spent (student dashboard logic)
    const totalSpent = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    console.log(`💵 Total spent (successful payments): ${totalSpent.toFixed(2)}`);

    // Test admin dashboard data
    console.log('\n👨‍💼 ADMIN DASHBOARD DATA:');
    
    // Get all payments for admin
    const allPaymentsQuery = `
      SELECT p.*, 
             u.firstName, u.lastName, u.email,
             c.name as "courseName", c.description as "courseDescription"
      FROM payments p
      JOIN users u ON p."userId" = u.id
      JOIN courses c ON p."courseId" = c.id
      ORDER BY p."createdAt" DESC
    `;

    const allPaymentsResult = await client.query(allPaymentsQuery);
    const allPayments = allPaymentsResult.rows;
    
    console.log(`💰 Total payments in system: ${allPayments.length}`);
    
    // Get payment statistics (admin dashboard logic)
    const totalPaymentsResult = await client.query(
      "SELECT COUNT(*) as count FROM payments"
    );
    const totalPayments = parseInt(totalPaymentsResult.rows[0].count);

    const successfulPaymentsResult = await client.query(
      "SELECT COUNT(*) as count FROM payments WHERE status = 'success'"
    );
    const successfulPayments = parseInt(successfulPaymentsResult.rows[0].count);

    const failedPaymentsResult = await client.query(
      "SELECT COUNT(*) as count FROM payments WHERE status = 'failed'"
    );
    const failedPayments = parseInt(failedPaymentsResult.rows[0].count);

    const pendingPaymentsResult = await client.query(
      "SELECT COUNT(*) as count FROM payments WHERE status = 'pending'"
    );
    const pendingPayments = parseInt(pendingPaymentsResult.rows[0].count);

    // Get total revenue (sum of successful payments)
    const revenueResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM payments 
      WHERE status = 'success'
    `);
    const totalRevenue = parseFloat(revenueResult.rows[0].total || "0");

    // Get monthly revenue
    const monthlyRevenueResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM payments 
      WHERE status = 'success' 
      AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    const monthlyRevenue = parseFloat(monthlyRevenueResult.rows[0].total || "0");

    console.log(`📊 Payment Statistics:`);
    console.log(`- Total Payments: ${totalPayments}`);
    console.log(`- Successful Payments: ${successfulPayments}`);
    console.log(`- Failed Payments: ${failedPayments}`);
    console.log(`- Pending Payments: ${pendingPayments}`);
    console.log(`- Total Revenue: ${totalRevenue.toFixed(2)}`);
    console.log(`- Monthly Revenue: ${monthlyRevenue.toFixed(2)}`);

    // Show recent payments
    console.log(`\n📋 Recent Payments:`);
    allPayments.slice(0, 5).forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.firstName} ${payment.lastName} - ${payment.courseName} - ${payment.status} - ${payment.amount}`);
    });

    client.release();
    
  } catch (error) {
    console.error('❌ Error testing payment dashboard:', error);
  } finally {
    await pool.end();
  }
}

testPaymentDashboard();


