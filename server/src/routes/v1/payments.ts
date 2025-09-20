import { Router } from "express";
import { PaymentController } from "../../controllers/PaymentController";
import { authenticateToken } from "../../middleware/auth";
import { checkRole } from "../../middleware/checkRole";
import { createValidationMiddleware } from "../../utils/validation";
import { body, param, query } from "express-validator";

const router = Router();
const paymentController = new PaymentController();

// Validation middleware
const paymentValidation = [
  body("registration_id")
    .isUUID()
    .withMessage("Valid registration ID is required"),
  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  body("payment_method")
    .optional()
    .isIn(["paystack", "mobile_money", "bank_transfer"])
    .withMessage("Invalid payment method"),
];

const webhookValidation = [
  body("event").isString().withMessage("Event is required"),
  body("data").isObject().withMessage("Data is required"),
  body("data.reference").isString().withMessage("Reference is required"),
  body("data.status").isString().withMessage("Status is required"),
  body("data.amount").isNumeric().withMessage("Amount is required"),
];

// Get payments for a student
router.get(
  "/student/:studentId",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("studentId").isUUID()]),
  paymentController.getPaymentsByStudent.bind(paymentController)
);

// Get my payments (for students)
router.get(
  "/my-payments",
  authenticateToken,
  checkRole(["student"]),
  paymentController.getMyPayments.bind(paymentController)
);

// Get payments by registration
router.get(
  "/registration/:registrationId",
  authenticateToken,
  checkValidationMiddleware([param("registrationId").isUUID()]),
  paymentController.getPaymentsByRegistration.bind(paymentController)
);

// Get payment by ID
router.get(
  "/:id",
  authenticateToken,
  createValidationMiddleware([param("id").isUUID()]),
  paymentController.getPaymentById.bind(paymentController)
);

// Get payment by reference
router.get(
  "/reference/:reference",
  authenticateToken,
  createValidationMiddleware([param("reference").isString()]),
  paymentController.getPaymentByReference.bind(paymentController)
);

// Create payment (students)
router.post(
  "/",
  authenticateToken,
  checkRole(["student"]),
  createValidationMiddleware(paymentValidation),
  paymentController.createPayment.bind(paymentController)
);

// Update payment status (internal/webhook)
router.put(
  "/:reference/status",
  authenticateToken,
  checkRole(["admin"]),
  createValidationMiddleware([
    param("reference").isString(),
    body("status").isIn(["successful", "failed", "cancelled"]),
  ]),
  paymentController.updatePaymentStatus.bind(paymentController)
);

// Process Paystack webhook
router.post(
  "/webhook/paystack",
  createValidationMiddleware(webhookValidation),
  paymentController.processPaystackWebhook.bind(paymentController)
);

// Get total revenue (admin only)
router.get(
  "/analytics/revenue",
  authenticateToken,
  checkRole(["admin"]),
  createValidationMiddleware([
    query("start_date").optional().isISO8601(),
    query("end_date").optional().isISO8601(),
  ]),
  paymentController.getTotalRevenue.bind(paymentController)
);

// Get monthly revenue (admin only)
router.get(
  "/analytics/monthly-revenue/:year",
  authenticateToken,
  checkRole(["admin"]),
  createValidationMiddleware([param("year").isInt({ min: 2020, max: 2030 })]),
  paymentController.getMonthlyRevenue.bind(paymentController)
);

// Get payment analytics (admin only)
router.get(
  "/analytics/overview",
  authenticateToken,
  checkRole(["admin"]),
  createValidationMiddleware([
    query("start_date").optional().isISO8601(),
    query("end_date").optional().isISO8601(),
  ]),
  paymentController.getPaymentAnalytics.bind(paymentController)
);

// Course Fee Installments routes
// Get installments by registration
router.get(
  "/installments/registration/:registrationId",
  authenticateToken,
  createValidationMiddleware([param("registrationId").isUUID()]),
  paymentController.getInstallmentsByRegistration.bind(paymentController)
);

// Get overdue installments (admin only)
router.get(
  "/installments/overdue",
  authenticateToken,
  checkRole(["admin"]),
  paymentController.getOverdueInstallments.bind(paymentController)
);

// Create installment plan (admin only)
router.post(
  "/installments/plan",
  authenticateToken,
  checkRole(["admin"]),
  createValidationMiddleware([
    body("registration_id").isUUID(),
    body("total_amount").isFloat({ min: 0.01 }),
    body("number_of_installments").isInt({ min: 1, max: 12 }),
    body("start_date").isISO8601(),
  ]),
  paymentController.createInstallmentPlan.bind(paymentController)
);

// Mark installment as paid
router.post(
  "/installments/:id/paid",
  authenticateToken,
  checkRole(["admin"]),
  createValidationMiddleware([
    param("id").isUUID(),
    body("payment_reference").isString(),
  ]),
  paymentController.markInstallmentAsPaid.bind(paymentController)
);

export default router;
