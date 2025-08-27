const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function testPaymentVerification() {
  const client = await pool.connect();

  try {
    console.log("🔍 Testing payment verification and registration creation...");

    // Get the latest payment
    const paymentResult = await client.query(
      'SELECT * FROM payments ORDER BY "createdAt" DESC LIMIT 1'
    );

    if (paymentResult.rows.length === 0) {
      console.log("❌ No payments found in database");
      return;
    }

    const payment = paymentResult.rows[0];
    console.log("🔍 Found payment:", {
      id: payment.id,
      userId: payment.userId,
      courseId: payment.courseId,
      reference: payment.reference,
      status: payment.status,
      amount: payment.amount,
    });

    // Check if registration already exists
    const existingRegistration = await client.query(
      'SELECT * FROM registrations WHERE "userId" = $1 AND "courseId" = $2',
      [payment.userId, payment.courseId]
    );

    console.log(
      "🔍 Existing registration:",
      existingRegistration.rows.length > 0 ? "YES" : "NO"
    );

    if (existingRegistration.rows.length === 0) {
      console.log("🔍 Creating registration...");

      try {
        const registrationResult = await client.query(
          `INSERT INTO registrations (
            "userId", "courseId", status, "registrationDate", notes, "createdAt", "updatedAt"
          ) VALUES (
            $1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          RETURNING *`,
          [
            payment.userId,
            payment.courseId,
            "pending",
            `Test registration created for payment reference: ${payment.reference}`,
          ]
        );

        console.log("✅ Registration created successfully:", {
          registrationId: registrationResult.rows[0].id,
          userId: payment.userId,
          courseId: payment.courseId,
          status: registrationResult.rows[0].status,
        });
      } catch (error) {
        console.error("❌ Error creating registration:", error.message);
        console.error("❌ Full error:", error);
      }
    } else {
      console.log("ℹ️ Registration already exists");
    }

    // Show all registrations for this user
    const userRegistrations = await client.query(
      'SELECT * FROM registrations WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [payment.userId]
    );

    console.log("📋 User registrations:", userRegistrations.rows.length);
    userRegistrations.rows.forEach((reg, index) => {
      console.log(
        `  ${index + 1}. Course ID: ${reg.courseId}, Status: ${
          reg.status
        }, Created: ${reg.createdAt}`
      );
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

testPaymentVerification();
