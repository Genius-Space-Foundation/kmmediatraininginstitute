import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { pool } from "../database/database";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

const router = express.Router();

// Get admin profile
router.get(
  "/profile",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const adminId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `SELECT id, email, "firstName", "lastName", phone, address, bio, "profileImage" as "profilePicture", role, "createdAt", "updatedAt", "lastLogin"
       FROM users 
       WHERE id = $1 AND role = 'admin'`,
        [adminId]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Admin profile not found",
        });
      }

      res.json({
        success: true,
        profile: result.rows[0],
      });
    } catch (error) {
      logger.error("Error fetching admin profile:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update admin profile
router.put(
  "/profile",
  authenticateToken,
  requireAdmin,
  [
    body("firstName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required"),
    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required"),
    body("phone").optional().trim(),
    body("address").optional().trim(),
    body("bio").optional().trim(),
    body("profilePicture").optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const adminId = req.user!.id;
      const { firstName, lastName, phone, address, bio, profilePicture } =
        req.body;

      const client = await pool.connect();

      // Update admin profile
      const result = await client.query(
        `UPDATE users 
         SET "firstName" = $1,
             "lastName" = $2,
             phone = $3,
             address = $4,
             bio = $5,
             "profileImage" = $6,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $7 AND role = 'admin'
         RETURNING id, email, "firstName", "lastName", phone, address, bio, "profileImage" as "profilePicture", role, "createdAt", "updatedAt"`,
        [
          firstName,
          lastName,
          phone || null,
          address || null,
          bio || null,
          profilePicture || null,
          adminId,
        ]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Admin profile not found",
        });
      }

      logger.info(`Admin ${adminId} updated their profile`);

      res.json({
        success: true,
        message: "Profile updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating admin profile:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Change admin password
router.put(
  "/change-password",
  authenticateToken,
  requireAdmin,
  [
    body("currentPassword")
      .isLength({ min: 1 })
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
    body("confirmPassword")
      .isLength({ min: 1 })
      .withMessage("Confirm password is required"),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New passwords do not match",
        });
      }

      const adminId = req.user!.id;
      const client = await pool.connect();

      // Get current password hash
      const userResult = await client.query(
        "SELECT password FROM users WHERE id = $1 AND role = 'admin'",
        [adminId]
      );

      if (userResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Admin not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        userResult.rows[0].password
      );
      if (!isCurrentPasswordValid) {
        client.release();
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await client.query(
        "UPDATE users SET password = $1, \"updatedAt\" = CURRENT_TIMESTAMP WHERE id = $2 AND role = 'admin'",
        [hashedNewPassword, adminId]
      );

      client.release();

      logger.info(`Admin ${adminId} changed their password`);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      logger.error("Error changing admin password:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get admin statistics
router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const client = await pool.connect();

      // Get total admins
      const adminsResult = await client.query(
        "SELECT COUNT(*) as total FROM users WHERE role = 'admin'"
      );
      const totalAdmins = parseInt(adminsResult.rows[0].total);

      // Get total students
      const studentsResult = await client.query(
        "SELECT COUNT(*) as total FROM users WHERE role = 'student'"
      );
      const totalStudents = parseInt(studentsResult.rows[0].total);

      // Get total trainers
      const trainersResult = await client.query(
        "SELECT COUNT(*) as total FROM users WHERE role = 'trainer'"
      );
      const totalTrainers = parseInt(trainersResult.rows[0].total);

      // Get total courses
      const coursesResult = await client.query(
        "SELECT COUNT(*) as total FROM courses"
      );
      const totalCourses = parseInt(coursesResult.rows[0].total);

      // Get active courses
      const activeCoursesResult = await client.query(
        'SELECT COUNT(*) as total FROM courses WHERE "isActive" = true'
      );
      const activeCourses = parseInt(activeCoursesResult.rows[0].total);

      // Get total registrations
      const registrationsResult = await client.query(
        "SELECT COUNT(*) as total FROM registrations"
      );
      const totalRegistrations = parseInt(registrationsResult.rows[0].total);

      // Get pending registrations
      const pendingRegistrationsResult = await client.query(
        "SELECT COUNT(*) as total FROM registrations WHERE status = 'pending'"
      );
      const pendingRegistrations = parseInt(
        pendingRegistrationsResult.rows[0].total
      );

      // Get total revenue
      const revenueResult = await client.query(
        "SELECT SUM(price) as total FROM courses"
      );
      const totalRevenue = parseFloat(revenueResult.rows[0].total || "0");

      client.release();

      res.json({
        success: true,
        data: {
          totalAdmins,
          totalStudents,
          totalTrainers,
          totalCourses,
          activeCourses,
          totalRegistrations,
          pendingRegistrations,
          totalRevenue,
        },
      });
    } catch (error) {
      logger.error("Error fetching admin stats:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

export default router;
