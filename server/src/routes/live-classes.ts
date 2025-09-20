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
  CreateLiveClassRequest,
  UpdateLiveClassRequest,
  LiveClass,
  LiveClassParticipant,
} from "../types/enhanced-learning";

const router = express.Router();

// Validation middleware
const createLiveClassValidation = [
  body("courseId").isInt({ min: 1 }).withMessage("Valid course ID is required"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required (max 255 characters)"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description too long"),
  body("scheduledDate")
    .isISO8601()
    .withMessage("Valid scheduled date is required"),
  body("durationMinutes")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be between 15-480 minutes"),
  body("maxParticipants")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Max participants must be 1-1000"),
  body("meetingUrl")
    .optional()
    .isURL()
    .withMessage("Valid meeting URL required"),
  body("meetingId")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Meeting ID too long"),
  body("meetingPassword")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Meeting password too long"),
];

const updateLiveClassValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title too long"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description too long"),
  body("scheduledDate")
    .optional()
    .isISO8601()
    .withMessage("Valid scheduled date required"),
  body("durationMinutes")
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage("Duration must be 15-480 minutes"),
  body("maxParticipants")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Max participants must be 1-1000"),
  body("meetingUrl")
    .optional()
    .isURL()
    .withMessage("Valid meeting URL required"),
  body("meetingId")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Meeting ID too long"),
  body("meetingPassword")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Meeting password too long"),
  body("status")
    .optional()
    .isIn(["scheduled", "live", "completed", "cancelled"])
    .withMessage("Invalid status"),
  body("recordingUrl")
    .optional()
    .isURL()
    .withMessage("Valid recording URL required"),
];

// Create live class (trainer only)
router.post(
  "/",
  authenticateToken,
  requireTrainer,
  createLiveClassValidation,
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
        title,
        description,
        scheduledDate,
        durationMinutes = 60,
        maxParticipants = 100,
        meetingUrl,
        meetingId,
        meetingPassword,
      }: CreateLiveClassRequest = req.body;

      const client = await pool.connect();

      try {
        // Verify trainer owns this course
        const courseCheck = await client.query(
          'SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2',
          [courseId, trainerId]
        );

        if (courseCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found or access denied",
          });
        }

        // Create live class
        const result = await client.query(
          `INSERT INTO live_classes (
            course_id, title, description, scheduled_date, duration_minutes,
            max_participants, meeting_url, meeting_id, meeting_password, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            courseId,
            title,
            description || null,
            scheduledDate,
            durationMinutes,
            maxParticipants,
            meetingUrl || null,
            meetingId || null,
            meetingPassword || null,
            trainerId,
          ]
        );

        const liveClass = result.rows[0];

        logger.info(
          `Live class created: ${liveClass.id} by trainer ${trainerId}`
        );

        res.status(201).json({
          success: true,
          message: "Live class created successfully",
          data: {
            id: liveClass.id,
            courseId: liveClass.course_id,
            title: liveClass.title,
            description: liveClass.description,
            scheduledDate: liveClass.scheduled_date,
            durationMinutes: liveClass.duration_minutes,
            maxParticipants: liveClass.max_participants,
            meetingUrl: liveClass.meeting_url,
            meetingId: liveClass.meeting_id,
            status: liveClass.status,
            createdAt: liveClass.created_at,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error creating live class:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get live classes for a course (trainer and students)
router.get(
  "/course/:courseId",
  authenticateToken,
  requireUser,
  [
    param("courseId").isInt({ min: 1 }).withMessage("Valid course ID required"),
    query("status")
      .optional()
      .isIn(["scheduled", "live", "completed", "cancelled"])
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
      const { status } = req.query;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const client = await pool.connect();

      try {
        // Check if user has access to this course
        let accessCheck;
        if (userRole === "trainer") {
          accessCheck = await client.query(
            'SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2',
            [courseId, userId]
          );
        } else {
          accessCheck = await client.query(
            'SELECT r.id FROM registrations r WHERE r."courseId" = $1 AND r."userId" = $2 AND r.status = $3',
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
          SELECT lc.*, u."firstName" as creator_first_name, u."lastName" as creator_last_name
          FROM live_classes lc
          JOIN users u ON lc.created_by = u.id
          WHERE lc.course_id = $1
        `;
        const params = [courseId];

        if (status) {
          query += ` AND lc.status = $2`;
          params.push(status as string);
        }

        query += ` ORDER BY lc.scheduled_date ASC`;

        const result = await client.query(query, params);

        const liveClasses = result.rows.map((row) => ({
          id: row.id,
          courseId: row.course_id,
          title: row.title,
          description: row.description,
          scheduledDate: row.scheduled_date,
          durationMinutes: row.duration_minutes,
          maxParticipants: row.max_participants,
          meetingUrl: row.meeting_url,
          meetingId: row.meeting_id,
          status: row.status,
          recordingUrl: row.recording_url,
          createdBy: row.created_by,
          creatorName: `${row.creator_first_name} ${row.creator_last_name}`,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        res.json({
          success: true,
          data: liveClasses,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error fetching live classes:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get single live class
router.get(
  "/:id",
  authenticateToken,
  requireUser,
  [param("id").isInt({ min: 1 }).withMessage("Valid live class ID required")],
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
        // Get live class with access check
        let query = `
          SELECT lc.*, u."firstName" as creator_first_name, u."lastName" as creator_last_name,
                 c.name as course_name
          FROM live_classes lc
          JOIN users u ON lc.created_by = u.id
          JOIN courses c ON lc.course_id = c.id
          WHERE lc.id = $1
        `;

        if (userRole === "trainer") {
          query += ` AND c."instructorId" = $2`;
        } else {
          query += ` AND EXISTS (
            SELECT 1 FROM registrations r 
            WHERE r."courseId" = lc.course_id 
            AND r."userId" = $2 
            AND r.status = 'approved'
          )`;
        }

        const result = await client.query(query, [id, userId]);

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Live class not found or access denied",
          });
        }

        const liveClass = result.rows[0];

        // Get participants if user is trainer
        let participants: any[] = [];
        if (userRole === "trainer") {
          const participantsResult = await client.query(
            `SELECT lcp.*, u."firstName", u."lastName", u.email
             FROM live_class_participants lcp
             JOIN users u ON lcp.student_id = u.id
             WHERE lcp.class_id = $1
             ORDER BY lcp.joined_at ASC`,
            [id]
          );

          participants = participantsResult.rows.map((row) => ({
            id: row.id,
            studentId: row.student_id,
            studentName: `${row.first_name} ${row.last_name}`,
            studentEmail: row.email,
            joinedAt: row.joined_at,
            leftAt: row.left_at,
            attendanceDuration: row.attendance_duration,
          }));
        }

        res.json({
          success: true,
          data: {
            id: liveClass.id,
            courseId: liveClass.course_id,
            courseName: liveClass.course_name,
            title: liveClass.title,
            description: liveClass.description,
            scheduledDate: liveClass.scheduled_date,
            durationMinutes: liveClass.duration_minutes,
            maxParticipants: liveClass.max_participants,
            meetingUrl: liveClass.meeting_url,
            meetingId: liveClass.meeting_id,
            meetingPassword: liveClass.meeting_password,
            status: liveClass.status,
            recordingUrl: liveClass.recording_url,
            createdBy: liveClass.created_by,
            creatorName: `${liveClass.creator_first_name} ${liveClass.creator_last_name}`,
            participants,
            createdAt: liveClass.created_at,
            updatedAt: liveClass.updated_at,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error fetching live class:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Update live class (trainer only)
router.put(
  "/:id",
  authenticateToken,
  requireTrainer,
  [
    param("id").isInt({ min: 1 }).withMessage("Valid live class ID required"),
    ...updateLiveClassValidation,
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
      const updateData: UpdateLiveClassRequest = req.body;

      const client = await pool.connect();

      try {
        // Verify trainer owns this live class
        const ownershipCheck = await client.query(
          `SELECT lc.id FROM live_classes lc
           JOIN courses c ON lc.course_id = c.id
           WHERE lc.id = $1 AND c."instructorId" = $2`,
          [id, trainerId]
        );

        if (ownershipCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Live class not found or access denied",
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
          UPDATE live_classes 
          SET ${updateFields.join(", ")}
          WHERE id = $${paramCount}
          RETURNING *
        `;

        const result = await client.query(query, values);
        const updatedClass = result.rows[0];

        logger.info(`Live class updated: ${id} by trainer ${trainerId}`);

        res.json({
          success: true,
          message: "Live class updated successfully",
          data: {
            id: updatedClass.id,
            courseId: updatedClass.course_id,
            title: updatedClass.title,
            description: updatedClass.description,
            scheduledDate: updatedClass.scheduled_date,
            durationMinutes: updatedClass.duration_minutes,
            maxParticipants: updatedClass.max_participants,
            meetingUrl: updatedClass.meeting_url,
            meetingId: updatedClass.meeting_id,
            status: updatedClass.status,
            recordingUrl: updatedClass.recording_url,
            updatedAt: updatedClass.updated_at,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error updating live class:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Join live class (student only)
router.post(
  "/:id/join",
  authenticateToken,
  requireUser,
  [param("id").isInt({ min: 1 }).withMessage("Valid live class ID required")],
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
      const studentId = req.user!.id;

      const client = await pool.connect();

      try {
        // Check if student is enrolled in the course
        const enrollmentCheck = await client.query(
          `SELECT r.id FROM registrations r
           JOIN live_classes lc ON r."courseId" = lc.course_id
           WHERE lc.id = $1 AND r."userId" = $2 AND r.status = 'approved'`,
          [id, studentId]
        );

        if (enrollmentCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message:
              "You must be enrolled in this course to join the live class",
          });
        }

        // Check if class is scheduled and not full
        const classCheck = await client.query(
          `SELECT lc.*, 
           (SELECT COUNT(*) FROM live_class_participants WHERE class_id = lc.id) as current_participants
           FROM live_classes lc
           WHERE lc.id = $1 AND lc.status = 'scheduled'`,
          [id]
        );

        if (classCheck.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Live class not found or not available",
          });
        }

        const liveClass = classCheck.rows[0];
        if (liveClass.current_participants >= liveClass.max_participants) {
          return res.status(400).json({
            success: false,
            message: "Live class is full",
          });
        }

        // Check if already joined
        const existingJoin = await client.query(
          "SELECT id FROM live_class_participants WHERE class_id = $1 AND student_id = $2",
          [id, studentId]
        );

        if (existingJoin.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: "You have already joined this live class",
          });
        }

        // Add participant
        await client.query(
          `INSERT INTO live_class_participants (class_id, student_id, joined_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)`,
          [id, studentId]
        );

        logger.info(`Student ${studentId} joined live class ${id}`);

        res.json({
          success: true,
          message: "Successfully joined live class",
          data: {
            meetingUrl: liveClass.meeting_url,
            meetingId: liveClass.meeting_id,
            meetingPassword: liveClass.meeting_password,
          },
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error joining live class:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Leave live class (student only)
router.post(
  "/:id/leave",
  authenticateToken,
  requireUser,
  [param("id").isInt({ min: 1 }).withMessage("Valid live class ID required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const studentId = req.user!.id;

      const client = await pool.connect();

      try {
        // Update participant record
        const result = await client.query(
          `UPDATE live_class_participants 
           SET left_at = CURRENT_TIMESTAMP,
               attendance_duration = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at)) / 60
           WHERE class_id = $1 AND student_id = $2 AND left_at IS NULL
           RETURNING *`,
          [id, studentId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "You are not currently in this live class",
          });
        }

        logger.info(`Student ${studentId} left live class ${id}`);

        res.json({
          success: true,
          message: "Successfully left live class",
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error leaving live class:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Delete live class (trainer only)
router.delete(
  "/:id",
  authenticateToken,
  requireTrainer,
  [param("id").isInt({ min: 1 }).withMessage("Valid live class ID required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;

      const client = await pool.connect();

      try {
        // Verify trainer owns this live class
        const ownershipCheck = await client.query(
          `SELECT lc.id FROM live_classes lc
           JOIN courses c ON lc.course_id = c.id
           WHERE lc.id = $1 AND c."instructorId" = $2`,
          [id, trainerId]
        );

        if (ownershipCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Live class not found or access denied",
          });
        }

        // Delete live class (participants will be deleted by CASCADE)
        await client.query("DELETE FROM live_classes WHERE id = $1", [id]);

        logger.info(`Live class deleted: ${id} by trainer ${trainerId}`);

        res.json({
          success: true,
          message: "Live class deleted successfully",
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error deleting live class:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;
