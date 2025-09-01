const Paystack = require("paystack");
import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/database";
import {
  PaymentRequest,
  PaymentResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentRecord,
  CourseFeeInstallment,
  CourseFeeInstallmentRequest,
} from "../types";

class PaymentService {
  private paystack: any;

  constructor() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is required");
    }
    this.paystack = Paystack(secretKey);
  }

  async initializePayment(
    paymentData: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const reference = `KM_MEDIA_${uuidv4()
        .replace(/-/g, "")
        .substring(0, 16)}`;

      const transaction = await this.paystack.transaction.initialize({
        amount: paymentData.amount * 100, // Convert to kobo (smallest currency unit)
        email: paymentData.email,
        reference,
        callback_url: paymentData.callbackUrl,
        metadata: {
          courseId: paymentData.courseId,
          firstName: paymentData.firstName,
          lastName: paymentData.lastName,
          phone: paymentData.phone,
          ...paymentData.metadata,
        },
        channels: [
          "card",
          "bank",
          "ussd",
          "qr",
          "mobile_money",
          "bank_transfer",
        ],
        currency: "GHS",
      });

      if (transaction.status) {
        // Save payment record to database with enhanced fields
        await this.savePaymentRecord({
          userId: paymentData.metadata?.userId,
          courseId: paymentData.courseId,
          reference,
          amount: paymentData.amount,
          currency: "GHS",
          paymentType: paymentData.paymentType,
          status: "pending",
          paymentMethod: "paystack",
          installmentNumber: paymentData.installmentNumber,
          totalInstallments: paymentData.totalInstallments,
          installmentAmount: paymentData.installmentAmount,
          remainingBalance: paymentData.remainingBalance,
          metadata: paymentData.metadata,
        });

        return {
          success: true,
          message: "Payment initialized successfully",
          data: {
            authorizationUrl: transaction.data.authorization_url,
            reference: transaction.data.reference,
            accessCode: transaction.data.access_code,
          },
        };
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      return {
        success: false,
        message: error.message || "Failed to initialize payment",
      };
    }
  }

  async verifyPayment(
    verificationData: PaymentVerificationRequest
  ): Promise<PaymentVerificationResponse> {
    try {
      const verification = await this.paystack.transaction.verify(
        verificationData.reference
      );

      if (verification.status) {
        const transaction = verification.data;

        // Update payment record in database
        await this.updatePaymentRecord(verificationData.reference, {
          status: transaction.status === "success" ? "success" : "failed",
          paidAt: transaction.paid_at,
          metadata: {
            channel: transaction.channel,
            gateway_response: transaction.gateway_response,
            ip_address: transaction.ip_address,
            fees: transaction.fees,
            ...transaction.metadata,
          },
        });

        return {
          success: true,
          message: "Payment verification successful",
          data: {
            status: transaction.status,
            reference: transaction.reference,
            amount: transaction.amount / 100, // Convert from kobo to cedis
            paidAt: transaction.paid_at,
            channel: transaction.channel,
            currency: transaction.currency,
            metadata: transaction.metadata,
          },
        };
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      return {
        success: false,
        message: error.message || "Failed to verify payment",
      };
    }
  }

  private async savePaymentRecord(
    paymentData: Partial<PaymentRecord>
  ): Promise<void> {
    const client = await pool.connect();
    try {
      // Try to insert with new columns first
      try {
        await client.query(
          `INSERT INTO payments (
            "userId", "courseId", reference, amount, currency, "paymentType", status, 
            "paymentMethod", "installmentNumber", "totalInstallments", "installmentAmount", 
            "remainingBalance", metadata, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            paymentData.userId,
            paymentData.courseId,
            paymentData.reference,
            paymentData.amount,
            paymentData.currency,
            paymentData.paymentType,
            paymentData.status,
            paymentData.paymentMethod,
            paymentData.installmentNumber,
            paymentData.totalInstallments,
            paymentData.installmentAmount,
            paymentData.remainingBalance,
            paymentData.metadata ? JSON.stringify(paymentData.metadata) : null,
          ]
        );
      } catch (error: any) {
        // If new columns don't exist, fall back to basic insert
        if (error.code === "42703") {
          // Column doesn't exist error
          console.log("New payment columns not found, using fallback insert");
          await client.query(
            `INSERT INTO payments (
              "userId", "courseId", reference, amount, currency, status, 
              "paymentMethod", metadata, "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              paymentData.userId,
              paymentData.courseId,
              paymentData.reference,
              paymentData.amount,
              paymentData.currency,
              paymentData.status,
              paymentData.paymentMethod,
              paymentData.metadata
                ? JSON.stringify(paymentData.metadata)
                : null,
            ]
          );
        } else {
          throw error; // Re-throw if it's not a column error
        }
      }
    } finally {
      client.release();
    }
  }

  private async updatePaymentRecord(
    reference: string,
    updateData: Partial<PaymentRecord>
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE payments 
         SET status = $1, "paidAt" = $2, metadata = $3, "updatedAt" = CURRENT_TIMESTAMP
         WHERE reference = $4`,
        [
          updateData.status,
          updateData.paidAt,
          updateData.metadata ? JSON.stringify(updateData.metadata) : null,
          reference,
        ]
      );
    } finally {
      client.release();
    }
  }

  async getPaymentByReference(
    reference: string
  ): Promise<PaymentRecord | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM payments WHERE reference = $1",
        [reference]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getPaymentsByUserId(userId: number): Promise<PaymentRecord[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM payments WHERE "userId" = $1 ORDER BY "createdAt" DESC',
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Course Fee Installment Methods
  async createCourseFeeInstallmentPlan(
    installmentData: CourseFeeInstallmentRequest & { userId: number }
  ): Promise<CourseFeeInstallment> {
    const client = await pool.connect();
    try {
      // Calculate next due date based on payment plan
      const nextDueDate = new Date();
      if (installmentData.paymentPlan === "weekly") {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      } else if (installmentData.paymentPlan === "monthly") {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      } else if (installmentData.paymentPlan === "quarterly") {
        nextDueDate.setMonth(nextDueDate.getMonth() + 3);
      }

      const result = await client.query(
        `INSERT INTO course_fee_installments (
          "userId", "courseId", "totalCourseFee", "totalInstallments", 
          "installmentAmount", "remainingBalance", "nextDueDate", "paymentPlan", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          installmentData.userId,
          installmentData.courseId,
          installmentData.totalCourseFee,
          installmentData.totalInstallments,
          installmentData.installmentAmount,
          installmentData.totalCourseFee, // Initially, remaining balance equals total course fee
          nextDueDate,
          installmentData.paymentPlan,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getCourseFeeInstallmentPlan(
    userId: number,
    courseId: number
  ): Promise<CourseFeeInstallment | null> {
    const client = await pool.connect();
    try {
      // Check if course_fee_installments table exists
      const tableExistsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'course_fee_installments'
        );
      `);

      const tableExists = tableExistsResult.rows[0].exists;

      if (!tableExists) {
        console.log("course_fee_installments table does not exist");
        return null;
      }

      const result = await client.query(
        'SELECT * FROM course_fee_installments WHERE "userId" = $1 AND "courseId" = $2',
        [userId, courseId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async updateInstallmentPlanAfterPayment(
    userId: number,
    courseId: number,
    paymentAmount: number
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE course_fee_installments 
         SET "paidInstallments" = "paidInstallments" + 1,
             "remainingBalance" = "remainingBalance" - $1,
             "nextDueDate" = CASE 
               WHEN "paymentPlan" = 'weekly' THEN "nextDueDate" + INTERVAL '1 week'
               WHEN "paymentPlan" = 'monthly' THEN "nextDueDate" + INTERVAL '1 month'
               WHEN "paymentPlan" = 'quarterly' THEN "nextDueDate" + INTERVAL '3 months'
               ELSE "nextDueDate" + INTERVAL '1 month'
             END,
             status = CASE 
               WHEN "remainingBalance" - $1 <= 0 THEN 'completed'
               ELSE status
             END,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "userId" = $2 AND "courseId" = $3`,
        [paymentAmount, userId, courseId]
      );
    } finally {
      client.release();
    }
  }

  async markApplicationFeeAsPaid(
    userId: number,
    courseId: number,
    reference: string
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE course_fee_installments 
         SET "applicationFeePaid" = true,
             "applicationFeeReference" = $1,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "userId" = $2 AND "courseId" = $3`,
        [reference, userId, courseId]
      );
    } finally {
      client.release();
    }
  }

  async getInstallmentPlansByUserId(
    userId: number
  ): Promise<CourseFeeInstallment[]> {
    const client = await pool.connect();
    try {
      // Check if course_fee_installments table exists
      const tableExistsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = 'course_fee_installments'
        );
      `);

      const tableExists = tableExistsResult.rows[0].exists;

      if (!tableExists) {
        console.log("course_fee_installments table does not exist");
        return [];
      }

      const result = await client.query(
        `SELECT cfi.*, c.name as "courseName", c.description as "courseDescription"
         FROM course_fee_installments cfi
         JOIN courses c ON cfi."courseId" = c.id
         WHERE cfi."userId" = $1 
         ORDER BY cfi."createdAt" DESC`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }
}

export const paymentService = new PaymentService();
