import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest } from "../types";
import { firestoreAssignmentService } from "../services/FirestoreAssignmentService";
import { body, validationResult } from "express-validator";

const router = Router();

// Create a new assignment (trainer/admin only)
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

// Get assignment by ID
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const assignment = await firestoreAssignmentService.getAssignmentById(id);

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all assignments for a course
router.get(
  "/course/:courseId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
      } = req.query;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: sort as string,
        order: order as string,
      };

      const assignments =
        await firestoreAssignmentService.getAssignmentsByCourse(
          courseId,
          pagination
        );

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get student's assignments
router.get(
  "/student/my-assignments",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "user") {
        return res.status(403).json({
          success: false,
          message: "Only students can view their assignments",
        });
      }

      const {
        page = 1,
        limit = 10,
        sort = "dueDate",
        order = "asc",
      } = req.query;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: sort as string,
        order: order as string,
      };

      const assignments =
        await firestoreAssignmentService.getAssignmentsByStudent(
          req.user.id,
          pagination
        );

      res.json({
        success: true,
        data: assignments,
      });
    } catch (error) {
      console.error("Error fetching student assignments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get upcoming assignments for student
router.get(
  "/student/upcoming",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "user") {
        return res.status(403).json({
          success: false,
          message: "Only students can view upcoming assignments",
        });
      }

      const { days = 7 } = req.query;
      const upcomingAssignments =
        await firestoreAssignmentService.getUpcomingAssignments(
          req.user.id,
          parseInt(days as string)
        );

      res.json({
        success: true,
        data: upcomingAssignments,
      });
    } catch (error) {
      console.error("Error fetching upcoming assignments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch upcoming assignments",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Update assignment (trainer/admin only)
router.put(
  "/:id",
  authenticateToken,
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Title cannot be empty"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty"),
    body("max_points")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("Max points must be between 1 and 1000"),
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
          message: "Only trainers and admins can update assignments",
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const assignment = await firestoreAssignmentService.updateAssignment(
        id,
        updates,
        req.user.id
      );

      res.json({
        success: true,
        message: "Assignment updated successfully",
        data: assignment,
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Delete assignment (trainer/admin only)
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (
      !req.user ||
      (req.user.role !== "trainer" && req.user.role !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only trainers and admins can delete assignments",
      });
    }

    const { id } = req.params;
    await firestoreAssignmentService.deleteAssignment(id, req.user.id);

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Submit an assignment (student only)
router.post(
  "/:id/submit",
  authenticateToken,
  [
    body("submission_text")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Submission text cannot be empty"),
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

      if (!req.user || req.user.role !== "user") {
        return res.status(403).json({
          success: false,
          message: "Only students can submit assignments",
        });
      }

      const { id } = req.params;
      const { submission_text, file } = req.body;

      if (!submission_text && !file) {
        return res.status(400).json({
          success: false,
          message: "Either submission text or file is required",
        });
      }

      const submissionData = {
        submission_text,
        file: file ? { name: file.originalname } : undefined,
      };

      const submission = await firestoreAssignmentService.submitAssignment(
        id,
        submissionData,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: "Assignment submitted successfully",
        data: submission,
      });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit assignment",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get submissions for an assignment (trainer/admin only)
router.get(
  "/:id/submissions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (
        !req.user ||
        (req.user.role !== "trainer" && req.user.role !== "admin")
      ) {
        return res.status(403).json({
          success: false,
          message: "Only trainers and admins can view submissions",
        });
      }

      const { id } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = "submittedAt",
        order = "desc",
      } = req.query;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: sort as string,
        order: order as string,
      };

      const submissions =
        await firestoreAssignmentService.getSubmissionsByAssignment(
          id,
          pagination
        );

      res.json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch submissions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Grade a submission (trainer/admin only)
router.post(
  "/submissions/:id/grade",
  authenticateToken,
  [
    body("grade")
      .isFloat({ min: 0 })
      .withMessage("Grade must be a positive number"),
    body("feedback").optional().trim(),
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
          message: "Only trainers and admins can grade submissions",
        });
      }

      const { id } = req.params;
      const { grade, feedback } = req.body;

      const gradeData = {
        grade: parseFloat(grade),
        feedback: feedback || "",
      };

      const submission = await firestoreAssignmentService.gradeSubmission(
        id,
        gradeData,
        req.user.id
      );

      res.json({
        success: true,
        message: "Submission graded successfully",
        data: submission,
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to grade submission",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get student's own submissions
router.get(
  "/student/my-submissions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user || req.user.role !== "user") {
        return res.status(403).json({
          success: false,
          message: "Only students can view their submissions",
        });
      }

      const {
        page = 1,
        limit = 10,
        sort = "submittedAt",
        order = "desc",
      } = req.query;

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sort: sort as string,
        order: order as string,
      };

      const assignments =
        await firestoreAssignmentService.getAssignmentsByStudent(
          req.user.id,
          pagination
        );

      // Filter to only include assignments with submissions
      const assignmentsWithSubmissions = assignments.filter(
        (assignment) => assignment.submissionId
      );

      res.json({
        success: true,
        data: assignmentsWithSubmissions,
      });
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch submissions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get assignment statistics (trainer/admin only)
router.get("/:id/stats", authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (
      !req.user ||
      (req.user.role !== "trainer" && req.user.role !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only trainers and admins can view assignment statistics",
      });
    }

    const { id } = req.params;
    const stats = await firestoreAssignmentService.getAssignmentStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching assignment stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
