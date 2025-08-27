import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  requireUser,
  requireAdmin,
  requireTrainer,
} from "../middleware/auth";
import { AuthRequest } from "../types";
import { pool } from "../database/database";
import { courseAccessService } from "../services/CourseAccessService";

const router = Router();

// Validation middleware
const courseMaterialValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("fileType").trim().notEmpty().withMessage("File type is required"),
];

const assignmentValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
];

const quizValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
];

// Middleware to check course access
const checkCourseAccess = async (
  req: AuthRequest,
  res: Response,
  next: Function
) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const studentId = req.user!.id;

    const hasAccess = await courseAccessService.hasAccess(studentId, courseId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message:
          "You don't have access to this course. Please wait for admin approval.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking course access",
    });
  }
};

// ===== COURSE MATERIALS =====

// Get course materials (students only)
router.get(
  "/:courseId/materials",
  authenticateToken,
  requireUser,
  checkCourseAccess,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const client = await pool.connect();

      try {
        const result = await client.query(
          `SELECT * FROM course_materials 
            WHERE "courseId" = $1 
            ORDER BY "createdAt"`,
          [courseId]
        );

        res.json({
          success: true,
          data: { materials: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching course materials:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Add course material (admin/trainer only)
router.post(
  "/:courseId/materials",
  authenticateToken,
  requireTrainer,
  courseMaterialValidation,
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

      const courseId = parseInt(req.params.courseId);
      const {
        title,
        description,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        module,
      } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO course_materials (
             "courseId", title, description, "fileUrl", "fileType", "fileName", 
             "fileSize", module, "createdAt", "updatedAt"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [
            courseId,
            title,
            description,
            fileUrl,
            fileType,
            fileName,
            fileSize,
            module,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Course material added successfully",
          data: { material: result.rows[0] },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error adding course material:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// ===== ASSIGNMENTS =====

// Get course assignments (students only)
router.get(
  "/:courseId/assignments",
  authenticateToken,
  requireUser,
  checkCourseAccess,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = req.user!.id;
      const client = await pool.connect();

      try {
        // Get assignments with submission status
        const result = await client.query(
          `SELECT a.*, 
                   s.id as "submissionId", s.status as "submissionStatus", 
                   s.score, s."submittedAt"
            FROM assignments a
            LEFT JOIN assignment_submissions s ON a.id = s."assignmentId" AND s."studentId" = $2
            WHERE a."courseId" = $1 
            ORDER BY a."dueDate", a."createdAt"`,
          [courseId, studentId]
        );

        res.json({
          success: true,
          data: { assignments: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Add assignment (admin/trainer only)
router.post(
  "/:courseId/assignments",
  authenticateToken,
  requireTrainer,
  assignmentValidation,
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

      const courseId = parseInt(req.params.courseId);
      const {
        title,
        description,
        dueDate,
        maxScore,
        assignmentType,
        instructions,
        attachmentUrl,
        attachmentName,
      } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO assignments (
             "courseId", title, description, "dueDate", "maxScore", "assignmentType", 
             instructions, "attachmentUrl", "attachmentName", "createdAt", "updatedAt"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [
            courseId,
            title,
            description,
            dueDate,
            maxScore || 100,
            assignmentType || "individual",
            instructions,
            attachmentUrl,
            attachmentName,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Assignment added successfully",
          data: { assignment: result.rows[0] },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error adding assignment:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Submit assignment (students only)
router.post(
  "/assignments/:assignmentId/submit",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const studentId = req.user!.id;
      const { submissionText, fileUrl, fileName } = req.body;

      const client = await pool.connect();
      try {
        // Check if student has access to the course
        const assignmentResult = await client.query(
          `SELECT a."courseId" FROM assignments a
           JOIN registrations r ON a."courseId" = r."courseId"
           WHERE a.id = $1 AND r."userId" = $2 AND r.status = 'approved'`,
          [assignmentId, studentId]
        );

        if (assignmentResult.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: "You don't have access to this assignment",
          });
        }

        // Check if already submitted
        const existingSubmission = await client.query(
          `SELECT id FROM assignment_submissions 
           WHERE "assignmentId" = $1 AND "studentId" = $2`,
          [assignmentId, studentId]
        );

        if (existingSubmission.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: "You have already submitted this assignment",
          });
        }

        const result = await client.query(
          `INSERT INTO assignment_submissions (
            "assignmentId", "studentId", "submissionText", "fileUrl", "fileName", 
            "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [assignmentId, studentId, submissionText, fileUrl, fileName]
        );

        res.status(201).json({
          success: true,
          message: "Assignment submitted successfully",
          data: { submission: result.rows[0] },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// ===== QUIZZES =====

// Get course quizzes (students only)
router.get(
  "/:courseId/quizzes",
  authenticateToken,
  requireUser,
  checkCourseAccess,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = req.user!.id;
      const client = await pool.connect();

      try {
        // Get quizzes with attempt status
        const result = await client.query(
          `SELECT q.*, 
                   qa.id as "attemptId", qa.status as "attemptStatus", 
                   qa.score, qa."completedAt"
            FROM quizzes q
            LEFT JOIN quiz_attempts qa ON q.id = qa."quizId" AND qa."studentId" = $2
            WHERE q."courseId" = $1 
            ORDER BY q."createdAt"`,
          [courseId, studentId]
        );

        res.json({
          success: true,
          data: { quizzes: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Add quiz (admin/trainer only)
router.post(
  "/:courseId/quizzes",
  authenticateToken,
  requireTrainer,
  quizValidation,
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

      const courseId = parseInt(req.params.courseId);
      const {
        title,
        description,
        timeLimit,
        attemptsAllowed,
        isActive,
        totalQuestions,
        totalPoints,
      } = req.body;

      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO quizzes (
             "courseId", title, description, "timeLimit", "attemptsAllowed", "isActive", 
             "totalQuestions", "totalPoints", "createdAt", "updatedAt"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING *`,
          [
            courseId,
            title,
            description,
            timeLimit,
            attemptsAllowed || 1,
            isActive !== false,
            totalQuestions || 0,
            totalPoints || 100,
          ]
        );

        res.status(201).json({
          success: true,
          message: "Quiz added successfully",
          data: { quiz: result.rows[0] },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error adding quiz:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get quiz questions (students only)
router.get(
  "/quizzes/:quizId/questions",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const studentId = req.user!.id;
      const client = await pool.connect();

      try {
        // Check if student has access to the quiz
        const accessResult = await client.query(
          `SELECT q.id FROM quizzes q
           JOIN registrations r ON q."courseId" = r."courseId"
           WHERE q.id = $1 AND r."userId" = $2 AND r.status = 'approved'`,
          [quizId, studentId]
        );

        if (accessResult.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: "You don't have access to this quiz",
          });
        }

        const result = await client.query(
          `SELECT id, question, "questionType", options, "correctAnswer", points, "order"
            FROM quiz_questions 
            WHERE "quizId" = $1 
            ORDER BY "order"`,
          [quizId]
        );

        res.json({
          success: true,
          data: { questions: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Submit quiz attempt (students only)
router.post(
  "/quizzes/:quizId/attempt",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const quizId = parseInt(req.params.quizId);
      const studentId = req.user!.id;
      const { answers } = req.body;

      const client = await pool.connect();
      try {
        // Check if student has access to the quiz
        const accessResult = await client.query(
          `SELECT q.id, q."attemptsAllowed" FROM quizzes q
            JOIN registrations r ON q."courseId" = r."courseId"
            WHERE q.id = $1 AND r."userId" = $2 AND r.status = 'approved'`,
          [quizId, studentId]
        );

        if (accessResult.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: "You don't have access to this quiz",
          });
        }

        const maxAttempts = accessResult.rows[0].attemptsAllowed;

        // Check if student has exceeded max attempts
        const attemptsResult = await client.query(
          `SELECT COUNT(*) as count FROM quiz_attempts 
           WHERE "quizId" = $1 AND "studentId" = $2`,
          [quizId, studentId]
        );

        if (parseInt(attemptsResult.rows[0].count) >= maxAttempts) {
          return res.status(400).json({
            success: false,
            message: `You have exceeded the maximum attempts (${maxAttempts}) for this quiz`,
          });
        }

        const result = await client.query(
          `INSERT INTO quiz_attempts (
            "quizId", "studentId", answers, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [quizId, studentId, answers ? JSON.stringify(answers) : null]
        );

        res.status(201).json({
          success: true,
          message: "Quiz attempt started successfully",
          data: { attempt: result.rows[0] },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error starting quiz attempt:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// ===== STUDENT PROGRESS =====

// Get student progress for a course
router.get(
  "/:courseId/progress",
  authenticateToken,
  requireUser,
  checkCourseAccess,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = req.user!.id;
      const client = await pool.connect();

      try {
        const result = await client.query(
          `SELECT * FROM student_progress 
           WHERE "studentId" = $1 AND "courseId" = $2
           ORDER BY "createdAt"`,
          [studentId, courseId]
        );

        res.json({
          success: true,
          data: { progress: result.rows },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update student progress
router.post(
  "/:courseId/progress",
  authenticateToken,
  requireUser,
  checkCourseAccess,
  async (req: AuthRequest, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = req.user!.id;
      const { materialId, assignmentId, quizId, status, timeSpent } = req.body;

      const client = await pool.connect();
      try {
        // Check if progress record exists
        const existingResult = await client.query(
          `SELECT id FROM student_progress 
           WHERE "studentId" = $1 AND "courseId" = $2 AND 
                 ("materialId" = $3 OR "assignmentId" = $4 OR "quizId" = $5)`,
          [studentId, courseId, materialId, assignmentId, quizId]
        );

        if (existingResult.rows.length > 0) {
          // Update existing progress
          await client.query(
            `UPDATE student_progress 
             SET status = $1, "timeSpent" = $2, "completedAt" = $3, "updatedAt" = CURRENT_TIMESTAMP
             WHERE "studentId" = $4 AND "courseId" = $5 AND 
                   ("materialId" = $6 OR "assignmentId" = $7 OR "quizId" = $8)`,
            [
              status,
              timeSpent,
              status === "completed" ? new Date() : null,
              studentId,
              courseId,
              materialId,
              assignmentId,
              quizId,
            ]
          );
        } else {
          // Create new progress record
          await client.query(
            `INSERT INTO student_progress (
              "studentId", "courseId", "materialId", "assignmentId", "quizId", 
              status, "timeSpent", "completedAt", "createdAt", "updatedAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              studentId,
              courseId,
              materialId,
              assignmentId,
              quizId,
              status,
              timeSpent,
              status === "completed" ? new Date() : null,
            ]
          );
        }

        res.json({
          success: true,
          message: "Progress updated successfully",
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error updating student progress:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

export default router;
