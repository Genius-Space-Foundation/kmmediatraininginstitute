import express from "express";
import { pool } from "../database/database";
import { authenticateToken } from "../middleware/auth";
import { firebaseService } from "../services/FirebaseService";
import { AuthRequest } from "../types";
import {
  CapstoneProject,
  CreateCapstoneProjectRequest,
  UpdateCapstoneProjectRequest,
  SubmitCapstoneProjectRequest,
} from "../types/enhanced-learning";

const router = express.Router();

// Create a new capstone project
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const {
      course_id,
      title,
      description,
      objectives,
      requirements,
      due_date,
      max_team_size,
    } = req.body as CreateCapstoneProjectRequest;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res
        .status(403)
        .json({ error: "Only trainers can create capstone projects" });
    }

    // Validate required fields
    if (
      !course_id ||
      !title ||
      !description ||
      !objectives ||
      !requirements ||
      !due_date
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO capstone_projects (course_id, trainer_id, title, description, objectives, requirements, due_date, max_team_size, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())
       RETURNING *`,
      [
        course_id,
        trainer_id,
        title,
        description,
        objectives,
        requirements,
        due_date,
        max_team_size || 1,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Capstone project created successfully",
    });
  } catch (error) {
    console.error("Error creating capstone project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all capstone projects for a course
router.get(
  "/course/:courseId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { courseId } = req.params;
      const { status } = req.query;
      const statusStr = Array.isArray(status)
        ? status[0]
        : typeof status === "string"
        ? status
        : undefined;

      let query = `
      SELECT cp.*, c.title as course_title, u.name as trainer_name
      FROM capstone_projects cp
      JOIN courses c ON cp.course_id = c.id
      JOIN users u ON cp.trainer_id = u.id
      WHERE cp.course_id = $1
    `;
      const params = [courseId];

      if (statusStr && typeof statusStr === "string") {
        query += " AND cp.status = $2";
        params.push(statusStr);
      }

      query += " ORDER BY cp.created_at DESC";

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        message: "Capstone projects retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching capstone projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get a specific capstone project
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT cp.*, c.title as course_title, u.name as trainer_name
       FROM capstone_projects cp
       JOIN courses c ON cp.course_id = c.id
       JOIN users u ON cp.trainer_id = u.id
       WHERE cp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Capstone project not found" });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: "Capstone project retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching capstone project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a capstone project
router.put("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      objectives,
      requirements,
      due_date,
      max_team_size,
      status,
    } = req.body as UpdateCapstoneProjectRequest;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res
        .status(403)
        .json({ error: "Only trainers can update capstone projects" });
    }

    // Check if project exists and belongs to the trainer
    const existingProject = await pool.query(
      "SELECT * FROM capstone_projects WHERE id = $1 AND trainer_id = $2",
      [id, trainer_id]
    );

    if (existingProject.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Capstone project not found or access denied" });
    }

    const result = await pool.query(
      `UPDATE capstone_projects 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           objectives = COALESCE($3, objectives),
           requirements = COALESCE($4, requirements),
           due_date = COALESCE($5, due_date),
           max_team_size = COALESCE($6, max_team_size),
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title,
        description,
        objectives,
        requirements,
        due_date,
        max_team_size,
        status,
        id,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: "Capstone project updated successfully",
    });
  } catch (error) {
    console.error("Error updating capstone project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit capstone project
router.post("/:id/submit", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { submission_text, team_members } =
      req.body as SubmitCapstoneProjectRequest;
    const student_id = req.user?.id;

    if (!student_id || req.user?.role !== "user") {
      return res
        .status(403)
        .json({ error: "Only students can submit capstone projects" });
    }

    // Check if project exists and is active
    const project = await pool.query(
      "SELECT * FROM capstone_projects WHERE id = $1 AND status = 'active'",
      [id]
    );

    if (project.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Capstone project not found or not active" });
    }

    // Check if student is enrolled in the course
    const enrollment = await pool.query(
      "SELECT * FROM enrollments WHERE course_id = $1 AND student_id = $2 AND status = 'active'",
      [project.rows[0].course_id, student_id]
    );

    if (enrollment.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Student not enrolled in this course" });
    }

    // Check if already submitted
    const existingSubmission = await pool.query(
      "SELECT * FROM capstone_submissions WHERE project_id = $1 AND student_id = $2",
      [id, student_id]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({ error: "Project already submitted" });
    }

    const result = await pool.query(
      `INSERT INTO capstone_submissions (project_id, student_id, submission_text, team_members, status, submitted_at)
       VALUES ($1, $2, $3, $4, 'submitted', NOW())
       RETURNING *`,
      [id, student_id, submission_text, team_members]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "Capstone project submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting capstone project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get capstone project submissions
router.get(
  "/:id/submissions",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const trainer_id = req.user?.id;

      if (!trainer_id || req.user?.role !== "trainer") {
        return res
          .status(403)
          .json({ error: "Only trainers can view submissions" });
      }

      // Check if project belongs to trainer
      const project = await pool.query(
        "SELECT * FROM capstone_projects WHERE id = $1 AND trainer_id = $2",
        [id, trainer_id]
      );

      if (project.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Capstone project not found or access denied" });
      }

      const result = await pool.query(
        `SELECT cs.*, u.name as student_name, u.email as student_email
       FROM capstone_submissions cs
       JOIN users u ON cs.student_id = u.id
       WHERE cs.project_id = $1
       ORDER BY cs.submitted_at DESC`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows,
        message: "Submissions retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Grade capstone project submission
router.put(
  "/submissions/:submissionId/grade",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;
      const trainer_id = req.user?.id;

      if (!trainer_id || req.user?.role !== "trainer") {
        return res
          .status(403)
          .json({ error: "Only trainers can grade submissions" });
      }

      // Check if submission exists and trainer has access
      const submission = await pool.query(
        `SELECT cs.*, cp.trainer_id
       FROM capstone_submissions cs
       JOIN capstone_projects cp ON cs.project_id = cp.id
       WHERE cs.id = $1 AND cp.trainer_id = $2`,
        [submissionId, trainer_id]
      );

      if (submission.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Submission not found or access denied" });
      }

      const result = await pool.query(
        `UPDATE capstone_submissions 
       SET grade = $1, feedback = $2, graded_at = NOW(), status = 'graded'
       WHERE id = $3
       RETURNING *`,
        [grade, feedback, submissionId]
      );

      res.json({
        success: true,
        data: result.rows[0],
        message: "Submission graded successfully",
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete capstone project
router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const trainer_id = req.user?.id;

    if (!trainer_id || req.user?.role !== "trainer") {
      return res
        .status(403)
        .json({ error: "Only trainers can delete capstone projects" });
    }

    // Check if project exists and belongs to trainer
    const project = await pool.query(
      "SELECT * FROM capstone_projects WHERE id = $1 AND trainer_id = $2",
      [id, trainer_id]
    );

    if (project.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Capstone project not found or access denied" });
    }

    await pool.query("DELETE FROM capstone_projects WHERE id = $1", [id]);

    res.json({
      success: true,
      message: "Capstone project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting capstone project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
