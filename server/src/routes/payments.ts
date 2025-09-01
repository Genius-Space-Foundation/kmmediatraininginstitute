import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  requireUser,
  requireAdmin,
} from "../middleware/auth";
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
        paymentType: "application_fee",
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
                // Create course registration with actual schema (only existing fields)
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

// Get user's installment plans
router.get(
  "/installment-plans",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const installmentPlans = await paymentService.getInstallmentPlansByUserId(
        userId
      );

      res.json({
        success: true,
        data: { installmentPlans },
      });
    } catch (error: any) {
      console.error("Get installment plans error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get specific installment plan for a course
router.get(
  "/installment-plan/:courseId",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const courseId = parseInt(req.params.courseId);

      const installmentPlan = await paymentService.getCourseFeeInstallmentPlan(
        userId,
        courseId
      );

      if (!installmentPlan) {
        return res.status(404).json({
          success: false,
          message: "Installment plan not found",
        });
      }

      res.json({
        success: true,
        data: { installmentPlan },
      });
    } catch (error: any) {
      console.error("Get installment plan error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Create installment plan
router.post(
  "/installment-plan",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { courseId, totalCourseFee, totalInstallments, paymentPlan } =
        req.body;

      // Validate required fields
      if (!courseId || !totalCourseFee || !totalInstallments || !paymentPlan) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Calculate installment amount
      const installmentAmount = Math.ceil(totalCourseFee / totalInstallments);

      // Create installment plan
      const installmentPlan =
        await paymentService.createCourseFeeInstallmentPlan({
          userId,
          courseId,
          totalCourseFee,
          totalInstallments,
          paymentPlan,
          installmentAmount,
        });

      res.json({
        success: true,
        message: "Installment plan created successfully",
        data: { installmentPlan },
      });
    } catch (error: any) {
      console.error("Create installment plan error:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// Get payment statistics (admin only)
router.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        // Get total payments
        const totalPaymentsResult = await client.query(
          "SELECT COUNT(*) as count FROM payments"
        );
        const totalPayments = parseInt(totalPaymentsResult.rows[0].count);

        // Get successful payments
        const successfulPaymentsResult = await client.query(
          "SELECT COUNT(*) as count FROM payments WHERE status = 'success'"
        );
        const successfulPayments = parseInt(
          successfulPaymentsResult.rows[0].count
        );

        // Get failed payments
        const failedPaymentsResult = await client.query(
          "SELECT COUNT(*) as count FROM payments WHERE status = 'failed'"
        );
        const failedPayments = parseInt(failedPaymentsResult.rows[0].count);

        // Get pending payments
        const pendingPaymentsResult = await client.query(
          "SELECT COUNT(*) as count FROM payments WHERE status = 'pending'"
        );
        const pendingPayments = parseInt(pendingPaymentsResult.rows[0].count);

        // Get total revenue
        const totalRevenueResult = await client.query(
          `SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total 
           FROM payments WHERE status = 'success'`
        );
        const totalRevenue = parseFloat(
          totalRevenueResult.rows[0].total || "0"
        );

        // Get monthly revenue
        const monthlyRevenueResult = await client.query(
          `SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total 
           FROM payments 
           WHERE status = 'success' 
           AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)`
        );
        const monthlyRevenue = parseFloat(
          monthlyRevenueResult.rows[0].total || "0"
        );

        // Get recent payments
        const recentPaymentsResult = await client.query(
          `SELECT p.*, u."firstName", u."lastName", c.name as "courseName"
           FROM payments p
           LEFT JOIN users u ON p."userId" = u.id
           LEFT JOIN courses c ON p."courseId" = c.id
           ORDER BY p."createdAt" DESC
           LIMIT 5`
        );

        res.json({
          success: true,
          data: {
            totalPayments,
            successfulPayments,
            failedPayments,
            pendingPayments,
            totalRevenue,
            monthlyRevenue,
            recentPayments: recentPaymentsResult.rows,
          },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Get payment stats error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all payments (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const query = `
          SELECT p.*, 
                 u."firstName", u."lastName", u.email,
                 c.name as "courseName", c.description as "courseDescription"
          FROM payments p
          LEFT JOIN users u ON p."userId" = u.id
          LEFT JOIN courses c ON p."courseId" = c.id
          ORDER BY p."createdAt" DESC
        `;

        const result = await client.query(query);

        res.json({
          success: true,
          data: { payments: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Get all payments error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all installment plans (admin only)
router.get(
  "/admin/installment-plans",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
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
          // Return empty array if table doesn't exist
          res.json({
            success: true,
            data: { installmentPlans: [] },
          });
          return;
        }

        const query = `
          SELECT cfi.*, 
                 u."firstName", u."lastName", u.email,
                 c.name as "courseName", c.description as "courseDescription"
          FROM course_fee_installments cfi
          LEFT JOIN users u ON cfi."userId" = u.id
          LEFT JOIN courses c ON cfi."courseId" = c.id
          ORDER BY cfi."createdAt" DESC
        `;

        const result = await client.query(query);

        res.json({
          success: true,
          data: { installmentPlans: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Get all installment plans error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
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
