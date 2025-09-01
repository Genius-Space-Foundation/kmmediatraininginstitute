const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/kmmedia',
});

async function testStudentDashboard() {
  console.log('🔍 Testing student dashboard data...');
  
  try {
    const client = await pool.connect();
    
    // Test user ID 5 (from the payment test)
    const userId = 5;
    
    console.log(`\n📊 Testing dashboard data for user ID: ${userId}`);
    
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
    
    console.log(`\n📋 Registrations found: ${registrations.length}`);
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
    
    console.log(`\n💰 Payments found: ${payments.length}`);
    payments.forEach((payment, index) => {
      console.log(`${index + 1}. Course: ${payment.courseName}, Status: ${payment.status}, Amount: ${payment.amount}, Reference: ${payment.reference}`);
    });

    // Calculate total spent
    const totalSpent = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    console.log(`\n💵 Total spent (successful payments): ${totalSpent.toFixed(2)}`);

    // Check if there's a mismatch in payment status
    console.log(`\n🔍 Payment status analysis:`);
    payments.forEach((payment) => {
      console.log(`- Reference: ${payment.reference}, Status: ${payment.status}, Expected: success`);
    });

    client.release();
    
  } catch (error) {
    console.error('❌ Error testing student dashboard:', error);
  } finally {
    await pool.end();
  }
}

testStudentDashboard();


