import express, { Request, Response } from "express";
import { body, validationResult, param, query } from "express-validator";
import { pool } from "../database/database";
import {
  authenticateToken,
  requireTrainer,
  requireUser,
} from "../middleware/auth";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";
import {
  CreateCatchupSessionRequest,
  UpdateCatchupSessionRequest,
  CatchupSession,
} from "../types/enhanced-learning";

const router = express.Router();

// Validation middleware
const createCatchupSessionValidation = [
  body("courseId").isInt({ min: 1 }).withMessage("Valid course ID is required"),
  body("studentId")
    .isInt({ min: 1 })
    .withMessage("Valid student ID is required"),
  body("mentorId").isInt({ min: 1 }).withMessage("Valid mentor ID is required"),
  body("sessionDate").isISO8601().withMessage("Valid session date is required"),
  body("sessionType")
    .optional()
    .isIn(["weekly_review", "one_on_one", "group", "emergency"])
    .withMessage("Invalid session type"),
  body("topicsCovered")
    .optional()
    .isArray()
    .withMessage("Topics covered must be an array"),
  body("studentConcerns")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Student concerns too long"),
  body("actionItems")
    .optional()
    .isArray()
    .withMessage("Action items must be an array"),
  body("nextSessionDate")
    .optional()
    .isISO8601()
    .withMessage("Valid next session date required"),
];

const updateCatchupSessionValidation = [
  body("sessionDate")
    .optional()
    .isISO8601()
    .withMessage("Valid session date required"),
  body("sessionType")
    .optional()
    .isIn(["weekly_review", "one_on_one", "group", "emergency"])
    .withMessage("Invalid session type"),
  body("topicsCovered")
    .optional()
    .isArray()
    .withMessage("Topics covered must be an array"),
  body("studentConcerns")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Student concerns too long"),
  body("mentorFeedback")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Mentor feedback too long"),
  body("actionItems")
    .optional()
    .isArray()
    .withMessage("Action items must be an array"),
  body("nextSessionDate")
    .optional()
    .isISO8601()
    .withMessage("Valid next session date required"),
  body("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
    .withMessage("Invalid status"),
  body("studentSatisfaction")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Student satisfaction must be 1-5"),
  body("mentorRating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Mentor rating must be 1-5"),
];

// Create catchup session (trainer only)
router.post(
  "/",
  authenticateToken,
  requireTrainer,
  createCatchupSessionValidation,
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

      const trainerId = req.user!.id;
      const {
        courseId,
        studentId,
        mentorId,
        sessionDate,
        sessionType = "weekly_review",
        topicsCovered = [],
        studentConcerns,
        actionItems = [],
        nextSessionDate,
      }: CreateCatchupSessionRequest = req.body;

      const client = await pool.connect();

      try {
        // Verify trainer has access to this course and student
        const accessCheck = await client.query(
          `SELECT c.id FROM courses c
           JOIN registrations r ON c.id = r."courseId"
           WHERE c.id = $1 AND c."instructorId" = $2 AND r."userId" = $3 AND r.status = 'approved'`,
          [courseId, trainerId, studentId]
        );

        if (accessCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course, student, or access not found",
          });
        }

        // Verify mentor exists and is a trainer
        const mentorCheck = await client.query(
          "SELECT id FROM users WHERE id = $1 AND role = $2",
          [mentorId, "trainer"]
        );

        if (mentorCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid mentor ID or mentor not found",
          });
        }

        // Create catchup session
        const result = await client.query(
          `INSERT INTO catchup_sessions (
            course_id, student_id, mentor_id, session_date, session_type,
            topics_covered, student_concerns, action_items, next_session_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            courseId,
            studentId,
            mentorId,
            sessionDate,
            sessionType,
            topicsCovered,
            studentConcerns || null,
            actionItems,
            nextSessionDate || null,
          ]
        );

        const session = result.rows[0];

        logger.info(
          `Catchup session created: ${session.id} by trainer ${trainerId}`
        );

        res.status(201).json({
          success: true,
          message: "Catchup session created successfully",
          data: {
            id: session.id,
            courseId: session.course_id,
            studentId: session.student_id,
            mentorId: session.mentor_id,
            sessionDate: session.session_date,
            sessionType: session.session_type,
            topicsCovered: session.topics_covered,
            studentConcerns: session.student_concerns,
            actionItems: session.action_items,
            nextSessionDate: session.next_session_date,
            status: session.status,
            createdAt: session.created_at,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error creating catchup session:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get catchup sessions for a course (trainer and students)
router.get(
  "/course/:courseId",
  authenticateToken,
  requireUser,
  [
    param("courseId").isInt({ min: 1 }).withMessage("Valid course ID required"),
    query("studentId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid student ID required"),
    query("status")
      .optional()
      .isIn(["scheduled", "completed", "cancelled", "rescheduled"])
      .withMessage("Invalid status"),
  ],
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

      const { courseId } = req.params;
      const { studentId, status } = req.query;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const client = await pool.connect();

      try {
        // Check access
        let accessCheck;
        if (userRole === "trainer") {
          accessCheck = await client.query(
            'SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2',
            [courseId, userId]
          );
        } else {
          accessCheck = await client.query(
            'SELECT id FROM registrations WHERE "courseId" = $1 AND "userId" = $2 AND status = $3',
            [courseId, userId, "approved"]
          );
        }

        if (accessCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found or access denied",
          });
        }

        // Build query
        let query = `
          SELECT cs.*, 
                 s."firstName" as student_first_name, s."lastName" as student_last_name,
                 m."firstName" as mentor_first_name, m."lastName" as mentor_last_name
          FROM catchup_sessions cs
          JOIN users s ON cs.student_id = s.id
          JOIN users m ON cs.mentor_id = m.id
          WHERE cs.course_id = $1
        `;
        const params = [courseId];

        if (studentId) {
          query += ` AND cs.student_id = $2`;
          params.push(studentId as string);
        }

        if (status) {
          const paramIndex = params.length + 1;
          query += ` AND cs.status = $${paramIndex}`;
          params.push(status as string);
        }

        // Students can only see their own sessions
        if (userRole === "user") {
          const paramIndex = params.length + 1;
          query += ` AND cs.student_id = $${paramIndex}`;
          params.push(userId.toString());
        }

        query += ` ORDER BY cs.session_date DESC`;

        const result = await client.query(query, params);

        const sessions = result.rows.map((row) => ({
          id: row.id,
          courseId: row.course_id,
          studentId: row.student_id,
          studentName: `${row.student_first_name} ${row.student_last_name}`,
          mentorId: row.mentor_id,
          mentorName: `${row.mentor_first_name} ${row.mentor_last_name}`,
          sessionDate: row.session_date,
          sessionType: row.session_type,
          topicsCovered: row.topics_covered,
          studentConcerns: row.student_concerns,
          mentorFeedback: row.mentor_feedback,
          actionItems: row.action_items,
          nextSessionDate: row.next_session_date,
          status: row.status,
          studentSatisfaction: row.student_satisfaction,
          mentorRating: row.mentor_rating,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        res.json({
          success: true,
          data: sessions,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error fetching catchup sessions:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get single catchup session
router.get(
  "/:id",
  authenticateToken,
  requireUser,
  [param("id").isInt({ min: 1 }).withMessage("Valid session ID required")],
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

      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const client = await pool.connect();

      try {
        // Get session with access check
        let query = `
          SELECT cs.*, 
                 s."firstName" as student_first_name, s."lastName" as student_last_name,
                 m."firstName" as mentor_first_name, m."lastName" as mentor_last_name,
                 c.name as course_name
          FROM catchup_sessions cs
          JOIN users s ON cs.student_id = s.id
          JOIN users m ON cs.mentor_id = m.id
          JOIN courses c ON cs.course_id = c.id
          WHERE cs.id = $1
        `;

        if (userRole === "trainer") {
          query += ` AND c."instructorId" = $2`;
        } else {
          query += ` AND cs.student_id = $2`;
        }

        const result = await client.query(query, [id, userId]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Catchup session not found or access denied",
          });
        }

        const session = result.rows[0];

        res.json({
          success: true,
          data: {
            id: session.id,
            courseId: session.course_id,
            courseName: session.course_name,
            studentId: session.student_id,
            studentName: `${session.student_first_name} ${session.student_last_name}`,
            mentorId: session.mentor_id,
            mentorName: `${session.mentor_first_name} ${session.mentor_last_name}`,
            sessionDate: session.session_date,
            sessionType: session.session_type,
            topicsCovered: session.topics_covered,
            studentConcerns: session.student_concerns,
            mentorFeedback: session.mentor_feedback,
            actionItems: session.action_items,
            nextSessionDate: session.next_session_date,
            status: session.status,
            studentSatisfaction: session.student_satisfaction,
            mentorRating: session.mentor_rating,
            createdAt: session.created_at,
            updatedAt: session.updated_at,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error fetching catchup session:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Update catchup session (trainer only)
router.put(
  "/:id",
  authenticateToken,
  requireTrainer,
  [
    param("id").isInt({ min: 1 }).withMessage("Valid session ID required"),
    ...updateCatchupSessionValidation,
  ],
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

      const { id } = req.params;
      const trainerId = req.user!.id;
      const updateData: UpdateCatchupSessionRequest = req.body;

      const client = await pool.connect();

      try {
        // Verify trainer has access to this session
        const accessCheck = await client.query(
          `SELECT cs.id FROM catchup_sessions cs
           JOIN courses c ON cs.course_id = c.id
           WHERE cs.id = $1 AND c."instructorId" = $2`,
          [id, trainerId]
        );

        if (accessCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Catchup session not found or access denied",
          });
        }

        // Build update query dynamically
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined) {
            const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
            updateFields.push(`${dbKey} = $${paramCount}`);
            values.push(value);
            paramCount++;
          }
        });

        if (updateFields.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No valid fields to update",
          });
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
          UPDATE catchup_sessions 
          SET ${updateFields.join(", ")}
          WHERE id = $${paramCount}
          RETURNING *
        `;

        const result = await client.query(query, values);
        const updatedSession = result.rows[0];

        logger.info(`Catchup session updated: ${id} by trainer ${trainerId}`);

        res.json({
          success: true,
          message: "Catchup session updated successfully",
          data: {
            id: updatedSession.id,
            courseId: updatedSession.course_id,
            studentId: updatedSession.student_id,
            mentorId: updatedSession.mentor_id,
            sessionDate: updatedSession.session_date,
            sessionType: updatedSession.session_type,
            topicsCovered: updatedSession.topics_covered,
            studentConcerns: updatedSession.student_concerns,
            mentorFeedback: updatedSession.mentor_feedback,
            actionItems: updatedSession.action_items,
            nextSessionDate: updatedSession.next_session_date,
            status: updatedSession.status,
            studentSatisfaction: updatedSession.student_satisfaction,
            mentorRating: updatedSession.mentor_rating,
            updatedAt: updatedSession.updated_at,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error updating catchup session:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Delete catchup session (trainer only)
router.delete(
  "/:id",
  authenticateToken,
  requireTrainer,
  [param("id").isInt({ min: 1 }).withMessage("Valid session ID required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;

      const client = await pool.connect();

      try {
        // Verify trainer has access to this session
        const accessCheck = await client.query(
          `SELECT cs.id FROM catchup_sessions cs
           JOIN courses c ON cs.course_id = c.id
           WHERE cs.id = $1 AND c."instructorId" = $2`,
          [id, trainerId]
        );

        if (accessCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Catchup session not found or access denied",
          });
        }

        // Delete session
        await client.query("DELETE FROM catchup_sessions WHERE id = $1", [id]);

        logger.info(`Catchup session deleted: ${id} by trainer ${trainerId}`);

        res.json({
          success: true,
          message: "Catchup session deleted successfully",
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error deleting catchup session:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get upcoming catchup sessions for student
router.get(
  "/student/upcoming",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const studentId = req.user!.id;

      const client = await pool.connect();

      try {
        const result = await client.query(
          `SELECT cs.*, 
                 m."firstName" as mentor_first_name, m."lastName" as mentor_last_name,
                 c.name as course_name
          FROM catchup_sessions cs
          JOIN users m ON cs.mentor_id = m.id
          JOIN courses c ON cs.course_id = c.id
          WHERE cs.student_id = $1 
          AND cs.status = 'scheduled'
          AND cs.session_date > CURRENT_TIMESTAMP
          ORDER BY cs.session_date ASC
          LIMIT 10`,
          [studentId]
        );

        const sessions = result.rows.map((row) => ({
          id: row.id,
          courseId: row.course_id,
          courseName: row.course_name,
          mentorId: row.mentor_id,
          mentorName: `${row.mentor_first_name} ${row.mentor_last_name}`,
          sessionDate: row.session_date,
          sessionType: row.session_type,
          topicsCovered: row.topics_covered,
          actionItems: row.action_items,
          nextSessionDate: row.next_session_date,
        }));

        res.json({
          success: true,
          data: sessions,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error fetching upcoming catchup sessions:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;











