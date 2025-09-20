import express, { Request, Response } from "express";
import { pool } from "../database/database";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

const router = express.Router();

// Get all users (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      const result = await client.query(`
      SELECT id, email, "firstName", "lastName", role, phone, address, 
             specialization, bio, experience, "profileImage", "createdAt", "updatedAt"
      FROM users 
      ORDER BY "createdAt" DESC
    `);
      client.release();

      res.json({
        success: true,
        users: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get user by ID (admin only)
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
      SELECT id, email, "firstName", "lastName", role, phone, address, 
             specialization, bio, experience, "profileImage", "createdAt", "updatedAt"
      FROM users 
      WHERE id = $1
    `,
        [id]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        user: result.rows[0],
      });
    } catch (error) {
      logger.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update user (admin only)
router.put(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        phone,
        address,
        specialization,
        bio,
        experience,
        role,
      } = req.body;

      const client = await pool.connect();

      const result = await client.query(
        `
      UPDATE users 
      SET "firstName" = $1, "lastName" = $2, phone = $3, address = $4, 
          specialization = $5, bio = $6, experience = $7, role = $8, "updatedAt" = NOW()
      WHERE id = $9
      RETURNING id, email, "firstName", "lastName", role, phone, address, 
                specialization, bio, experience, "profileImage", "createdAt", "updatedAt"
    `,
        [
          firstName,
          lastName,
          phone,
          address,
          specialization,
          bio,
          experience,
          role,
          id,
        ]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User updated successfully",
        user: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();

      const result = await client.query(
        `
      DELETE FROM users 
      WHERE id = $1
      RETURNING id, email, "firstName", "lastName"
    `,
        [id]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "User deleted successfully",
        user: result.rows[0],
      });
    } catch (error) {
      logger.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

export default router;


