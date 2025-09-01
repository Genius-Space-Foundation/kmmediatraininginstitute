import { Router, Request, Response } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";
import { pool } from "../database/database";
import { courseAccessService } from "../services/CourseAccessService";

const router = Router();

// Get all pending registrations (admin only)
router.get(
  "/pending-registrations",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT r.*, 
                  u."firstName", u."lastName", u.email, u.phone,
                  c.name as "courseName", c.description as "courseDescription"
           FROM registrations r
           JOIN users u ON r."userId" = u.id
           JOIN courses c ON r."courseId" = c.id
           WHERE r.status = 'pending'
           ORDER BY r."createdAt" ASC`
        );

        res.json({
          success: true,
          data: { registrations: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Approve registration and grant course access (admin only)
router.patch(
  "/registrations/:registrationId/approve",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const registrationId = parseInt(req.params.registrationId);
      const adminId = req.user!.id;

      const client = await pool.connect();
      try {
        // Get registration details
        const registrationResult = await client.query(
          `SELECT r."userId", r."courseId", u."firstName", u."lastName", c.name as "courseName"
           FROM registrations r
           JOIN users u ON r."userId" = u.id
           JOIN courses c ON r."courseId" = c.id
           WHERE r.id = $1`,
          [registrationId]
        );

        if (registrationResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Registration not found",
          });
        }

        const registration = registrationResult.rows[0];

        // Update registration status to approved
        await client.query(
          `UPDATE registrations 
           SET status = 'approved', "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [registrationId]
        );

        console.log(`✅ Admin ${adminId} approved registration ${registrationId} for student ${registration.userId} in course ${registration.courseId}`);

        res.json({
          success: true,
          message: `Registration approved for ${registration.firstName} ${registration.lastName} in ${registration.courseName}`,
          data: { registration },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error approving registration:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Reject registration (admin only)
router.patch(
  "/registrations/:registrationId/reject",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const registrationId = parseInt(req.params.registrationId);
      const { reason } = req.body;
      const adminId = req.user!.id;

      const client = await pool.connect();
      try {
        // Get registration details
        const registrationResult = await client.query(
          `SELECT r."userId", r."courseId", u."firstName", u."lastName", c.name as "courseName"
           FROM registrations r
           JOIN users u ON r."userId" = u.id
           JOIN courses c ON r."courseId" = c.id
           WHERE r.id = $1`,
          [registrationId]
        );

        if (registrationResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Registration not found",
          });
        }

        const registration = registrationResult.rows[0];

        // Update registration status to rejected
        await client.query(
          `UPDATE registrations 
           SET status = 'rejected', notes = $1, "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [reason || "Registration rejected by admin", registrationId]
        );

        console.log(`❌ Admin ${adminId} rejected registration ${registrationId} for student ${registration.userId} in course ${registration.courseId}`);

        res.json({
          success: true,
          message: `Registration rejected for ${registration.firstName} ${registration.lastName} in ${registration.courseName}`,
          data: { registration },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error rejecting registration:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get students with access to a specific course (admin only)
router.get(
  "/courses/:courseId/students",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const students = await courseAccessService.getCourseStudents(courseId);

      res.json({
        success: true,
        data: { students },
      });
    } catch (error) {
      console.error("Error fetching course students:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get pending registrations for a specific course (admin only)
router.get(
  "/courses/:courseId/pending",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const pendingRegistrations = await courseAccessService.getPendingRegistrations(courseId);

      res.json({
        success: true,
        data: { registrations: pendingRegistrations },
      });
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Bulk approve registrations (admin only)
router.post(
  "/registrations/bulk-approve",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { registrationIds } = req.body;
      const adminId = req.user!.id;

      if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Registration IDs array is required",
        });
      }

      const client = await pool.connect();
      try {
        // Update all registrations to approved
        await client.query(
          `UPDATE registrations 
           SET status = 'approved', "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = ANY($1)`,
          [registrationIds]
        );

        console.log(`✅ Admin ${adminId} bulk approved ${registrationIds.length} registrations`);

        res.json({
          success: true,
          message: `${registrationIds.length} registrations approved successfully`,
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error bulk approving registrations:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get registration statistics (admin only)
router.get(
  "/registrations/stats",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const client = await pool.connect();
      try {
        // Get counts by status
        const pendingResult = await client.query(
          "SELECT COUNT(*) as count FROM registrations WHERE status = 'pending'"
        );
        const approvedResult = await client.query(
          "SELECT COUNT(*) as count FROM registrations WHERE status = 'approved'"
        );
        const rejectedResult = await client.query(
          "SELECT COUNT(*) as count FROM registrations WHERE status = 'rejected'"
        );

        // Get recent registrations
        const recentResult = await client.query(
          `SELECT r.*, u."firstName", u."lastName", c.name as "courseName"
           FROM registrations r
           JOIN users u ON r."userId" = u.id
           JOIN courses c ON r."courseId" = c.id
           ORDER BY r."createdAt" DESC
           LIMIT 10`
        );

        res.json({
          success: true,
          data: {
            stats: {
              pending: parseInt(pendingResult.rows[0].count),
              approved: parseInt(approvedResult.rows[0].count),
              rejected: parseInt(rejectedResult.rows[0].count),
            },
            recentRegistrations: recentResult.rows,
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
  }
);

export default router;







