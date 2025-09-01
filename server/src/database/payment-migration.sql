-- Enhanced Payment System Migration Script
-- Supports both Application Fees and Course Fees with installment capabilities

-- Create enhanced payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "courseId" INTEGER NOT NULL REFERENCES courses(id),
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'GHS',
  "paymentType" VARCHAR(50) NOT NULL CHECK("paymentType" IN ('application_fee', 'course_fee', 'installment')),
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed', 'cancelled')),
  "paymentMethod" VARCHAR(50) DEFAULT 'paystack',
  "installmentNumber" INTEGER DEFAULT NULL, -- For installment payments
  "totalInstallments" INTEGER DEFAULT NULL, -- Total number of installments
  "installmentAmount" DECIMAL(10,2) DEFAULT NULL, -- Amount per installment
  "remainingBalance" DECIMAL(10,2) DEFAULT NULL, -- Remaining course fee balance
  metadata JSONB,
  "paidAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create course fee installments table
CREATE TABLE IF NOT EXISTS course_fee_installments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "courseId" INTEGER NOT NULL REFERENCES courses(id),
  "totalCourseFee" DECIMAL(10,2) NOT NULL,
  "applicationFeePaid" BOOLEAN DEFAULT FALSE,
  "applicationFeeReference" VARCHAR(255),
  "totalInstallments" INTEGER NOT NULL,
  "installmentAmount" DECIMAL(10,2) NOT NULL,
  "paidInstallments" INTEGER DEFAULT 0,
  "remainingBalance" DECIMAL(10,2) NOT NULL,
  "nextDueDate" DATE,
  "paymentPlan" VARCHAR(50) DEFAULT 'monthly' CHECK("paymentPlan" IN ('weekly', 'monthly', 'quarterly')),
  status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'defaulted', 'cancelled')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments("courseId");
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments("paymentType");
CREATE INDEX IF NOT EXISTS idx_payments_installment ON payments("installmentNumber");

CREATE INDEX IF NOT EXISTS idx_installments_user_id ON course_fee_installments("userId");
CREATE INDEX IF NOT EXISTS idx_installments_course_id ON course_fee_installments("courseId");
CREATE INDEX IF NOT EXISTS idx_installments_status ON course_fee_installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_next_due_date ON course_fee_installments("nextDueDate");

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores all payment records including application fees, course fees, and installments';
COMMENT ON COLUMN payments."paymentType" IS 'Type of payment: application_fee, course_fee, or installment';
COMMENT ON COLUMN payments."installmentNumber" IS 'Installment number for course fee payments';
COMMENT ON COLUMN payments."totalInstallments" IS 'Total number of installments for the course';
COMMENT ON COLUMN payments."remainingBalance" IS 'Remaining balance after this payment';

COMMENT ON TABLE course_fee_installments IS 'Tracks course fee installment plans for students';
COMMENT ON COLUMN course_fee_installments."totalCourseFee" IS 'Total course fee amount';
COMMENT ON COLUMN course_fee_installments."applicationFeePaid" IS 'Whether application fee has been paid';
COMMENT ON COLUMN course_fee_installments."paidInstallments" IS 'Number of installments already paid';
COMMENT ON COLUMN course_fee_installments."remainingBalance" IS 'Remaining balance to be paid';
COMMENT ON COLUMN course_fee_installments."nextDueDate" IS 'Next installment due date';
COMMENT ON COLUMN course_fee_installments."paymentPlan" IS 'Payment frequency: weekly, monthly, or quarterly';

