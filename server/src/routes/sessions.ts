import express, { Request, Response } from "express";
import { pool } from "../database/database";
import {
  authenticateToken,
  requireAdmin,
  requireTrainer,
} from "../middleware/auth";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

const router = express.Router();

// Get trainer sessions
router.get(
  "/trainers",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
      SELECT s.*, c.name as "courseName", c.description as "courseDescription"
      FROM sessions s
      LEFT JOIN courses c ON s."courseId" = c.id
      WHERE s."trainerId" = $1
      ORDER BY s."scheduledAt" DESC
    `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        sessions: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching trainer sessions:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all sessions (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const client = await pool.connect();

      const result = await client.query(`
      SELECT s.*, c.name as "courseName", u."firstName" as "trainerFirstName", u."lastName" as "trainerLastName"
      FROM sessions s
      LEFT JOIN courses c ON s."courseId" = c.id
      LEFT JOIN users u ON s."trainerId" = u.id
      ORDER BY s."scheduledAt" DESC
    `);

      client.release();

      res.json({
        success: true,
        sessions: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching all sessions:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Create session (trainer only)
router.post(
  "/",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        courseId,
        title,
        description,
        scheduledAt,
        duration,
        meetingLink,
      } = req.body;
      const trainerId = req.user!.id;

      const client = await pool.connect();

      const result = await client.query(
        `
      INSERT INTO sessions ("courseId", "trainerId", title, description, "scheduledAt", duration, "meetingLink", status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled', NOW(), NOW())
      RETURNING *
    `,
        [
          courseId,
          trainerId,
          title,
          description,
          scheduledAt,
          duration,
          meetingLink,
        ]
      );

      client.release();

      res.status(201).json({
        success: true,
        message: "Session created successfully",
        session: result.rows[0],
      });
    } catch (error) {
      logger.error("Error creating session:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update session (trainer only)
router.put(
  "/:id",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, scheduledAt, duration, meetingLink, status } =
        req.body;
      const trainerId = req.user!.id;

      const client = await pool.connect();

      // Check if session belongs to trainer
      const checkResult = await client.query(
        `
      SELECT "trainerId" FROM sessions WHERE id = $1
    `,
        [id]
      );

      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      if (checkResult.rows[0].trainerId !== trainerId) {
        client.release();
        return res.status(403).json({
          success: false,
          message: "You can only update your own sessions",
        });
      }

      const result = await client.query(
        `
      UPDATE sessions 
      SET title = $1, description = $2, "scheduledAt" = $3, duration = $4, 
          "meetingLink" = $5, status = $6, "updatedAt" = NOW()
      WHERE id = $7
      RETURNING *
    `,
        [title, description, scheduledAt, duration, meetingLink, status, id]
      );

      client.release();

      res.json({
        success: true,
        message: "Session updated successfully",
        session: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating session:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Delete session (trainer only)
router.delete(
  "/:id",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;

      const client = await pool.connect();

      // Check if session belongs to trainer
      const checkResult = await client.query(
        `
      SELECT "trainerId" FROM sessions WHERE id = $1
    `,
        [id]
      );

      if (checkResult.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Session not found",
        });
      }

      if (checkResult.rows[0].trainerId !== trainerId) {
        client.release();
        return res.status(403).json({
          success: false,
          message: "You can only delete your own sessions",
        });
      }

      const result = await client.query(
        `
      DELETE FROM sessions WHERE id = $1 RETURNING *
    `,
        [id]
      );

      client.release();

      res.json({
        success: true,
        message: "Session deleted successfully",
        session: result.rows[0],
      });
    } catch (error) {
      logger.error("Error deleting session:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

export default router;


