// routes/courseMaterials.ts
// TODO: This file needs to be migrated to use Firestore instead of PostgreSQL
// For now, commenting out to allow server to start
/*
import express from "express";
import multer from "multer";
// import { storage } from "../config/firebase"; // TODO: Fix Firebase storage import
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../middleware/auth";
import { checkRole } from "../middleware/checkRole";
// import { pool } from "../database/database"; // Removed - using Firestore now
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";
import { AuthRequest, AuthenticatedRequest } from "../types";

const router = express.Router();

// Configure Firebase Storage (lazy initialization)
let firebaseBucket: any = null;

const getFirebaseBucket = () => {
  if (!firebaseBucket) {
    try {
      // firebaseBucket = storage.bucket(); // TODO: Fix Firebase storage initialization
    } catch (error) {
      console.warn(
        "Firebase not available:",
        error instanceof Error ? error.message : "Unknown error"
      );
      return null;
    }
  }
  return firebaseBucket;
};

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Get all modules for a course
router.get(
  "/courses/:courseId/modules",
  authenticateToken,
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId } = req.params;

      // Validate parameters
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      // Get all modules with their materials
      const modulesResult = await pool.query(
        `SELECT m.*, 
        COALESCE(json_agg(
          CASE WHEN cm.id IS NOT NULL THEN 
            json_build_object(
              'id', cm.id,
              'title', cm.title,
              'description', cm.description,
              'fileUrl', cm.file_url,
              'fileType', cm.file_type,
              'fileSize', cm.file_size,
              'fileName', cm.file_name,
              'isPublic', cm.is_public,
              'downloadCount', cm.download_count,
              'viewCount', cm.view_count,
              'createdAt', cm.created_at
            )
          ELSE NULL END
        ) FILTER (WHERE cm.id IS NOT NULL), '[]') as materials
      FROM course_modules m
      LEFT JOIN course_materials cm ON m.id = cm.module_id
      WHERE m.course_id = $1
      GROUP BY m.id
      ORDER BY m.order_number`,
        [courseId]
      );

      res.json({ success: true, modules: modulesResult.rows });
    } catch (error) {
      logger.error("Error fetching modules:", error);
      next(new AppError("Failed to fetch modules", 500));
    }
  }
);

// Create a new module
router.post(
  "/courses/:courseId/modules",
  authenticateToken,
  checkRole(["trainer", "admin"]),
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId } = req.params;
      const { name, description, order } = req.body;

      // Validate required fields
      if (!name) {
        throw new AppError("Module name is required", 400);
      }
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (order !== undefined && isNaN(Number(order))) {
        throw new AppError("Order must be a valid number", 400);
      }
      // Verify course exists and user has access
      const courseCheck = await pool.query(
        "SELECT id FROM courses WHERE id = $1 AND (trainer_id = $2 OR $3 = true)",
        [
          courseId,
          authenticatedReq.user.id,
          authenticatedReq.user.role === "admin",
        ]
      );

      if (courseCheck.rows.length === 0) {
        throw new AppError("Course not found or access denied", 404);
      }

      const result = await pool.query(
        "INSERT INTO course_modules (course_id, name, description, order_number) VALUES ($1, $2, $3, $4) RETURNING *",
        [courseId, name, description, order]
      );

      res.status(201).json({ success: true, module: result.rows[0] });
    } catch (error) {
      logger.error("Error creating module:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to create module", 500)
      );
    }
  }
);

// Delete a module
router.delete(
  "/courses/:courseId/modules/:moduleId",
  authenticateToken,
  checkRole(["trainer", "admin"]),
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId, moduleId } = req.params;

      // Validate parameters
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (!moduleId || isNaN(Number(moduleId))) {
        throw new AppError("Valid moduleId is required", 400);
      }
      // Verify access and delete module
      const result = await pool.query(
        "DELETE FROM course_modules WHERE id = $1 AND course_id = $2 AND EXISTS (SELECT 1 FROM courses WHERE id = $2 AND (trainer_id = $3 OR $4 = true)) RETURNING *",
        [
          moduleId,
          courseId,
          authenticatedReq.user.id,
          authenticatedReq.user.role === "admin",
        ]
      );

      if (result.rows.length === 0) {
        throw new AppError("Module not found or access denied", 404);
      }

      res.json({ success: true, message: "Module deleted successfully" });
    } catch (error) {
      logger.error("Error deleting module:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to delete module", 500)
      );
    }
  }
);

// Upload material to a module
router.post(
  "/courses/:courseId/materials",
  authenticateToken,
  checkRole(["trainer", "admin"]),
  upload.single("file"),
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId } = req.params;
      const { title, description, moduleId, isPublic } = req.body;
      const file = authenticatedReq.file;

      // Validate required fields
      if (!file) {
        throw new AppError("No file uploaded", 400);
      }
      if (!title || !moduleId) {
        throw new AppError("Title and moduleId are required", 400);
      }
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (!moduleId || isNaN(Number(moduleId))) {
        throw new AppError("Valid moduleId is required", 400);
      }

      // Validate file type
      const allowedTypes = [
        "image/",
        "video/",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument",
        "text/",
      ];
      if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
        throw new AppError("File type not allowed", 400);
      }
      // Verify module exists and user has access
      const moduleCheck = await pool.query(
        "SELECT m.id FROM course_modules m JOIN courses c ON m.course_id = c.id WHERE m.id = $1 AND c.id = $2 AND (c.trainer_id = $3 OR $4 = true)",
        [
          moduleId,
          courseId,
          authenticatedReq.user.id,
          authenticatedReq.user.role === "admin",
        ]
      );

      if (moduleCheck.rows.length === 0) {
        throw new AppError("Module not found or access denied", 404);
      }

      // Upload to Firebase Storage
      const fileName = `course-materials/${courseId}/${moduleId}/${uuidv4()}-${
        file.originalname
      }`;
      const bucket = getFirebaseBucket();
      if (!bucket) {
        throw new AppError(
          "File upload not available - Firebase not configured",
          503
        );
      }
      const firebaseFile = bucket.file(fileName);

      await firebaseFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Make file publicly accessible
      await firebaseFile.makePublic();

      const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;

      // Save material info to database
      const result = await pool.query(
        "INSERT INTO course_materials (module_id, title, description, file_url, file_type, file_size, file_name, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          moduleId,
          title,
          description,
          publicUrl,
          file.mimetype,
          file.size,
          file.originalname,
          isPublic === "true",
        ]
      );

      res.status(201).json({ success: true, material: result.rows[0] });
    } catch (error) {
      logger.error("Error uploading material:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to upload material", 500)
      );
    }
  }
);

// Delete material
router.delete(
  "/courses/:courseId/materials/:materialId",
  authenticateToken,
  checkRole(["trainer", "admin"]),
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId, materialId } = req.params;

      // Validate parameters
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (!materialId || isNaN(Number(materialId))) {
        throw new AppError("Valid materialId is required", 400);
      }
      // Get material info
      const materialResult = await pool.query(
        "SELECT cm.*, m.course_id FROM course_materials cm JOIN course_modules m ON cm.module_id = m.id WHERE cm.id = $1 AND m.course_id = $2",
        [materialId, courseId]
      );

      if (materialResult.rows.length === 0) {
        throw new AppError("Material not found", 404);
      }

      const material = materialResult.rows[0];

      // Verify access
      const accessCheck = await pool.query(
        "SELECT 1 FROM courses WHERE id = $1 AND (trainer_id = $2 OR $3 = true)",
        [
          courseId,
          authenticatedReq.user.id,
          authenticatedReq.user.role === "admin",
        ]
      );

      if (accessCheck.rows.length === 0) {
        throw new AppError("Access denied", 403);
      }

      // Delete from Firebase Storage
      let fileName: string;
      try {
        const url = new URL(material.file_url);
        // Extract filename from Firebase Storage URL
        const pathParts = url.pathname.split("/");
        fileName = pathParts.slice(2).join("/"); // Remove /v0/b/{bucket}/o/ prefix
      } catch (error) {
        logger.error("Invalid Firebase Storage URL format:", material.file_url);
        throw new AppError("Invalid file URL format", 500);
      }

      const bucket = getFirebaseBucket();
      if (!bucket) {
        throw new AppError(
          "File deletion not available - Firebase not configured",
          503
        );
      }
      const firebaseFile = bucket.file(fileName);
      await firebaseFile.delete();

      // Delete from database
      await pool.query("DELETE FROM course_materials WHERE id = $1", [
        materialId,
      ]);

      res.json({ success: true, message: "Material deleted successfully" });
    } catch (error) {
      logger.error("Error deleting material:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to delete material", 500)
      );
    }
  }
);

// Toggle material visibility
router.patch(
  "/courses/:courseId/materials/:materialId",
  authenticateToken,
  checkRole(["trainer", "admin"]),
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId, materialId } = req.params;
      const { isPublic } = req.body;

      // Validate parameters
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (!materialId || isNaN(Number(materialId))) {
        throw new AppError("Valid materialId is required", 400);
      }
      if (typeof isPublic !== "boolean") {
        throw new AppError("isPublic must be a boolean value", 400);
      }
      // Update visibility and verify access
      const result = await pool.query(
        `UPDATE course_materials cm 
      SET is_public = $1 
      FROM course_modules m, courses c 
      WHERE cm.id = $2 
      AND cm.module_id = m.id 
      AND m.course_id = c.id 
      AND c.id = $3 
      AND (c.trainer_id = $4 OR $5 = true) 
      RETURNING cm.*`,
        [
          isPublic,
          materialId,
          courseId,
          authenticatedReq.user.id,
          authenticatedReq.user.role === "admin",
        ]
      );

      if (result.rows.length === 0) {
        throw new AppError("Material not found or access denied", 404);
      }

      res.json({ success: true, material: result.rows[0] });
    } catch (error) {
      logger.error("Error updating material visibility:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to update material visibility", 500)
      );
    }
  }
);

// Track material download
router.post(
  "/courses/:courseId/materials/:materialId/download",
  authenticateToken,
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId, materialId } = req.params;

      // Validate parameters
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (!materialId || isNaN(Number(materialId))) {
        throw new AppError("Valid materialId is required", 400);
      }
      // Verify access and update download count
      const result = await pool.query(
        `UPDATE course_materials cm 
      SET download_count = download_count + 1 
      FROM course_modules m 
      WHERE cm.id = $1 
      AND cm.module_id = m.id 
      AND m.course_id = $2 
      AND (cm.is_public = true OR EXISTS (
        SELECT 1 FROM course_enrollments ce 
        WHERE ce.course_id = $2 
        AND ce.student_id = $3
      )) 
      RETURNING cm.*`,
        [materialId, courseId, authenticatedReq.user.id]
      );

      if (result.rows.length === 0) {
        throw new AppError("Material not found or access denied", 404);
      }

      res.json({ success: true, material: result.rows[0] });
    } catch (error) {
      logger.error("Error tracking download:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to track download", 500)
      );
    }
  }
);

// Track material view
router.post(
  "/courses/:courseId/materials/:materialId/view",
  authenticateToken,
  async (req, res, next) => {
    const authenticatedReq = req as AuthenticatedRequest;
    try {
      const { courseId, materialId } = req.params;

      // Validate parameters
      if (!courseId || isNaN(Number(courseId))) {
        throw new AppError("Valid courseId is required", 400);
      }
      if (!materialId || isNaN(Number(materialId))) {
        throw new AppError("Valid materialId is required", 400);
      }
      // Verify access and update view count
      const result = await pool.query(
        `UPDATE course_materials cm 
      SET view_count = view_count + 1 
      FROM course_modules m 
      WHERE cm.id = $1 
      AND cm.module_id = m.id 
      AND m.course_id = $2 
      AND (cm.is_public = true OR EXISTS (
        SELECT 1 FROM course_enrollments ce 
        WHERE ce.course_id = $2 
        AND ce.student_id = $3
      )) 
      RETURNING cm.*`,
        [materialId, courseId, authenticatedReq.user.id]
      );

      if (result.rows.length === 0) {
        throw new AppError("Material not found or access denied", 404);
      }

      res.json({ success: true, material: result.rows[0] });
    } catch (error) {
      logger.error("Error tracking view:", error);
      next(
        error instanceof AppError
          ? error
          : new AppError("Failed to track view", 500)
      );
    }
  }
);

export default router;
*/

// Temporary simple router for course materials
import express from "express";
const router = express.Router();

// TODO: Implement Firestore-based course materials endpoints
router.get("/", (req, res) => {
  res.json({
    message: "Course materials endpoint - Firestore migration pending",
  });
});

export default router;
