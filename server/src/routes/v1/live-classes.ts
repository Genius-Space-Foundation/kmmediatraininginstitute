import { Router } from "express";
import { LiveClassController } from "../../controllers/LiveClassController";
import { authenticateToken } from "../../middleware/auth";
import { checkRole } from "../../middleware/checkRole";
import { createValidationMiddleware } from "../../utils/validation";
import { body, param, query } from "express-validator";

const router = Router();
const liveClassController = new LiveClassController();

// Validation middleware
const liveClassValidation = [
  body("course_id").isUUID().withMessage("Valid course ID is required"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required"),
  body("scheduled_date")
    .isISO8601()
    .withMessage("Valid scheduled date is required"),
  body("duration_minutes")
    .isInt({ min: 1, max: 480 })
    .withMessage("Duration must be between 1 and 480 minutes"),
  body("meeting_url").optional().isURL().withMessage("Invalid meeting URL"),
  body("meeting_id")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Meeting ID cannot be empty"),
  body("meeting_password")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Meeting password cannot be empty"),
];

const catchupSessionValidation = [
  body("course_id").isUUID().withMessage("Valid course ID is required"),
  body("title")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title is required"),
  body("recording_url").optional().isURL().withMessage("Invalid recording URL"),
  body("duration_minutes")
    .optional()
    .isInt({ min: 1, max: 480 })
    .withMessage("Duration must be between 1 and 480 minutes"),
  body("original_class_id")
    .optional()
    .isUUID()
    .withMessage("Valid original class ID is required"),
];

// Get live classes for a course
router.get(
  "/course/:courseId",
  authenticateToken,
  createValidationMiddleware([param("courseId").isUUID()]),
  liveClassController.getLiveClassesByCourse.bind(liveClassController)
);

// Get upcoming live classes
router.get(
  "/upcoming",
  authenticateToken,
  createValidationMiddleware([
    query("days").optional().isInt({ min: 1, max: 30 }),
  ]),
  liveClassController.getUpcomingLiveClasses.bind(liveClassController)
);

// Get ongoing live classes
router.get(
  "/ongoing",
  authenticateToken,
  liveClassController.getOngoingLiveClasses.bind(liveClassController)
);

// Get completed live classes
router.get(
  "/completed",
  authenticateToken,
  createValidationMiddleware([query("courseId").optional().isUUID()]),
  liveClassController.getCompletedLiveClasses.bind(liveClassController)
);

// Get live class by ID
router.get(
  "/:id",
  authenticateToken,
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.getLiveClassById.bind(liveClassController)
);

// Create live class (trainers and admins)
router.post(
  "/",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware(liveClassValidation),
  liveClassController.createLiveClass.bind(liveClassController)
);

// Update live class (trainers and admins)
router.put(
  "/:id",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([
    param("id").isUUID(),
    ...liveClassValidation.map((v) => v.optional()),
  ]),
  liveClassController.updateLiveClass.bind(liveClassController)
);

// Delete live class (trainers and admins)
router.delete(
  "/:id",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.deleteLiveClass.bind(liveClassController)
);

// Start live class
router.post(
  "/:id/start",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.startLiveClass.bind(liveClassController)
);

// End live class
router.post(
  "/:id/end",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.endLiveClass.bind(liveClassController)
);

// Get attendees count
router.get(
  "/:id/attendees",
  authenticateToken,
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.getAttendeesCount.bind(liveClassController)
);

// Catchup Sessions routes
// Get catchup sessions for a course
router.get(
  "/course/:courseId/catchup-sessions",
  authenticateToken,
  createValidationMiddleware([param("courseId").isUUID()]),
  liveClassController.getCatchupSessionsByCourse.bind(liveClassController)
);

// Get catchup session by ID
router.get(
  "/catchup-sessions/:id",
  authenticateToken,
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.getCatchupSessionById.bind(liveClassController)
);

// Create catchup session (trainers and admins)
router.post(
  "/catchup-sessions",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware(catchupSessionValidation),
  liveClassController.createCatchupSession.bind(liveClassController)
);

// Update catchup session (trainers and admins)
router.put(
  "/catchup-sessions/:id",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([
    param("id").isUUID(),
    ...catchupSessionValidation.map((v) => v.optional()),
  ]),
  liveClassController.updateCatchupSession.bind(liveClassController)
);

// Delete catchup session (trainers and admins)
router.delete(
  "/catchup-sessions/:id",
  authenticateToken,
  checkRole(["admin", "trainer"]),
  createValidationMiddleware([param("id").isUUID()]),
  liveClassController.deleteCatchupSession.bind(liveClassController)
);

export default router;
