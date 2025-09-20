import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { pool } from "../database/database";
import {
  authenticateToken,
  requireAdmin,
  requireTrainer,
} from "../middleware/auth";
import { AuthRequest } from "../types";
import { logger } from "../utils/logger";

const router = express.Router();

// Get all trainers (admin only)
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, email, "firstName", "lastName", phone, specialization, bio, experience, "createdAt", "updatedAt"
      FROM users 
      WHERE role = 'trainer'
      ORDER BY "createdAt" DESC
    `);
    client.release();

    res.json({
      success: true,
      trainers: result.rows,
    });
  } catch (error) {
    logger.error("Error fetching trainers:", error);
    res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
});

// Get trainer stats (admin only)
router.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const client = await pool.connect();

      // Total trainers
      const totalResult = await client.query(`
      SELECT COUNT(*) as total FROM users WHERE role = 'trainer'
    `);

      // Active trainers (assuming all are active for now)
      const activeResult = await client.query(`
      SELECT COUNT(*) as active FROM users WHERE role = 'trainer'
    `);

      // Trainers by specialization
      const specializationResult = await client.query(`
      SELECT specialization, COUNT(*) as count 
      FROM users 
      WHERE role = 'trainer' AND specialization IS NOT NULL
      GROUP BY specialization
      ORDER BY count DESC
    `);

      // Trainers this month
      const thisMonthResult = await client.query(`
      SELECT COUNT(*) as thisMonth 
      FROM users 
      WHERE role = 'trainer' 
      AND "createdAt" >= DATE_TRUNC('month', CURRENT_DATE)
    `);

      client.release();

      res.json({
        success: true,
        stats: {
          total: parseInt(totalResult.rows[0].total),
          active: parseInt(activeResult.rows[0].active),
          thisMonth: parseInt(thisMonthResult.rows[0].thisMonth),
          specializations: specializationResult.rows,
        },
      });
    } catch (error) {
      logger.error("Error fetching trainer stats:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Register new trainer (admin only)
router.post(
  "/admin/register",
  authenticateToken,
  requireAdmin,
  [
    body("email").isEmail().normalizeEmail(),
    body("firstName").trim().isLength({ min: 1 }),
    body("lastName").trim().isLength({ min: 1 }),
    body("password").isLength({ min: 6 }),
    body("specialization").trim().isLength({ min: 1 }),
    body("phone").optional().trim(),
    body("bio").optional().trim(),
    body("experience").optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const {
        email,
        firstName,
        lastName,
        password,
        specialization,
        phone,
        bio,
        experience,
      } = req.body;

      const client = await pool.connect();

      // Check if email already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new trainer
      const result = await client.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role, phone, specialization, bio, experience)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, "firstName", "lastName", phone, specialization, bio, experience, "createdAt"`,
        [
          email,
          hashedPassword,
          firstName,
          lastName,
          "trainer",
          phone || null,
          specialization,
          bio || null,
          experience || 0,
        ]
      );

      client.release();

      const trainer = result.rows[0];

      logger.info(
        `Admin ${(req as AuthRequest).user?.id} registered new trainer: ${
          trainer.id
        }`
      );

      res.status(201).json({
        success: true,
        message: "Trainer registered successfully",
        trainer: {
          ...trainer,
          password: undefined, // Don't send password back
        },
      });
    } catch (error) {
      logger.error("Error registering trainer:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get trainer by ID (admin only)
router.get(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();

      const result = await client.query(
        `SELECT id, email, "firstName", "lastName", phone, specialization, bio, experience, "createdAt", "updatedAt"
       FROM users 
       WHERE id = $1 AND role = 'trainer'`,
        [id]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Trainer not found",
        });
      }

      res.json({
        success: true,
        trainer: result.rows[0],
      });
    } catch (error) {
      logger.error("Error fetching trainer:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update trainer (admin only)
router.put(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  [
    body("firstName").optional().trim().isLength({ min: 1 }),
    body("lastName").optional().trim().isLength({ min: 1 }),
    body("phone").optional().trim(),
    body("specialization").optional().trim().isLength({ min: 1 }),
    body("bio").optional().trim(),
    body("experience").optional().isInt({ min: 0 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { firstName, lastName, phone, specialization, bio, experience } =
        req.body;

      const client = await pool.connect();

      // Check if trainer exists
      const existingTrainer = await client.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'trainer'",
        [id]
      );

      if (existingTrainer.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Trainer not found",
        });
      }

      // Update trainer
      const result = await client.query(
        `UPDATE users 
         SET "firstName" = COALESCE($1, "firstName"),
             "lastName" = COALESCE($2, "lastName"),
             phone = $3,
             specialization = COALESCE($4, specialization),
             bio = $5,
             experience = COALESCE($6, experience),
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $7 AND role = 'trainer'
         RETURNING id, email, "firstName", "lastName", phone, specialization, bio, experience, "createdAt", "updatedAt"`,
        [firstName, lastName, phone, specialization, bio, experience, id]
      );

      client.release();

      logger.info(
        `Admin ${(req as AuthRequest).user?.id} updated trainer: ${id}`
      );

      res.json({
        success: true,
        message: "Trainer updated successfully",
        trainer: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating trainer:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Delete trainer (admin only)
router.delete(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();

      // Check if trainer exists
      const existingTrainer = await client.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'trainer'",
        [id]
      );

      if (existingTrainer.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Trainer not found",
        });
      }

      // Check if trainer has any courses
      const coursesResult = await client.query(
        'SELECT COUNT(*) as count FROM courses WHERE "instructorId" = $1',
        [id]
      );

      if (parseInt(coursesResult.rows[0].count) > 0) {
        client.release();
        return res.status(400).json({
          success: false,
          message: "Cannot delete trainer with existing courses",
        });
      }

      // Delete trainer
      await client.query(
        "DELETE FROM users WHERE id = $1 AND role = 'trainer'",
        [id]
      );

      client.release();

      logger.info(
        `Admin ${(req as AuthRequest).user?.id} deleted trainer: ${id}`
      );

      res.json({
        success: true,
        message: "Trainer deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting trainer:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get trainer's courses (admin only)
router.get(
  "/admin/:id/courses",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const client = await pool.connect();

      const result = await client.query(
        `SELECT c.*, u."firstName" as instructorFirstName, u."lastName" as instructorLastName
       FROM courses c
       LEFT JOIN users u ON c."instructorId" = u.id
       WHERE c."instructorId" = $1
       ORDER BY c."createdAt" DESC`,
        [id]
      );

      client.release();

      res.json({
        success: true,
        courses: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching trainer courses:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get trainer dashboard stats (trainer only)
router.get(
  "/dashboard",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      // Total courses
      const coursesResult = await client.query(
        'SELECT COUNT(*) as total FROM courses WHERE "instructorId" = $1',
        [trainerId]
      );

      // Total students
      const studentsResult = await client.query(
        `
      SELECT COUNT(DISTINCT r."userId") as total
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE c."instructorId" = $1
    `,
        [trainerId]
      );

      // Active students (approved registrations)
      const activeStudentsResult = await client.query(
        `
      SELECT COUNT(DISTINCT r."userId") as active
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE c."instructorId" = $1 AND r.status = 'approved'
    `,
        [trainerId]
      );

      // Completed students
      const completedStudentsResult = await client.query(
        `
      SELECT COUNT(DISTINCT r."userId") as completed
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE c."instructorId" = $1 AND r.status = 'completed'
    `,
        [trainerId]
      );

      // Pending students
      const pendingStudentsResult = await client.query(
        `
      SELECT COUNT(DISTINCT r."userId") as pending
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE c."instructorId" = $1 AND r.status = 'pending'
    `,
        [trainerId]
      );

      // This month registrations
      const thisMonthResult = await client.query(
        `
      SELECT COUNT(*) as thisMonth
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE c."instructorId" = $1 
      AND r."registrationDate" >= DATE_TRUNC('month', CURRENT_DATE)
    `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        stats: {
          totalCourses: parseInt(coursesResult.rows[0].total),
          totalStudents: parseInt(studentsResult.rows[0].total),
          activeStudents: parseInt(activeStudentsResult.rows[0].active),
          completedStudents: parseInt(
            completedStudentsResult.rows[0].completed
          ),
          pendingStudents: parseInt(pendingStudentsResult.rows[0].pending),
          thisMonthRegistrations: parseInt(thisMonthResult.rows[0].thisMonth),
        },
      });
    } catch (error) {
      logger.error("Error fetching trainer dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get trainer's assigned courses (trainer only)
router.get(
  "/courses",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
      SELECT c.*, 
             COUNT(r.id) as enrolledStudents,
             COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completedStudents,
             COUNT(cm.id) as materialCount,
             COUNT(a.id) as assignmentCount,
             COUNT(q.id) as quizCount
      FROM courses c
      LEFT JOIN registrations r ON c.id = r."courseId"
      LEFT JOIN course_materials cm ON c.id = cm."courseId"
      LEFT JOIN assignments a ON c.id = a."courseId"
      LEFT JOIN quizzes q ON c.id = q."courseId"
      WHERE c."instructorId" = $1
      GROUP BY c.id
      ORDER BY c."createdAt" DESC
    `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        courses: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching trainer courses:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get trainer's students (trainer only)
router.get(
  "/students",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
      SELECT r.id, r.status, r."registrationDate", r.notes,
             u.id as "userId", u."firstName", u."lastName", u.email, u.phone,
             c.id as "courseId", c.name as "courseName", c.duration
      FROM registrations r
      JOIN users u ON r."userId" = u.id
      JOIN courses c ON r."courseId" = c.id
      WHERE c."instructorId" = $1
      ORDER BY r."registrationDate" DESC
    `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        students: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching trainer students:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update student registration status (trainer only)
router.put(
  "/students/:registrationId",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const registrationId = req.params.registrationId;
      const { status } = req.body;

      if (!["pending", "approved", "rejected", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const client = await pool.connect();

      // Check if the registration is for a course taught by this trainer
      const registrationCheck = await client.query(
        `
      SELECT r.id FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE r.id = $1 AND c."instructorId" = $2
    `,
        [registrationId, trainerId]
      );

      if (registrationCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Registration not found or access denied",
        });
      }

      // Update the registration
      await client.query(
        `
      UPDATE registrations 
      SET status = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
    `,
        [status, registrationId]
      );

      client.release();

      logger.info(
        `Trainer ${trainerId} updated registration ${registrationId} to status: ${status}`
      );

      res.json({
        success: true,
        message: "Registration status updated successfully",
      });
    } catch (error) {
      logger.error("Error updating registration status:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get trainer profile (trainer only)
router.get(
  "/profile",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
      SELECT id, email, "firstName", "lastName", phone, address, specialization, bio, experience, "createdAt", "updatedAt"
      FROM users 
      WHERE id = $1 AND role = 'trainer'
    `,
        [trainerId]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Trainer profile not found",
        });
      }

      res.json({
        success: true,
        profile: result.rows[0],
      });
    } catch (error) {
      logger.error("Error fetching trainer profile:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update trainer profile (trainer only)
router.put(
  "/profile",
  authenticateToken,
  requireTrainer,
  [
    body("firstName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required"),
    body("lastName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("phone").optional().trim(),
    body("address").optional().trim(),
    body("specialization")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Specialization is required"),
    body("bio").optional().trim(),
    body("experience")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience must be a positive number"),
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

      const trainerId = req.user!.id;
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        specialization,
        bio,
        experience,
      } = req.body;

      const client = await pool.connect();

      // Check if email is already taken by another user
      const emailCheck = await client.query(
        `
      SELECT id FROM users WHERE email = $1 AND id != $2
    `,
        [email, trainerId]
      );

      if (emailCheck.rows.length > 0) {
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email is already taken",
        });
      }

      // Update the trainer profile
      const result = await client.query(
        `
      UPDATE users 
      SET "firstName" = $1, "lastName" = $2, email = $3, phone = $4, address = $5, 
          specialization = $6, bio = $7, experience = $8, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $9 AND role = 'trainer'
      RETURNING id, email, "firstName", "lastName", phone, address, specialization, bio, experience, "createdAt", "updatedAt"
    `,
        [
          firstName,
          lastName,
          email,
          phone,
          address,
          specialization,
          bio,
          experience,
          trainerId,
        ]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Trainer profile not found",
        });
      }

      logger.info(`Trainer ${trainerId} updated their profile`);

      res.json({
        success: true,
        message: "Profile updated successfully",
        profile: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating trainer profile:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get specific course by ID (trainer only)
router.get(
  "/courses/:courseId",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const client = await pool.connect();

      const result = await client.query(
        `
      SELECT id, name, description, duration, price, "maxStudents", category, excerpt, level,
             syllabus, requirements, "learningOutcomes", "isActive", "createdAt", "updatedAt"
      FROM courses 
      WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      client.release();

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      res.json({
        success: true,
        course: result.rows[0],
      });
    } catch (error) {
      logger.error("Error fetching course:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Update course content (trainer only) - Limited to content fields only
router.put(
  "/courses/:courseId/content",
  authenticateToken,
  requireTrainer,
  [
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Course description is required"),
    body("syllabus").optional().trim(),
    body("requirements").optional().trim(),
    body("learningOutcomes").optional().trim(),
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

      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const { description, syllabus, requirements, learningOutcomes } =
        req.body;

      const client = await pool.connect();

      // Check if the course belongs to this trainer
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      // Update only content fields
      const result = await client.query(
        `
      UPDATE courses 
      SET description = $1, syllabus = $2, requirements = $3, "learningOutcomes" = $4, 
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $5 AND "instructorId" = $6
      RETURNING id, name, description, duration, price, "maxStudents", category, excerpt, level,
                syllabus, requirements, "learningOutcomes", "isActive", "createdAt", "updatedAt"
    `,
        [
          description,
          syllabus,
          requirements,
          learningOutcomes,
          courseId,
          trainerId,
        ]
      );

      client.release();

      logger.info(
        `Trainer ${trainerId} updated course content for course ${courseId}`
      );

      res.json({
        success: true,
        message: "Course content updated successfully",
        course: result.rows[0],
      });
    } catch (error) {
      logger.error("Error updating course content:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Note: Course creation is now restricted to admins only
// Trainers can only update assigned courses with specific fields

// Enhanced Course Management Routes

// Get course materials (trainer only)
router.get(
  "/courses/:courseId/materials",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      const result = await client.query(
        `
      SELECT id, title, description, "fileUrl", "fileType", "fileSize", "fileName", 
             module, "isPublic", "downloadCount", "viewCount", "createdAt"
      FROM course_materials 
      WHERE "courseId" = $1
      ORDER BY "createdAt" DESC
    `,
        [courseId]
      );

      client.release();

      res.json({
        success: true,
        materials: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching course materials:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Upload course material (trainer only)
router.post(
  "/courses/:courseId/materials",
  authenticateToken,
  requireTrainer,
  [
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description").optional().trim(),
    body("fileUrl")
      .trim()
      .isLength({ min: 1 })
      .withMessage("File URL is required"),
    body("fileType")
      .trim()
      .isLength({ min: 1 })
      .withMessage("File type is required"),
    body("fileName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("File name is required"),
    body("module").optional().trim(),
    body("isPublic").optional().isBoolean(),
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

      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const {
        title,
        description,
        fileUrl,
        fileType,
        fileName,
        fileSize,
        module,
        isPublic,
      } = req.body;

      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      const result = await client.query(
        `
      INSERT INTO course_materials ("courseId", title, description, "fileUrl", "fileType", "fileSize", "fileName", module, "isPublic")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, description, "fileUrl", "fileType", "fileSize", "fileName", module, "isPublic", "createdAt"
    `,
        [
          courseId,
          title,
          description,
          fileUrl,
          fileType,
          fileSize,
          fileName,
          module,
          isPublic,
        ]
      );

      client.release();

      logger.info(
        `Trainer ${trainerId} uploaded material to course ${courseId}`
      );

      res.status(201).json({
        success: true,
        message: "Material uploaded successfully",
        material: result.rows[0],
      });
    } catch (error) {
      logger.error("Error uploading course material:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get assignments for a course (trainer only)
router.get(
  "/courses/:courseId/assignments",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      const result = await client.query(
        `
      SELECT a.*, 
             COUNT(s.id) as "submissionCount",
             COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as "submittedCount",
             COUNT(CASE WHEN s.status = 'late' THEN 1 END) as "lateCount",
             COUNT(CASE WHEN s.status = 'missing' THEN 1 END) as "missingCount"
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s."assignmentId"
      WHERE a."courseId" = $1
      GROUP BY a.id
      ORDER BY a."dueDate" ASC
    `,
        [courseId]
      );

      client.release();

      res.json({
        success: true,
        assignments: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Create assignment (trainer only)
router.post(
  "/courses/:courseId/assignments",
  authenticateToken,
  requireTrainer,
  [
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required"),
    body("dueDate").isISO8601().withMessage("Valid due date is required"),
    body("maxScore")
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage("Max score must be between 1 and 1000"),
    body("assignmentType")
      .optional()
      .isIn(["individual", "group"])
      .withMessage("Assignment type must be individual or group"),
    body("instructions").optional().trim(),
    body("allowLateSubmission").optional().isBoolean(),
    body("latePenalty")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Late penalty must be between 0 and 100"),
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

      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const {
        title,
        description,
        dueDate,
        maxScore,
        assignmentType,
        instructions,
        attachmentUrl,
        attachmentName,
        allowLateSubmission,
        latePenalty,
      } = req.body;

      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      const result = await client.query(
        `
      INSERT INTO assignments ("courseId", title, description, "dueDate", "maxScore", "assignmentType", 
                              instructions, "attachmentUrl", "attachmentName", "allowLateSubmission", "latePenalty")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title, description, "dueDate", "maxScore", "assignmentType", instructions, 
                "attachmentUrl", "attachmentName", "allowLateSubmission", "latePenalty", "createdAt"
    `,
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
          allowLateSubmission || false,
          latePenalty || 0,
        ]
      );

      client.release();

      logger.info(
        `Trainer ${trainerId} created assignment for course ${courseId}`
      );

      res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        assignment: result.rows[0],
      });
    } catch (error) {
      logger.error("Error creating assignment:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get assignment submissions (trainer only)
router.get(
  "/assignments/:assignmentId/submissions",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const assignmentId = req.params.assignmentId;
      const client = await pool.connect();

      // Verify trainer owns this assignment
      const assignmentCheck = await client.query(
        `
      SELECT a.id FROM assignments a
      JOIN courses c ON a."courseId" = c.id
      WHERE a.id = $1 AND c."instructorId" = $2
    `,
        [assignmentId, trainerId]
      );

      if (assignmentCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Assignment not found or access denied",
        });
      }

      const result = await client.query(
        `
      SELECT s.*, 
             u."firstName", u."lastName", u.email,
             a.title as "assignmentTitle", a."dueDate", a."maxScore"
      FROM assignment_submissions s
      JOIN users u ON s."studentId" = u.id
      JOIN assignments a ON s."assignmentId" = a.id
      WHERE s."assignmentId" = $1
      ORDER BY s."submittedAt" DESC
    `,
        [assignmentId]
      );

      client.release();

      res.json({
        success: true,
        submissions: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching assignment submissions:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Grade assignment submission (trainer only)
router.put(
  "/submissions/:submissionId/grade",
  authenticateToken,
  requireTrainer,
  [
    body("grade")
      .isInt({ min: 0 })
      .withMessage("Grade must be a positive number"),
    body("feedback").optional().trim(),
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

      const trainerId = req.user!.id;
      const submissionId = req.params.submissionId;
      const { grade, feedback } = req.body;

      const client = await pool.connect();

      // Verify trainer owns this submission
      const submissionCheck = await client.query(
        `
      SELECT s.id FROM assignment_submissions s
      JOIN assignments a ON s."assignmentId" = a.id
      JOIN courses c ON a."courseId" = c.id
      WHERE s.id = $1 AND c."instructorId" = $2
    `,
        [submissionId, trainerId]
      );

      if (submissionCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Submission not found or access denied",
        });
      }

      const result = await client.query(
        `
      UPDATE assignment_submissions 
      SET score = $1, feedback = $2, status = 'graded', "gradedAt" = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, score as grade, feedback, status, "gradedAt"
    `,
        [grade, feedback, submissionId]
      );

      client.release();

      logger.info(`Trainer ${trainerId} graded submission ${submissionId}`);

      res.json({
        success: true,
        message: "Submission graded successfully",
        submission: result.rows[0],
      });
    } catch (error) {
      logger.error("Error grading submission:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get quizzes for a course (trainer only)
router.get(
  "/courses/:courseId/quizzes",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      const result = await client.query(
        `
      SELECT q.*, 
             COUNT(sqa.id) as "attemptCount",
             COUNT(DISTINCT sqa."studentId") as "studentCount"
      FROM quizzes q
      LEFT JOIN student_quiz_attempts sqa ON q.id = sqa."quizId"
      WHERE q."courseId" = $1
      GROUP BY q.id
      ORDER BY q."createdAt" DESC
    `,
        [courseId]
      );

      client.release();

      res.json({
        success: true,
        quizzes: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching quizzes:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Create quiz (trainer only)
router.post(
  "/courses/:courseId/quizzes",
  authenticateToken,
  requireTrainer,
  [
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description").optional().trim(),
    body("timeLimit")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Time limit must be a positive number"),
    body("attemptsAllowed")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Attempts allowed must be a positive number"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Valid start date is required"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Valid end date is required"),
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

      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const {
        title,
        description,
        timeLimit,
        attemptsAllowed,
        startDate,
        endDate,
      } = req.body;

      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      const result = await client.query(
        `
      INSERT INTO quizzes ("courseId", title, description, "timeLimit", "attemptsAllowed", "startDate", "endDate")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, description, "timeLimit", "attemptsAllowed", "startDate", "endDate", "createdAt"
    `,
        [
          courseId,
          title,
          description,
          timeLimit,
          attemptsAllowed || 1,
          startDate,
          endDate,
        ]
      );

      client.release();

      logger.info(`Trainer ${trainerId} created quiz for course ${courseId}`);

      res.status(201).json({
        success: true,
        message: "Quiz created successfully",
        quiz: result.rows[0],
      });
    } catch (error) {
      logger.error("Error creating quiz:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get course analytics (trainer only)
router.get(
  "/courses/:courseId/analytics",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const courseId = req.params.courseId;
      const client = await pool.connect();

      // Verify trainer owns this course
      const courseCheck = await client.query(
        `
      SELECT id FROM courses WHERE id = $1 AND "instructorId" = $2
    `,
        [courseId, trainerId]
      );

      if (courseCheck.rows.length === 0) {
        client.release();
        return res.status(404).json({
          success: false,
          message: "Course not found or access denied",
        });
      }

      // Get course statistics
      const statsResult = await client.query(
        `
      SELECT 
        COUNT(DISTINCT r."userId") as "totalStudents",
        COUNT(DISTINCT a.id) as "totalAssignments",
        COUNT(DISTINCT q.id) as "totalQuizzes",
        COUNT(DISTINCT cm.id) as "totalMaterials"
      FROM courses c
      LEFT JOIN registrations r ON c.id = r."courseId"
      LEFT JOIN assignments a ON c.id = a."courseId"
      LEFT JOIN quizzes q ON c.id = q."courseId"
      LEFT JOIN course_materials cm ON c.id = cm."courseId"
      WHERE c.id = $1
    `,
        [courseId]
      );

      // Get recent activity
      const activityResult = await client.query(
        `
      SELECT 
        'submission' as type,
        s."submittedAt" as date,
        u."firstName" || ' ' || u."lastName" as "studentName",
        a.title as "itemTitle"
      FROM assignment_submissions s
      JOIN users u ON s."studentId" = u.id
      JOIN assignments a ON s."assignmentId" = a.id
      WHERE a."courseId" = $1
      UNION ALL
      SELECT 
        'quiz_attempt' as type,
        sqa."endTime" as date,
        u."firstName" || ' ' || u."lastName" as "studentName",
        q.title as "itemTitle"
      FROM student_quiz_attempts sqa
      JOIN users u ON sqa."studentId" = u.id
      JOIN quizzes q ON sqa."quizId" = q.id
      WHERE q."courseId" = $1 AND sqa."isCompleted" = true
      ORDER BY date DESC
      LIMIT 10
    `,
        [courseId]
      );

      client.release();

      res.json({
        success: true,
        analytics: {
          stats: statsResult.rows[0],
          recentActivity: activityResult.rows,
        },
      });
    } catch (error) {
      logger.error("Error fetching course analytics:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all assignments for trainer (trainer only)
router.get(
  "/assignments",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
        SELECT a.*, 
               c.name as "courseName",
               COUNT(s.id) as "submissionCount",
               COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as "submittedCount",
               COUNT(CASE WHEN s.status = 'late' THEN 1 END) as "lateCount",
               COUNT(CASE WHEN s.status = 'missing' THEN 1 END) as "missingCount"
        FROM assignments a
        JOIN courses c ON a."courseId" = c.id
        LEFT JOIN assignment_submissions s ON a.id = s."assignmentId"
        WHERE c."instructorId" = $1
        GROUP BY a.id, c.name
        ORDER BY a."dueDate" ASC
        `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        assignments: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all submissions for trainer (trainer only)
router.get(
  "/submissions",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
        SELECT s.*, 
               u."firstName", u."lastName", u.email,
               a.title as "assignmentTitle", a."dueDate", a."maxScore",
               c.name as "courseName", c.id as "courseId"
        FROM assignment_submissions s
        JOIN users u ON s."studentId" = u.id
        JOIN assignments a ON s."assignmentId" = a.id
        JOIN courses c ON a."courseId" = c.id
        WHERE c."instructorId" = $1
        ORDER BY s."submittedAt" DESC
        `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        submissions: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching submissions:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all quizzes for trainer (trainer only)
router.get(
  "/quizzes",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
        SELECT q.*, c.name as "courseName"
        FROM quizzes q
        JOIN courses c ON q."courseId" = c.id
        WHERE c."instructorId" = $1
        ORDER BY q."createdAt" DESC
        `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        quizzes: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching quizzes:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all materials for trainer (trainer only)
router.get(
  "/materials",
  authenticateToken,
  requireTrainer,
  async (req: AuthRequest, res: Response) => {
    try {
      const trainerId = req.user!.id;
      const client = await pool.connect();

      const result = await client.query(
        `
        SELECT m.*, c.name as "courseName"
        FROM course_materials m
        JOIN courses c ON m."courseId" = c.id
        WHERE c."instructorId" = $1
        ORDER BY m."createdAt" DESC
        `,
        [trainerId]
      );

      client.release();

      res.json({
        success: true,
        materials: result.rows,
      });
    } catch (error) {
      logger.error("Error fetching materials:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

export default router;
