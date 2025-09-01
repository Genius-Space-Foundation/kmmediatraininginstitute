-- Create Course Fee Installments table
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
  "nextDueDate" TIMESTAMP,
  "paymentPlan" VARCHAR(50) NOT NULL CHECK("paymentPlan" IN ('weekly', 'monthly', 'quarterly')),
  status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'defaulted', 'cancelled')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "courseId")
);

