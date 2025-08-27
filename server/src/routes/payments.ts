import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireUser } from "../middleware/auth";
import {
  AuthRequest,
  PaymentRequest,
  PaymentVerificationRequest,
} from "../types";
import { paymentService } from "../services/PaymentService";
import { pool } from "../database/database";
import { verifyWebhookSignature } from "../utils/paystack";

const router = Router();

// Payment initialization validation
const paymentValidation = [
  body("courseId").isInt({ min: 1 }).withMessage("Valid course ID is required"),
  body("amount").isFloat({ min: 1 }).withMessage("Valid amount is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
];

// Payment verification validation
const verificationValidation = [
  body("reference")
    .trim()
    .notEmpty()
    .withMessage("Payment reference is required"),
];

// Initialize payment
router.post(
  "/initialize",
  authenticateToken,
  requireUser,
  paymentValidation,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user!.id;
      const {
        courseId,
        amount,
        email,
        firstName,
        lastName,
        phone,
      }: PaymentRequest = req.body;

      // Check if course exists and is active
      const client = await pool.connect();
      try {
        const courseResult = await client.query(
          'SELECT * FROM courses WHERE id = $1 AND "isActive" = true',
          [courseId]
        );

        if (courseResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found or inactive",
          });
        }

        // Check if user has already paid for this course
        const existingPaymentResult = await client.query(
          `SELECT * FROM payments 
           WHERE "userId" = $1 AND "courseId" = $2 AND status = 'success'`,
          [userId, courseId]
        );

        if (existingPaymentResult.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: "You have already paid for this course application",
          });
        }
      } finally {
        client.release();
      }

      // Set application fee
      const applicationFee = parseInt(process.env.APPLICATION_FEE || "100");

      // Initialize payment
      const paymentResult = await paymentService.initializePayment({
        courseId,
        amount: applicationFee,
        email,
        firstName,
        lastName,
        phone,
        callbackUrl: `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/payment/callback`,
        metadata: {
          userId,
          courseId,
          applicationType: "course_registration",
        },
      });

      if (paymentResult.success) {
        res.json(paymentResult);
      } else {
        res.status(400).json(paymentResult);
      }
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Verify payment
router.post(
  "/verify",
  verificationValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { reference }: PaymentVerificationRequest = req.body;

      // Verify payment with Paystack
      const verificationResult = await paymentService.verifyPayment({
        reference,
      });

      if (
        verificationResult.success &&
        verificationResult.data?.status === "success"
      ) {
        console.log(
          "🔍 Payment verification successful, checking for payment record..."
        );

        // Get payment record to extract user and course information
        const paymentRecord = await paymentService.getPaymentByReference(
          reference
        );

        console.log("🔍 Payment record found:", paymentRecord ? "YES" : "NO");
        if (paymentRecord) {
          console.log("🔍 Payment record details:", {
            userId: paymentRecord.userId,
            courseId: paymentRecord.courseId,
            status: paymentRecord.status,
            reference: paymentRecord.reference,
          });
        }

        if (paymentRecord) {
          // Check if registration already exists
          const client = await pool.connect();
          try {
            const existingRegistration = await client.query(
              'SELECT * FROM registrations WHERE "userId" = $1 AND "courseId" = $2',
              [paymentRecord.userId, paymentRecord.courseId]
            );

            if (existingRegistration.rows.length === 0) {
              try {
                // Create course registration automatically with actual schema
                const registrationResult = await client.query(
                  `INSERT INTO registrations (
                    "userId", "courseId", status, "registrationDate", notes, "createdAt", "updatedAt"
                  ) VALUES (
                    $1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                  )
                  RETURNING *`,
                  [
                    paymentRecord.userId,
                    paymentRecord.courseId,
                    "pending",
                    `Application submitted with payment reference: ${reference} on ${new Date().toLocaleString()}`,
                  ]
                );

                console.log("✅ Course registration created successfully:", {
                  registrationId: registrationResult.rows[0].id,
                  userId: paymentRecord.userId,
                  courseId: paymentRecord.courseId,
                  status: registrationResult.rows[0].status,
                  reference: reference,
                });
              } catch (error: any) {
                console.error("❌ Error creating registration:", error);
                console.error("❌ Error details:", {
                  userId: paymentRecord.userId,
                  courseId: paymentRecord.courseId,
                  reference: reference,
                  error: error.message,
                });
              }
            } else {
              console.log(
                "ℹ️ Registration already exists for this user and course:",
                {
                  userId: paymentRecord.userId,
                  courseId: paymentRecord.courseId,
                }
              );
            }
          } finally {
            client.release();
          }
        }

        res.json({
          success: true,
          message:
            "Payment verified successfully and course registration created",
          data: verificationResult.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
          data: verificationResult.data,
        });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get user's payment history
router.get(
  "/history",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const payments = await paymentService.getPaymentsByUserId(userId);

      res.json({
        success: true,
        data: { payments },
      });
    } catch (error: any) {
      console.error("Get payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Paystack webhook handler
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("PAYSTACK_WEBHOOK_SECRET not configured");
      return res
        .status(500)
        .json({ success: false, message: "Webhook secret not configured" });
    }

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );
    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return res
        .status(401)
        .json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const transaction = event.data;
      console.log("🔍 Webhook received for successful payment:", {
        reference: transaction.reference,
        amount: transaction.amount,
        status: transaction.status,
      });

      // Update payment record
      await paymentService.verifyPayment({ reference: transaction.reference });

      // Get payment record to extract user and course information
      const paymentRecord = await paymentService.getPaymentByReference(
        transaction.reference
      );

      if (paymentRecord) {
        // Check if registration already exists
        const client = await pool.connect();
        try {
          const existingRegistration = await client.query(
            'SELECT * FROM registrations WHERE "userId" = $1 AND "courseId" = $2',
            [paymentRecord.userId, paymentRecord.courseId]
          );

          if (existingRegistration.rows.length === 0) {
            try {
              // Create course registration automatically with actual schema
              const registrationResult = await client.query(
                `INSERT INTO registrations (
                    "userId", "courseId", status, "registrationDate", notes, "createdAt", "updatedAt"
                  ) VALUES (
                    $1, $2, $3, CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                  )
                  RETURNING *`,
                [
                  paymentRecord.userId,
                  paymentRecord.courseId,
                  "pending",
                  `Application submitted via webhook with payment reference: ${
                    transaction.reference
                  } on ${new Date().toLocaleString()}`,
                ]
              );

              console.log("✅ Course registration created via webhook:", {
                registrationId: registrationResult.rows[0].id,
                userId: paymentRecord.userId,
                courseId: paymentRecord.courseId,
                status: registrationResult.rows[0].status,
                reference: transaction.reference,
              });
            } catch (error: any) {
              console.error(
                "❌ Error creating registration via webhook:",
                error
              );
              console.error("❌ Error details:", {
                userId: paymentRecord.userId,
                courseId: paymentRecord.courseId,
                reference: transaction.reference,
                error: error.message,
              });
            }
          } else {
            console.log(
              "ℹ️ Registration already exists for this user and course (webhook):",
              {
                userId: paymentRecord.userId,
                courseId: paymentRecord.courseId,
              }
            );
          }
        } finally {
          client.release();
        }
      }

      // Additional logic can be added here:
      // - Send confirmation email
      // - Update user status
      // - Send notifications
    }

    res.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
});

export default router;
