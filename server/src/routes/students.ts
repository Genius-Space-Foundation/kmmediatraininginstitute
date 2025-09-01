import { Router, Request, Response } from "express";
import { authenticateToken, requireUser } from "../middleware/auth";
import { AuthRequest } from "../types";
import { pool } from "../database/database";

const router = Router();

// Get student dashboard overview data
router.get(
  "/dashboard/overview",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Get user's registrations with course details
      const registrationsQuery = `
      SELECT r.*, c.name as "courseName", c.description as "courseDescription", 
             c.duration, c.price, c."maxStudents"
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC
    `;

      const registrationsResult = await pool.query(registrationsQuery, [
        userId,
      ]);
      const registrations = registrationsResult.rows;

      // Calculate statistics
      const totalRegistrations = registrations.length;
      const activeRegistrations = registrations.filter(
        (r: any) => r.status === "approved"
      ).length;
      const pendingRegistrations = registrations.filter(
        (r: any) => r.status === "pending"
      ).length;
      const completedRegistrations = registrations.filter(
        (r: any) => r.status === "completed"
      ).length;

      // Get recent payments (simplified query to avoid missing columns)
      const paymentsQuery = `
      SELECT p.*, c.name as "courseName"
      FROM payments p
      JOIN courses c ON p."courseId" = c.id
      WHERE p."userId" = $1
      ORDER BY p."createdAt" DESC
      LIMIT 5
    `;

      const paymentsResult = await pool.query(paymentsQuery, [userId]);
      const payments = paymentsResult.rows;

      // Calculate total spent
      const totalSpent = payments
        .filter((p: any) => p.status === "success")
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

      res.json({
        success: true,
        data: {
          stats: {
            totalRegistrations,
            activeRegistrations,
            pendingRegistrations,
            completedRegistrations,
            totalSpent: totalSpent.toFixed(2),
          },
          recentRegistrations: registrations.slice(0, 5),
          recentPayments: payments.slice(0, 5),
        },
      });
    } catch (error) {
      console.error("Dashboard overview error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's courses
router.get(
  "/courses",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const query = `
      SELECT r.*, c.name as "courseName", c.description as "courseDescription", 
             c.duration, c.price, c."maxStudents", c."featuredImage"
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC
    `;

      const result = await pool.query(query, [userId]);

      res.json({
        success: true,
        data: { registrations: result.rows },
      });
    } catch (error) {
      console.error("Student courses error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's payments
router.get(
  "/payments",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const query = `
      SELECT p.*, c.name as "courseName"
      FROM payments p
      JOIN courses c ON p."courseId" = c.id
      WHERE p."userId" = $1
      ORDER BY p."createdAt" DESC
    `;

      const result = await pool.query(query, [userId]);

      res.json({
        success: true,
        data: { payments: result.rows },
      });
    } catch (error) {
      console.error("Student payments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's profile data
router.get(
  "/profile",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const query = `
        SELECT id, email, "firstName", "lastName", phone, address, role, "profileImage", "createdAt"
        FROM users
        WHERE id = $1
      `;

      const result = await pool.query(query, [userId]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Student profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;
