import { Router } from "express";
import { courseController } from "../../controllers/CourseController";
import {
  createValidationMiddleware,
  validationChains,
  commonValidations,
} from "../../utils/validation";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

// Public routes
router.get(
  "/",
  createValidationMiddleware(validationChains.pagination),
  courseController.getAllCourses.bind(courseController)
);
router.get(
  "/:id",
  createValidationMiddleware([commonValidations.id]),
  courseController.getCourse.bind(courseController)
);

// Protected routes
router.post(
  "/",
  authenticateToken,
  createValidationMiddleware(validationChains.course),
  courseController.createCourse.bind(courseController)
);
router.put(
  "/:id",
  authenticateToken,
  createValidationMiddleware([
    commonValidations.id,
    ...validationChains.course,
  ]),
  courseController.updateCourse.bind(courseController)
);
router.delete(
  "/:id",
  authenticateToken,
  createValidationMiddleware([commonValidations.id]),
  courseController.deleteCourse.bind(courseController)
);
router.patch(
  "/:id/toggle",
  authenticateToken,
  createValidationMiddleware([commonValidations.id]),
  courseController.toggleCourseStatus.bind(courseController)
);

// Trainer-specific routes
router.get(
  "/trainer/my-courses",
  authenticateToken,
  courseController.getCoursesByTrainer.bind(courseController)
);

export default router;
