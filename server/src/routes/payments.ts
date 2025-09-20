import express, { Request, Response } from "express";
import { pool } from "../database/database";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { logger } from "../utils/logger";

const router = express.Router();

// Get all payments (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      const result = await client.query(`
      SELECT p.*, u."firstName", u."lastName", u.email, c.name as "courseName"
      FROM payments p
      LEFT JOIN users u ON p."userId" = u.id
      LEFT JOIN courses c ON p."courseId" = c.id
      ORDER BY p."createdAt" DESC
    `);
      client.release();

      res.json({
        success: true,
        payments: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching payments:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
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

      // Get total revenue
      const totalRevenueResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as "totalRevenue"
      FROM payments 
      WHERE status = 'completed'
    `);

      // Get monthly revenue
      const monthlyRevenueResult = await client.query(`
      SELECT COALESCE(SUM(amount), 0) as "monthlyRevenue"
      FROM payments 
      WHERE status = 'completed' 
      AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
    `);

      // Get pending payments
      const pendingPaymentsResult = await client.query(`
      SELECT COUNT(*) as "pendingPayments"
      FROM payments 
      WHERE status = 'pending'
    `);

      // Get completed payments
      const completedPaymentsResult = await client.query(`
      SELECT COUNT(*) as "completedPayments"
      FROM payments 
      WHERE status = 'completed'
    `);

      client.release();

      res.json({
        success: true,
        data: {
          totalRevenue: parseFloat(totalRevenueResult.rows[0].totalRevenue),
          monthlyRevenue: parseFloat(
            monthlyRevenueResult.rows[0].monthlyRevenue
          ),
          pendingPayments: parseInt(
            pendingPaymentsResult.rows[0].pendingPayments
          ),
          completedPayments: parseInt(
            completedPaymentsResult.rows[0].completedPayments
          ),
        },
      });
    } catch (error) {
      logger.error("Error fetching payment stats:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get payment by ID (admin only)
router.get(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();

      const result = await client.query(
        `
      SELECT p.*, u."firstName", u."lastName", u.email, c.name as "courseName"
      FROM payments p
      LEFT JOIN users u ON p."userId" = u.id
      LEFT JOIN courses c ON p."courseId" = c.id
      WHERE p.id = $1
    `,
        [id]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.json({
        success: true,
        payment: result.rows[0],
      });
    } catch (error) {
      logger.error("Error fetching payment:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update payment status (admin only)
router.put(
  "/admin/:id/status",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "completed", "failed", "refunded"].includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: pending, completed, failed, refunded",
        });
      }

      const client = await pool.connect();

      const result = await client.query(
        `
      UPDATE payments 
      SET status = $1, "updatedAt" = NOW()
      WHERE id = $2
      RETURNING *
    `,
        [status, id]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Payment not found",
        });
      }

      res.json({
        success: true,
        message: "Payment status updated successfully",
        payment: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating payment status:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

export default router;
