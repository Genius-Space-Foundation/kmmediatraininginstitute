import express from "express";
import { pool } from "../database/database";
import { authenticateToken } from "../middleware/auth";
import { FirebaseService } from "../services/FirebaseService";
import {
  IndustrialAttachment,
  CreateIndustrialAttachmentRequest,
  UpdateIndustrialAttachmentRequest,
  ApplyAttachmentRequest,
} from "../types/enhanced-learning";

const router = express.Router();
const firebaseService = new FirebaseService();

// Create a new industrial attachment opportunity
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      course_id,
      company_name,
      position_title,
      description,
      requirements,
      duration_weeks,
      start_date,
      end_date,
      location,
      stipend,
      max_students,
    } = req.body as CreateIndustrialAttachmentRequest;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res.status(403).json({
        error: "Only trainers can create industrial attachment opportunities",
      });
    }

    // Validate required fields
    if (
      !course_id ||
      !company_name ||
      !position_title ||
      !description ||
      !requirements ||
      !duration_weeks ||
      !start_date ||
      !end_date ||
      !location
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO industrial_attachments (course_id, trainer_id, company_name, position_title, description, requirements, duration_weeks, start_date, end_date, location, stipend, max_students, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', NOW())
       RETURNING *`,
      [
        course_id,
        trainer_id,
        company_name,
        position_title,
        description,
        requirements,
        duration_weeks,
        start_date,
        end_date,
        location,
        stipend,
        max_students || 1,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Industrial attachment opportunity created successfully",
    });
  } catch (error) {
    console.error("Error creating industrial attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all industrial attachments for a course
router.get("/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;

    let query = `
      SELECT ia.*, c.title as course_title, u.name as trainer_name
      FROM industrial_attachments ia
      JOIN courses c ON ia.course_id = c.id
      JOIN users u ON ia.trainer_id = u.id
      WHERE ia.course_id = $1
    `;
    const params = [courseId];

    if (status) {
      query += " AND ia.status = $2";
      params.push(status);
    }

    query += " ORDER BY ia.created_at DESC";

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      message: "Industrial attachments retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching industrial attachments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific industrial attachment
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ia.*, c.title as course_title, u.name as trainer_name
       FROM industrial_attachments ia
       JOIN courses c ON ia.course_id = c.id
       JOIN users u ON ia.trainer_id = u.id
       WHERE ia.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Industrial attachment not found" });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: "Industrial attachment retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching industrial attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an industrial attachment
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      position_title,
      description,
      requirements,
      duration_weeks,
      start_date,
      end_date,
      location,
      stipend,
      max_students,
      status,
    } = req.body as UpdateIndustrialAttachmentRequest;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res
        .status(403)
        .json({ error: "Only trainers can update industrial attachments" });
    }

    // Check if attachment exists and belongs to the trainer
    const existingAttachment = await pool.query(
      "SELECT * FROM industrial_attachments WHERE id = $1 AND trainer_id = $2",
      [id, trainer_id]
    );

    if (existingAttachment.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Industrial attachment not found or access denied" });
    }

    const result = await pool.query(
      `UPDATE industrial_attachments 
       SET company_name = COALESCE($1, company_name),
           position_title = COALESCE($2, position_title),
           description = COALESCE($3, description),
           requirements = COALESCE($4, requirements),
           duration_weeks = COALESCE($5, duration_weeks),
           start_date = COALESCE($6, start_date),
           end_date = COALESCE($7, end_date),
           location = COALESCE($8, location),
           stipend = COALESCE($9, stipend),
           max_students = COALESCE($10, max_students),
           status = COALESCE($11, status),
           updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [
        company_name,
        position_title,
        description,
        requirements,
        duration_weeks,
        start_date,
        end_date,
        location,
        stipend,
        max_students,
        status,
        id,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: "Industrial attachment updated successfully",
    });
  } catch (error) {
    console.error("Error updating industrial attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Apply for industrial attachment
router.post("/:id/apply", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { cover_letter, resume_url, portfolio_url } =
      req.body as ApplyAttachmentRequest;
    const student_id = req.user?.id;

    if (!student_id || req.user?.role !== "user") {
      return res
        .status(403)
        .json({ error: "Only students can apply for industrial attachments" });
    }

    // Check if attachment exists and is active
    const attachment = await pool.query(
      "SELECT * FROM industrial_attachments WHERE id = $1 AND status = 'active'",
      [id]
    );

    if (attachment.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Industrial attachment not found or not active" });
    }

    // Check if student is enrolled in the course
    const enrollment = await pool.query(
      "SELECT * FROM enrollments WHERE course_id = $1 AND student_id = $2 AND status = 'active'",
      [attachment.rows[0].course_id, student_id]
    );

    if (enrollment.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Student not enrolled in this course" });
    }

    // Check if already applied
    const existingApplication = await pool.query(
      "SELECT * FROM attachment_applications WHERE attachment_id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (existingApplication.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Already applied for this attachment" });
    }

    // Check if there are available spots
    const currentApplications = await pool.query(
      "SELECT COUNT(*) as count FROM attachment_applications WHERE attachment_id = $1 AND status IN ('pending', 'accepted')",
      [id]
    );

    if (
      parseInt(currentApplications.rows[0].count) >=
      attachment.rows[0].max_students
    ) {
      return res
        .status(400)
        .json({ error: "No available spots for this attachment" });
    }

    const result = await pool.query(
      `INSERT INTO attachment_applications (attachment_id, student_id, cover_letter, resume_url, portfolio_url, status, applied_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING *`,
      [id, student_id, cover_letter, resume_url, portfolio_url]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error applying for attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get attachment applications
router.get("/:id/applications", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res
        .status(403)
        .json({ error: "Only trainers can view applications" });
    }

    // Check if attachment belongs to trainer
    const attachment = await pool.query(
      "SELECT * FROM industrial_attachments WHERE id = $1 AND trainer_id = $2",
      [id, trainer_id]
    );

    if (attachment.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Industrial attachment not found or access denied" });
    }

    const result = await pool.query(
      `SELECT aa.*, u.name as student_name, u.email as student_email
       FROM attachment_applications aa
       JOIN users u ON aa.student_id = u.id
       WHERE aa.attachment_id = $1
       ORDER BY aa.applied_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
      message: "Applications retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Review attachment application
router.put(
  "/applications/:applicationId/review",
  authenticateToken,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, feedback } = req.body;
      const trainer_id = req.user?.id;

      if (!trainer_id || req.user?.role !== "trainer") {
        return res
          .status(403)
          .json({ error: "Only trainers can review applications" });
      }

      // Check if application exists and trainer has access
      const application = await pool.query(
        `SELECT aa.*, ia.trainer_id
       FROM attachment_applications aa
       JOIN industrial_attachments ia ON aa.attachment_id = ia.id
       WHERE aa.id = $1 AND ia.trainer_id = $2`,
        [applicationId, trainer_id]
      );

      if (application.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Application not found or access denied" });
      }

      const result = await pool.query(
        `UPDATE attachment_applications 
       SET status = $1, feedback = $2, reviewed_at = NOW()
       WHERE id = $3
       RETURNING *`,
        [status, feedback, applicationId]
      );

      res.json({
        success: true,
        data: result.rows[0],
        message: "Application reviewed successfully",
      });
    } catch (error) {
      console.error("Error reviewing application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get student's attachment applications
router.get("/student/applications", authenticateToken, async (req, res) => {
  try {
    const student_id = req.user?.id;

    if (!student_id || req.user?.role !== "user") {
      return res
        .status(403)
        .json({ error: "Only students can view their applications" });
    }

    const result = await pool.query(
      `SELECT aa.*, ia.company_name, ia.position_title, ia.location, ia.start_date, ia.end_date
       FROM attachment_applications aa
       JOIN industrial_attachments ia ON aa.attachment_id = ia.id
       WHERE aa.student_id = $1
       ORDER BY aa.applied_at DESC`,
      [student_id]
    );

    res.json({
      success: true,
      data: result.rows,
      message: "Applications retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete industrial attachment
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res
        .status(403)
        .json({ error: "Only trainers can delete industrial attachments" });
    }

    // Check if attachment exists and belongs to trainer
    const attachment = await pool.query(
      "SELECT * FROM industrial_attachments WHERE id = $1 AND trainer_id = $2",
      [id, trainer_id]
    );

    if (attachment.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Industrial attachment not found or access denied" });
    }

    await pool.query("DELETE FROM industrial_attachments WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Industrial attachment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting industrial attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
