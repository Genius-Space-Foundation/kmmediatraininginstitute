const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { checkRole } = require('../middleware/checkRole');

// Configure S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
});

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:chris00@localhost:5432/kmmedia',
});

// Get all modules for a course
router.get('/courses/:courseId/modules', auth, async (req, res) => {
    const { courseId } = req.params;

    try {
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

        res.json({ modules: modulesResult.rows });
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ message: 'Failed to fetch modules' });
    }
});

// Create a new module
router.post('/courses/:courseId/modules', auth, checkRole(['trainer', 'admin']), async (req, res) => {
    const { courseId } = req.params;
    const { name, description, order } = req.body;

    try {
        // Verify course exists and user has access
        const courseCheck = await pool.query(
            'SELECT id FROM courses WHERE id = $1 AND (trainer_id = $2 OR $3 = true)',
            [courseId, req.user.id, req.user.role === 'admin']
        );

        if (courseCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found or access denied' });
        }

        const result = await pool.query(
            'INSERT INTO course_modules (course_id, name, description, order_number) VALUES ($1, $2, $3, $4) RETURNING *',
            [courseId, name, description, order]
        );

        res.status(201).json({ module: result.rows[0] });
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({ message: 'Failed to create module' });
    }
});

// Delete a module
router.delete('/courses/:courseId/modules/:moduleId', auth, checkRole(['trainer', 'admin']), async (req, res) => {
    const { courseId, moduleId } = req.params;

    try {
        // Verify access and delete module
        const result = await pool.query(
            'DELETE FROM course_modules WHERE id = $1 AND course_id = $2 AND EXISTS (SELECT 1 FROM courses WHERE id = $2 AND (trainer_id = $3 OR $4 = true)) RETURNING *',
            [moduleId, courseId, req.user.id, req.user.role === 'admin']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Module not found or access denied' });
        }

        res.json({ message: 'Module deleted successfully' });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({ message: 'Failed to delete module' });
    }
});

// Upload material to a module
router.post('/courses/:courseId/materials', auth, checkRole(['trainer', 'admin']), upload.single('file'), async (req, res) => {
    const { courseId } = req.params;
    const { title, description, moduleId, isPublic } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Verify module exists and user has access
        const moduleCheck = await pool.query(
            'SELECT m.id FROM course_modules m JOIN courses c ON m.course_id = c.id WHERE m.id = $1 AND c.id = $2 AND (c.trainer_id = $3 OR $4 = true)',
            [moduleId, courseId, req.user.id, req.user.role === 'admin']
        );

        if (moduleCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Module not found or access denied' });
        }

        // Upload to S3
        const fileKey = `course-materials/${courseId}/${moduleId}/${uuidv4()}-${file.originalname}`;
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        // Save material info to database
        const result = await pool.query(
            'INSERT INTO course_materials (module_id, title, description, file_url, file_type, file_size, file_name, is_public) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
                moduleId,
                title,
                description,
                `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
                file.mimetype,
                file.size,
                file.originalname,
                isPublic === 'true',
            ]
        );

        res.status(201).json({ material: result.rows[0] });
    } catch (error) {
        console.error('Error uploading material:', error);
        res.status(500).json({ message: 'Failed to upload material' });
    }
});

// Delete material
router.delete('/courses/:courseId/materials/:materialId', auth, checkRole(['trainer', 'admin']), async (req, res) => {
    const { courseId, materialId } = req.params;

    try {
        // Get material info
        const materialResult = await pool.query(
            'SELECT cm.*, m.course_id FROM course_materials cm JOIN course_modules m ON cm.module_id = m.id WHERE cm.id = $1 AND m.course_id = $2',
            [materialId, courseId]
        );

        if (materialResult.rows.length === 0) {
            return res.status(404).json({ message: 'Material not found' });
        }

        const material = materialResult.rows[0];

        // Verify access
        const accessCheck = await pool.query(
            'SELECT 1 FROM courses WHERE id = $1 AND (trainer_id = $2 OR $3 = true)',
            [courseId, req.user.id, req.user.role === 'admin']
        );

        if (accessCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Delete from S3
        const fileKey = material.file_url.split('.com/')[1];
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey,
        }));

        // Delete from database
        await pool.query('DELETE FROM course_materials WHERE id = $1', [materialId]);

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ message: 'Failed to delete material' });
    }
});

// Toggle material visibility
router.patch('/courses/:courseId/materials/:materialId', auth, checkRole(['trainer', 'admin']), async (req, res) => {
    const { courseId, materialId } = req.params;
    const { isPublic } = req.body;

    try {
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
            [isPublic, materialId, courseId, req.user.id, req.user.role === 'admin']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Material not found or access denied' });
        }

        res.json({ material: result.rows[0] });
    } catch (error) {
        console.error('Error updating material visibility:', error);
        res.status(500).json({ message: 'Failed to update material visibility' });
    }
});

// Track material download
router.post('/courses/:courseId/materials/:materialId/download', auth, async (req, res) => {
    const { courseId, materialId } = req.params;

    try {
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
            [materialId, courseId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Material not found or access denied' });
        }

        res.json({ material: result.rows[0] });
    } catch (error) {
        console.error('Error tracking download:', error);
        res.status(500).json({ message: 'Failed to track download' });
    }
});

// Track material view
router.post('/courses/:courseId/materials/:materialId/view', auth, async (req, res) => {
    const { courseId, materialId } = req.params;

    try {
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
            [materialId, courseId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Material not found or access denied' });
        }

        res.json({ material: result.rows[0] });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ message: 'Failed to track view' });
    }
});

module.exports = router;