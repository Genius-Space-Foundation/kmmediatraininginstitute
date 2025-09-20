import express, { Request, Response } from "express";
import { param } from "express-validator";
import { pool } from "../database/database";
import { authenticateToken, requireUser } from "../middleware/auth";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

const router = express.Router();

// Get learning stats for a course
router.get(
  "/:courseId",
  authenticateToken,
  requireUser,
  [param("courseId").isInt({ min: 1 }).withMessage("Valid course ID required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
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

        // Get learning progress
        const progressResult = await client.query(
          `SELECT 
            COALESCE(progress_percentage, 0) as progress_percentage,
            COALESCE(total_hours_studied, 0) as total_hours_studied,
            COALESCE(array_length(completed_modules, 1), 0) as completed_modules,
            COALESCE(array_length(learning_goals, 1), 0) as total_modules
          FROM learning_progress 
          WHERE student_id = $1 AND course_id = $2`,
          [userId, courseId]
        );

        // Get upcoming live classes
        const upcomingClassesResult = await client.query(
          `SELECT COUNT(*) as count
          FROM live_classes lc
          WHERE lc.course_id = $1 
          AND lc.status = 'scheduled' 
          AND lc.scheduled_date > CURRENT_TIMESTAMP`,
          [courseId]
        );

        // Get pending catchup sessions
        const pendingSessionsResult = await client.query(
          `SELECT COUNT(*) as count
          FROM catchup_sessions cs
          WHERE cs.course_id = $1 
          AND cs.student_id = $2
          AND cs.status = 'scheduled'`,
          [courseId, userId]
        );

        // Get assignment stats
        const assignmentsResult = await client.query(
          `SELECT 
            COUNT(*) as total_assignments,
            COUNT(CASE WHEN sa.status = 'submitted' OR sa.status = 'graded' THEN 1 END) as completed_assignments,
            AVG(CASE WHEN sa.grade IS NOT NULL THEN sa.grade END) as average_grade
          FROM assignments a
          LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = $2
          WHERE a.course_id = $1`,
          [courseId, userId]
        );

        const progress = progressResult.rows[0] || {
          progress_percentage: 0,
          total_hours_studied: 0,
          completed_modules: 0,
          total_modules: 0,
        };

        const upcomingClasses = parseInt(
          upcomingClassesResult.rows[0]?.count || "0"
        );
        const pendingSessions = parseInt(
          pendingSessionsResult.rows[0]?.count || "0"
        );
        const assignmentStats = assignmentsResult.rows[0] || {
          total_assignments: 0,
          completed_assignments: 0,
          average_grade: 0,
        };

        const stats = {
          totalHoursStudied: parseInt(progress.total_hours_studied) || 0,
          completedModules: parseInt(progress.completed_modules) || 0,
          totalModules: parseInt(progress.total_modules) || 10, // Default to 10 if no modules defined
          averageGrade: Math.round(
            parseFloat(assignmentStats.average_grade) || 0
          ),
          upcomingClasses,
          pendingSessions,
          completedAssignments:
            parseInt(assignmentStats.completed_assignments) || 0,
          totalAssignments: parseInt(assignmentStats.total_assignments) || 0,
        };

        res.json({
          success: true,
          data: stats,
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error fetching learning stats:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Update learning progress
router.put(
  "/:courseId/progress",
  authenticateToken,
  requireUser,
  [param("courseId").isInt({ min: 1 }).withMessage("Valid course ID required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.id;
      const {
        progressPercentage,
        totalHoursStudied,
        currentModule,
        completedModules,
        learningGoals,
        achievements,
      } = req.body;

      const client = await pool.connect();

      try {
        // Check if user has access to this course
        const accessCheck = await client.query(
          'SELECT id FROM registrations WHERE "courseId" = $1 AND "userId" = $2 AND status = $3',
          [courseId, userId, "approved"]
        );

        if (accessCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found or access denied",
          });
        }

        // Upsert learning progress
        const result = await client.query(
          `INSERT INTO learning_progress (
            student_id, course_id, progress_percentage, total_hours_studied,
            current_module, completed_modules, learning_goals, achievements,
            last_activity_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (student_id, course_id)
          DO UPDATE SET
            progress_percentage = EXCLUDED.progress_percentage,
            total_hours_studied = EXCLUDED.total_hours_studied,
            current_module = EXCLUDED.current_module,
            completed_modules = EXCLUDED.completed_modules,
            learning_goals = EXCLUDED.learning_goals,
            achievements = EXCLUDED.achievements,
            last_activity_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *`,
          [
            userId,
            courseId,
            progressPercentage || 0,
            totalHoursStudied || 0,
            currentModule || null,
            completedModules || [],
            learningGoals || [],
            achievements || [],
          ]
        );

        logger.info(
          `Learning progress updated for student ${userId} in course ${courseId}`
        );

        res.json({
          success: true,
          message: "Learning progress updated successfully",
          data: result.rows[0],
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error updating learning progress:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Record study session
router.post(
  "/:courseId/study-session",
  authenticateToken,
  requireUser,
  [param("courseId").isInt({ min: 1 }).withMessage("Valid course ID required")],
  async (req: AuthRequest, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.user!.id;
      const {
        sessionType = "self_study",
        startTime,
        endTime,
        topicsCovered = [],
        materialsUsed = [],
        notes,
        satisfactionRating,
      } = req.body;

      const client = await pool.connect();

      try {
        // Check if user has access to this course
        const accessCheck = await client.query(
          'SELECT id FROM registrations WHERE "courseId" = $1 AND "userId" = $2 AND status = $3',
          [courseId, userId, "approved"]
        );

        if (accessCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found or access denied",
          });
        }

        // Calculate duration
        const durationMinutes = endTime
          ? Math.round(
              (new Date(endTime).getTime() - new Date(startTime).getTime()) /
                (1000 * 60)
            )
          : null;

        // Insert study session
        const result = await client.query(
          `INSERT INTO study_sessions (
            student_id, course_id, session_type, start_time, end_time,
            duration_minutes, topics_covered, materials_used, notes, satisfaction_rating
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            userId,
            courseId,
            sessionType,
            startTime,
            endTime || null,
            durationMinutes,
            topicsCovered,
            materialsUsed,
            notes || null,
            satisfactionRating || null,
          ]
        );

        // Update total hours studied in learning progress
        if (durationMinutes) {
          await client.query(
            `INSERT INTO learning_progress (student_id, course_id, total_hours_studied, last_activity_date)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (student_id, course_id)
             DO UPDATE SET
               total_hours_studied = learning_progress.total_hours_studied + $3,
               last_activity_date = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP`,
            [userId, courseId, Math.round(durationMinutes / 60)]
          );
        }

        logger.info(
          `Study session recorded for student ${userId} in course ${courseId}`
        );

        res.json({
          success: true,
          message: "Study session recorded successfully",
          data: result.rows[0],
        });
      } finally {
        client.release();
      }
    } catch (error: any) {
      logger.error("Error recording study session:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;











