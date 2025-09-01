const { Pool } = require("pg");

// Database configuration
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "kmmedia",
  user: "postgres",
  password: "", // Try with empty password first
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function addPaymentColumns() {
  const client = await pool.connect();

  try {
    console.log("Adding payment columns...");

    // Add new columns to payments table
    const alterQueries = [
      "ALTER TABLE payments ADD COLUMN IF NOT EXISTS \"paymentType\" VARCHAR(50) DEFAULT 'application_fee'",
      'ALTER TABLE payments ADD COLUMN IF NOT EXISTS "installmentNumber" INTEGER',
      'ALTER TABLE payments ADD COLUMN IF NOT EXISTS "totalInstallments" INTEGER',
      'ALTER TABLE payments ADD COLUMN IF NOT EXISTS "installmentAmount" DECIMAL(10,2)',
      'ALTER TABLE payments ADD COLUMN IF NOT EXISTS "remainingBalance" DECIMAL(10,2)',
      "ALTER TABLE payments ALTER COLUMN status TYPE VARCHAR(50)",
      "ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check",
      "ALTER TABLE payments ADD CONSTRAINT payments_status_check CHECK (status IN ('pending', 'success', 'failed', 'cancelled'))",
    ];

    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log(`Executed: ${query}`);
      } catch (error) {
        if (error.code === "42710") {
          console.log(
            `Column already exists or constraint already applied: ${query}`
          );
        } else {
          console.error(`Error executing: ${query}`, error.message);
        }
      }
    }

    // Create course_fee_installments table
    const createInstallmentsTable = `
      CREATE TABLE IF NOT EXISTS course_fee_installments (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        "courseId" INTEGER NOT NULL REFERENCES courses(id),
        "totalCourseFee" DECIMAL(10,2) NOT NULL,
        "applicationFeePaid" BOOLEAN DEFAULT false,
        "applicationFeeReference" VARCHAR(255),
        "totalInstallments" INTEGER NOT NULL,
        "installmentAmount" DECIMAL(10,2) NOT NULL,
        "paidInstallments" INTEGER DEFAULT 0,
        "remainingBalance" DECIMAL(10,2) NOT NULL,
        "nextDueDate" DATE,
        "paymentPlan" VARCHAR(20) NOT NULL CHECK("paymentPlan" IN ('weekly', 'monthly', 'quarterly')),
        status VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'defaulted', 'cancelled')),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await client.query(createInstallmentsTable);
      console.log("Created course_fee_installments table");
    } catch (error) {
      console.log(
        "course_fee_installments table already exists or error:",
        error.message
      );
    }

    console.log("Payment columns added successfully!");
  } catch (error) {
    console.error("Failed to add payment columns:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addPaymentColumns();


