import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { CourseRequest, AuthRequest } from "../types";
import { courseRepository } from "../repositories/CourseRepository";
import { pool } from "../database/database";

const router = Router();

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
    const { courses } = await courseRepository.findAll(1, 100);
    const activeCourses = courses.filter((course) => course.isActive);

    res.json({
      success: true,
      data: { courses: activeCourses },
    });
  } catch (error) {
    console.error("Get courses error:", error);
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
    const course = await courseRepository.findById(parseInt(id));

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
      const { courses } = await courseRepository.findAll(1, 1000);

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
      const client = await pool.connect();
      try {
        // Get total courses
        const totalCoursesResult = await client.query(
          "SELECT COUNT(*) as count FROM courses"
        );
        const totalCourses = parseInt(totalCoursesResult.rows[0].count);

        // Get active courses
        const activeCoursesResult = await client.query(
          'SELECT COUNT(*) as count FROM courses WHERE "isActive" = true'
        );
        const activeCourses = parseInt(activeCoursesResult.rows[0].count);

        // Get total registrations
        const totalRegistrationsResult = await client.query(
          "SELECT COUNT(*) as count FROM registrations"
        );
        const totalRegistrations = parseInt(
          totalRegistrationsResult.rows[0].count
        );

        // Get total revenue (sum of all course prices)
        const totalRevenueResult = await client.query(
          "SELECT SUM(price) as total FROM courses"
        );
        const totalRevenue = parseFloat(
          totalRevenueResult.rows[0].total || "0"
        );

        // Get average rating (placeholder - would need ratings table)
        const averageRating = 4.5; // Placeholder

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
      } finally {
        client.release();
      }
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

      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO courses (
            name, description, excerpt, duration, price, "maxStudents", 
            level, category, "instructorId", "isActive", "featuredImage",
            syllabus, requirements, "learningOutcomes", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
          RETURNING *
        `;

        const result = await client.query(query, [
          name,
          description,
          excerpt || "",
          duration,
          price,
          maxStudents,
          level || "beginner",
          category,
          instructorId || null,
          isActive,
          featuredImage || null,
          syllabus || "",
          requirements || "",
          learningOutcomes || "",
        ]);

        const course = result.rows[0];

        res.status(201).json({
          success: true,
          message: "Course created successfully",
          data: { course },
        });
      } finally {
        client.release();
      }
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

      const course = await courseRepository.update(parseInt(id), updateData);

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

      // Verify the instructor exists and is a trainer
      const client = await pool.connect();
      try {
        const instructorResult = await client.query(
          "SELECT id, role FROM users WHERE id = $1 AND role = 'trainer'",
          [instructorId]
        );

        if (instructorResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid trainer ID or user is not a trainer",
          });
        }

        const course = await courseRepository.update(parseInt(id), {
          instructorId: parseInt(instructorId),
        });

        res.json({
          success: true,
          message: "Trainer assigned successfully",
          data: { course },
        });
      } finally {
        client.release();
      }
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
      const course = await courseRepository.toggleStatus(parseInt(id));

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
      await courseRepository.delete(parseInt(id));

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
