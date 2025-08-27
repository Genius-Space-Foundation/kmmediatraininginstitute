-- Payment table migration script
-- Run this script to create the payments table

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "courseId" INTEGER NOT NULL REFERENCES courses(id),
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'GHS',
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed')),
  "paymentMethod" VARCHAR(50) DEFAULT 'paystack',
  metadata JSONB,
  "paidAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments("courseId");
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Add comments for documentation
COMMENT ON TABLE payments IS 'Stores payment records for course applications';
COMMENT ON COLUMN payments.reference IS 'Unique payment reference from Paystack';
COMMENT ON COLUMN payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, success, or failed';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata from Paystack';

