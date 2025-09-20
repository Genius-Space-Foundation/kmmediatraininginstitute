import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { CourseRequest, AuthRequest } from "../types";
import { FirestoreCourseRepository } from "../repositories/FirestoreCourseRepository";
// Removed database import - using Firestore now

const router = Router();
const courseRepository = new FirestoreCourseRepository();

// Course validation
const courseValidation = [
  body("name").trim().notEmpty().withMessage("Course name is required"),
  body("description")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
  body("maxStudents")
    .isInt({ min: 1 })
    .withMessage("Valid max students count is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

// Get all active courses (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    console.log("🔍 Fetching courses from database...");
    const result = await courseRepository.findAllCourses();
    console.log(
      "📊 Raw result from database:",
      JSON.stringify(result, null, 2)
    );

    const activeCourses = result.courses.filter(
      (course) => course.isActive === true || course.status === "active"
    );
    console.log("✅ Active courses found:", activeCourses.length);

    res.json({
      success: true,
      data: { courses: activeCourses },
    });
  } catch (error) {
    console.error("❌ Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Get course by ID (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await courseRepository.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Get all courses (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const courses = await courseRepository.findAllCourses();

      res.json({
        success: true,
        data: { courses },
      });
    } catch (error) {
      console.error("Get all courses error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get course statistics (admin only)
router.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      // Get all courses from Firestore
      const result = await courseRepository.findAllCourses();
      const courses = result.courses;

      // Calculate stats
      const totalCourses = courses.length;
      const activeCourses = courses.filter((course) => course.isActive).length;
      const totalRevenue = courses.reduce(
        (sum, course) => sum + course.price,
        0
      );
      const averageRating = 4.5; // Placeholder - would need ratings collection
      const totalRegistrations = 0; // Placeholder - would need registrations collection

      res.json({
        success: true,
        data: {
          totalCourses,
          activeCourses,
          totalRegistrations,
          totalRevenue,
          averageRating,
        },
      });
    } catch (error) {
      console.error("Get course stats error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Create new course (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  courseValidation,
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

      const {
        name,
        description,
        excerpt,
        duration,
        price,
        maxStudents,
        level,
        category,
        instructorId,
        isActive = true,
        featuredImage,
        syllabus,
        requirements,
        learningOutcomes,
      }: CourseRequest = req.body;

      const courseData = {
        name,
        description,
        excerpt: excerpt || "",
        duration,
        price,
        maxStudents,
        level: level || "beginner",
        category,
        instructorId: instructorId ? instructorId.toString() : undefined,
        isActive,
        featuredImage: featuredImage || undefined,
        syllabus: syllabus || "",
        requirements: requirements || "",
        learningOutcomes: learningOutcomes || "",
      };

      const course = await courseRepository.create(courseData);

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: { course },
      });
    } catch (error) {
      console.error("Create course error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update course (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If this is a full course update, validate required fields
      if (
        updateData.name ||
        updateData.description ||
        updateData.duration ||
        updateData.price
      ) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
          });
        }
      }

      const course = await courseRepository.update(id, updateData);

      res.json({
        success: true,
        message: "Course updated successfully",
        data: { course },
      });
    } catch (error: any) {
      console.error("Update course error:", error);
      if (error?.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Assign trainer to course (admin only)
router.patch(
  "/:id/assign-trainer",
  authenticateToken,
  requireAdmin,
  [body("instructorId").isInt().withMessage("Valid instructor ID is required")],
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
      const { instructorId } = req.body;

      // TODO: Verify the instructor exists and is a trainer using UserService
      // For now, we'll skip the verification and just assign the trainer

      const course = await courseRepository.update(id, {
        instructorId: instructorId,
      });

      res.json({
        success: true,
        message: "Trainer assigned successfully",
        data: { course },
      });
    } catch (error: any) {
      console.error("Assign trainer error:", error);
      if (error?.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Toggle course active status (admin only)
router.patch(
  "/:id/toggle",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const course = await courseRepository.toggleStatus(id);

      res.json({
        success: true,
        message: "Course status updated successfully",
        data: { course },
      });
    } catch (error: any) {
      console.error("Toggle course error:", error);
      if (error?.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Delete course (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await courseRepository.delete(id);

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete course error:", error);
      if (error?.message === "Course not found") {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;
