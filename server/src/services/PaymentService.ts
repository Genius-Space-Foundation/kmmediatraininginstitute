const Paystack = require("paystack");
import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/database";
import {
  PaymentRequest,
  PaymentResponse,
  PaymentVerificationRequest,
  PaymentVerificationResponse,
  PaymentRecord,
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
        // Save payment record to database
        await this.savePaymentRecord({
          userId: paymentData.metadata?.userId,
          courseId: paymentData.courseId,
          reference,
          amount: paymentData.amount,
          currency: "GHS",
          status: "pending",
          paymentMethod: "paystack",
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
          paymentData.metadata ? JSON.stringify(paymentData.metadata) : null,
        ]
      );
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
}

export const paymentService = new PaymentService();
