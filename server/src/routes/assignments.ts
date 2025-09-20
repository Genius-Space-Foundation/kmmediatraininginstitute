import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest } from "../types";
import { firestoreAssignmentService } from "../services/FirestoreAssignmentService";
import { body, validationResult } from "express-validator";

const router = Router();

// Create a new assignment (trainer only)
router.post(
  "/",
  authenticateToken,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("course_id").notEmpty().withMessage("Course ID is required"),
    body("max_points")
      .isInt({ min: 1, max: 1000 })
      .withMessage("Max points must be between 1 and 1000"),
    body("assignment_type")
      .trim()
      .notEmpty()
      .withMessage("Assignment type is required"),
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      if (
        !req.user ||
        (req.user.role !== "trainer" && req.user.role !== "admin")
      ) {
        return res.status(403).json({
          success: false,
          message: "Only trainers and admins can create assignments",
        });
      }

      const assignmentData = {
        course_id: req.body.course_id,
        title: req.body.title,
        description: req.body.description,
        instructions: req.body.instructions,
        due_date: req.body.due_date,
        max_points: req.body.max_points,
        assignment_type: req.body.assignment_type,
      };

      const assignment = await firestoreAssignmentService.createAssignment(
        assignmentData,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        data: assignment,
      });
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get all assignments for a course
router.get(
  "/course/:courseId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;

      const assignments = await pool.query(
        'SELECT * FROM assignments WHERE "courseId" = $1 ORDER BY "dueDate" ASC',
        [courseId]
      );

      res.json({
        success: true,
        data: assignments.rows,
      });
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  }
);

// Submit an assignment (student only)
router.post("/:id/submit", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only students can submit assignments",
        });
    }

    const { id } = req.params;
    const { fileUrl, fileName } = req.body;

    const assignmentResult = await pool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [id]
    );
    const assignment = assignmentResult.rows[0];

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const submissionDate = new Date();
    const isLate = submissionDate > new Date(assignment.dueDate);

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        message: "Late submissions are not allowed for this assignment",
      });
    }

    const status = isLate ? "late" : "submitted";

    const result = await pool.query(
      'INSERT INTO student_submissions ("assignmentId", "studentId", "submissionDate", "fileUrl", "fileName", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [id, req.user!.id, submissionDate, fileUrl, fileName, status]
    );

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ message: "Failed to submit assignment" });
  }
});

// Grade a submission (trainer only)
router.post(
  "/submissions/:id/grade",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "trainer") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Only trainers can grade submissions",
          });
      }

      const { id } = req.params;
      const { grade, feedback } = req.body;

      if (grade < 0 || grade > 100) {
        return res.status(400).json({
          success: false,
          message: "Grade must be between 0 and 100",
        });
      }

      const result = await pool.query(
        'UPDATE student_submissions SET grade = $1, feedback = $2, "gradedBy" = $3, "gradedAt" = NOW(), status = $4, "updatedAt" = NOW() WHERE id = $5 RETURNING *',
        [grade, feedback, req.user.id, "graded", id]
      );

      if (!result.rows[0]) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      res.json({
        success: true,
        message: "Submission graded successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "Failed to grade submission" });
    }
  }
);

// Get submissions for an assignment (trainer only)
router.get(
  "/:id/submissions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "trainer") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Only trainers can view all submissions",
          });
      }

      const { id } = req.params;

      const submissions = await pool.query(
        'SELECT s.*, CONCAT(u."firstName", \' \', u."lastName") as "studentName" FROM student_submissions s JOIN users u ON s."studentId" = u.id WHERE s."assignmentId" = $1 ORDER BY s."submissionDate" DESC',
        [id]
      );

      res.json({
        success: true,
        data: submissions.rows,
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  }
);

// Get student's own submissions
router.get(
  "/my-submissions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "user") {
        return res
          .status(403)
          .json({
            success: false,
            message: "Only students can view their submissions",
          });
      }

      const submissions = await pool.query(
        'SELECT s.*, a.title as "assignmentTitle", a."dueDate" FROM student_submissions s JOIN assignments a ON s."assignmentId" = a.id WHERE s."studentId" = $1 ORDER BY s."submissionDate" DESC',
        [req.user.id]
      );

      res.json({
        success: true,
        data: submissions.rows,
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  }
);

export default router;
