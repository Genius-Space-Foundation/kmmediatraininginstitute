-- Enhanced Payment System Migration Script
-- This script updates the existing database to support the new payment structure

-- Step 1: Add new columns to existing payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS "paymentType" VARCHAR(50) DEFAULT 'application_fee' CHECK("paymentType" IN ('application_fee', 'course_fee', 'installment')),
ADD COLUMN IF NOT EXISTS "installmentNumber" INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "totalInstallments" INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "installmentAmount" DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS "remainingBalance" DECIMAL(10,2) DEFAULT NULL;

-- Step 2: Update existing payments to have the correct payment type
UPDATE payments 
SET "paymentType" = 'application_fee' 
WHERE "paymentType" IS NULL;

-- Step 3: Create the new course_fee_installments table
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

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments("paymentType");
CREATE INDEX IF NOT EXISTS idx_payments_installment ON payments("installmentNumber");

CREATE INDEX IF NOT EXISTS idx_installments_user_id ON course_fee_installments("userId");
CREATE INDEX IF NOT EXISTS idx_installments_course_id ON course_fee_installments("courseId");
CREATE INDEX IF NOT EXISTS idx_installments_status ON course_fee_installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_next_due_date ON course_fee_installments("nextDueDate");

-- Step 5: Add comments for documentation
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

-- Step 6: Create a function to automatically set next due date
CREATE OR REPLACE FUNCTION set_next_due_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."nextDueDate" IS NULL THEN
    NEW."nextDueDate" := CURRENT_DATE + INTERVAL '1 month';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to automatically set next due date
DROP TRIGGER IF EXISTS trigger_set_next_due_date ON course_fee_installments;
CREATE TRIGGER trigger_set_next_due_date
  BEFORE INSERT ON course_fee_installments
  FOR EACH ROW
  EXECUTE FUNCTION set_next_due_date();

-- Step 8: Create a function to update installment plan after payment
CREATE OR REPLACE FUNCTION update_installment_plan_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if this is a successful installment payment
  IF NEW.status = 'success' AND NEW."paymentType" = 'installment' AND OLD.status != 'success' THEN
    UPDATE course_fee_installments 
    SET "paidInstallments" = "paidInstallments" + 1,
        "remainingBalance" = "remainingBalance" - NEW.amount,
        "nextDueDate" = CASE 
          WHEN "paymentPlan" = 'weekly' THEN "nextDueDate" + INTERVAL '1 week'
          WHEN "paymentPlan" = 'monthly' THEN "nextDueDate" + INTERVAL '1 month'
          WHEN "paymentPlan" = 'quarterly' THEN "nextDueDate" + INTERVAL '3 months'
          ELSE "nextDueDate" + INTERVAL '1 month'
        END,
        status = CASE 
          WHEN "remainingBalance" - NEW.amount <= 0 THEN 'completed'
          ELSE status
        END,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "userId" = NEW."userId" AND "courseId" = NEW."courseId";
  END IF;
  
  -- Mark application fee as paid if this is a successful application fee payment
  IF NEW.status = 'success' AND NEW."paymentType" = 'application_fee' AND OLD.status != 'success' THEN
    UPDATE course_fee_installments 
    SET "applicationFeePaid" = true,
        "applicationFeeReference" = NEW.reference,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE "userId" = NEW."userId" AND "courseId" = NEW."courseId";
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger to automatically update installment plans
DROP TRIGGER IF EXISTS trigger_update_installment_plan ON payments;
CREATE TRIGGER trigger_update_installment_plan
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_installment_plan_after_payment();

-- Step 10: Insert sample data for testing (optional)
-- Uncomment the following lines if you want to insert sample data

/*
INSERT INTO course_fee_installments (
  "userId", "courseId", "totalCourseFee", "totalInstallments", 
  "installmentAmount", "remainingBalance", "paymentPlan"
) VALUES 
(1, 1, 2000, 6, 334, 2000, 'monthly'),
(1, 2, 1500, 4, 375, 1500, 'monthly')
ON CONFLICT DO NOTHING;
*/

-- Step 11: Verify migration
SELECT 'Migration completed successfully!' as status;

-- Check if tables exist and have correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('payments', 'course_fee_installments')
ORDER BY table_name, ordinal_position;


