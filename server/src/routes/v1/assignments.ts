import { Router } from "express";
import { AssignmentController } from "../../controllers/AssignmentController";
import { authenticateToken } from "../../middleware/auth";
import { checkRole } from "../../middleware/checkRole";
import { createValidationMiddleware } from "../../utils/validation";
import { body, param, query } from "express-validator";

const router = Router();
const assignmentController = new AssignmentController();

// Validation middleware
const assignmentValidation = [
  body("course_id").isUUID().withMessage("Valid course ID is required"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required"),
  body("description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("max_points")
    .isInt({ min: 1, max: 1000 })
    .withMessage("Max points must be between 1 and 1000"),
  body("assignment_type")
    .isIn(["homework", "project", "quiz", "exam"])
    .withMessage("Invalid assignment type"),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid due date format"),
];

const submissionValidation = [
  body("assignment_id").isUUID().withMessage("Valid assignment ID is required"),
  body("submission_text")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Submission text cannot be empty"),
];

const gradeValidation = [
  body("grade")
    .isFloat({ min: 0 })
    .withMessage("Grade must be a positive number"),
  body("feedback")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Feedback too long"),
];

// Get assignments for a course (trainers and students)
router.get(
  "/course/:courseId",
  authenticateToken,
  createValidationMiddleware([param("courseId").isUUID()]),
  assignmentController.getAssignmentsByCourse.bind(assignmentController)
);

// Get assignments for a student
router.get(
  "/student/:studentId",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("studentId").isUUID()]),
  assignmentController.getAssignmentsByStudent.bind(assignmentController)
);

// Get my assignments (for students)
router.get(
  "/my-assignments",
  authenticateToken,
  checkRole(["student"]),
  assignmentController.getMyAssignments.bind(assignmentController)
);

// Get upcoming assignments
router.get(
  "/upcoming",
  authenticateToken,
  checkRole(["student"]),
  createValidationMiddleware([
    query("days").optional().isInt({ min: 1, max: 30 }),
  ]),
  assignmentController.getUpcomingAssignments.bind(assignmentController)
);

// Get assignment by ID
router.get(
  "/:id",
  authenticateToken,
  createValidationMiddleware([param("id").isUUID()]),
  assignmentController.getAssignmentById.bind(assignmentController)
);

// Create assignment (trainers and admins)
router.post(
  "/",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware(assignmentValidation),
  assignmentController.createAssignment.bind(assignmentController)
);

// Update assignment (trainers and admins)
router.put(
  "/:id",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([
    param("id").isUUID(),
    ...assignmentValidation.map((v) => v.optional()),
  ]),
  assignmentController.updateAssignment.bind(assignmentController)
);

// Delete assignment (trainers and admins)
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  assignmentController.deleteAssignment.bind(assignmentController)
);

// Get assignment submissions
router.get(
  "/:id/submissions",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  assignmentController.getSubmissionsByAssignment.bind(assignmentController)
);

// Submit assignment (students)
router.post(
  "/:id/submit",
  authenticateToken,
  checkRole(["student"]),
  createValidationMiddleware([param("id").isUUID(), ...submissionValidation]),
  assignmentController.submitAssignment.bind(assignmentController)
);

// Get my submission for an assignment
router.get(
  "/:id/my-submission",
  authenticateToken,
  checkRole(["student"]),
  createValidationMiddleware([param("id").isUUID()]),
  assignmentController.getMySubmission.bind(assignmentController)
);

// Grade submission (trainers and admins)
router.post(
  "/submissions/:submissionId/grade",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([
    param("submissionId").isUUID(),
    ...gradeValidation,
  ]),
  assignmentController.gradeSubmission.bind(assignmentController)
);

// Get assignment statistics
router.get(
  "/:id/stats",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  assignmentController.getAssignmentStats.bind(assignmentController)
);

export default router;
