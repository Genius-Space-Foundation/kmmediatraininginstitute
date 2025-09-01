import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { pool } from "../database/database";
import { authenticateToken, requireUser } from "../middleware/auth";
import { AuthRequest } from "../types";

const router = Router();

// Registration validation
const registrationValidation = [
  body("courseId").isInt({ min: 1 }).withMessage("Valid course ID is required"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes must be less than 500 characters"),
];

// Check if user has applied for a specific course
router.get(
  "/check/:courseId",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const courseId = req.params.courseId;

      const client = await pool.connect();
      try {
        const query = `SELECT id FROM registrations WHERE "userId" = $1 AND "courseId" = $2`;
        const result = await client.query(query, [userId, courseId]);

        res.json({
          success: true,
          data: { hasApplied: result.rows.length > 0 },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error checking application status:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all registrations (admin only)
router.get("/admin/all", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT r.*, 
               u."firstName", u."lastName", u.email,
               c.name as "courseName", c.description as "courseDescription"
        FROM registrations r
        JOIN users u ON r."userId" = u.id
        JOIN courses c ON r."courseId" = c.id
        ORDER BY r."createdAt" DESC
      `;

      const result = await client.query(query);

      res.json({
        success: true,
        data: { registrations: result.rows },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Get registrations by status (admin only)
router.get("/admin/status/:status", async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const validStatuses = ["pending", "approved", "rejected", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT r.*, 
               u."firstName", u."lastName", u.email,
               c.name as "courseName", c.description as "courseDescription"
        FROM registrations r
        JOIN users u ON r."userId" = u.id
        JOIN courses c ON r."courseId" = c.id
        WHERE r.status = $1
        ORDER BY r."createdAt" DESC
      `;

      const result = await client.query(query, [status]);

      res.json({
        success: true,
        data: { registrations: result.rows },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching registrations by status:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Update registration status (admin only)
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "approved", "rejected", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const client = await pool.connect();
    try {
      const query = `
        UPDATE registrations 
        SET status = $1, "updatedAt" = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await client.query(query, [status, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Registration not found",
        });
      }

      res.json({
        success: true,
        message: "Registration status updated successfully",
        data: { registration: result.rows[0] },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating registration status:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Get registration statistics (admin only)
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    try {
      // Get total registrations
      const totalRegistrationsResult = await client.query(
        "SELECT COUNT(*) as count FROM registrations"
      );
      const totalRegistrations = parseInt(
        totalRegistrationsResult.rows[0].count
      );

      // Get registrations by status
      const pendingResult = await client.query(
        "SELECT COUNT(*) as count FROM registrations WHERE status = $1",
        ["pending"]
      );
      const pendingRegistrations = parseInt(pendingResult.rows[0].count);

      const approvedResult = await client.query(
        "SELECT COUNT(*) as count FROM registrations WHERE status = $1",
        ["approved"]
      );
      const approvedRegistrations = parseInt(approvedResult.rows[0].count);

      const rejectedResult = await client.query(
        "SELECT COUNT(*) as count FROM registrations WHERE status = $1",
        ["rejected"]
      );
      const rejectedRegistrations = parseInt(rejectedResult.rows[0].count);

      const completedResult = await client.query(
        "SELECT COUNT(*) as count FROM registrations WHERE status = $1",
        ["completed"]
      );
      const completedRegistrations = parseInt(completedResult.rows[0].count);

      // Get recent registrations (last 7 days)
      const recentRegistrationsResult = await client.query(
        "SELECT COUNT(*) as count FROM registrations WHERE \"createdAt\" >= NOW() - INTERVAL '7 days'"
      );
      const recentRegistrations = parseInt(
        recentRegistrationsResult.rows[0].count
      );

      // Get total revenue (sum of course prices for approved registrations)
      const revenueResult = await client.query(`
        SELECT COALESCE(SUM(c.price), 0) as total 
        FROM registrations r 
        JOIN courses c ON r."courseId" = c.id 
        WHERE r.status = 'approved'
      `);
      const totalRevenue = parseFloat(revenueResult.rows[0].total || "0");

      res.json({
        success: true,
        data: {
          totalRegistrations,
          pendingRegistrations,
          approvedRegistrations,
          rejectedRegistrations,
          completedRegistrations,
          recentRegistrations,
          totalRevenue,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching registration stats:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Get user's own registrations (authenticated user)
router.get("/my", async (req: Request, res: Response) => {
  try {
    // This would need authentication middleware in a real implementation
    // For now, we'll get userId from query params
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const client = await pool.connect();
    try {
      const query = `
        SELECT r.*, 
               c.name as "courseName", c.description as "courseDescription",
               c.duration, c.price, c.category
        FROM registrations r
        JOIN courses c ON r."courseId" = c.id
        WHERE r."userId" = $1
        ORDER BY r."createdAt" DESC
      `;

      const result = await client.query(query, [userId]);

      res.json({
        success: true,
        data: { registrations: result.rows },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

export default router;
