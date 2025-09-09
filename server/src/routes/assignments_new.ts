import { Router } from 'express';
import { pool } from '../database/database';
import { authenticateToken } from '../middleware/auth';
import { Assignment, StudentSubmission } from '../types/assignments';
import { AuthRequest } from '../types';

const router = Router();

// Create a new assignment (trainer only)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (!req.user || req.user.role !== 'trainer') {
            return res.status(403).json({
                success: false,
                message: 'Only trainers can create assignments'
            });
        }

        const { title, description, courseId, dueDate, maxScore, allowLateSubmission, latePenalty } = req.body;

        const result = await pool.query(
            'INSERT INTO assignments (title, description, course_id, due_date, max_score, allow_late_submission, late_penalty, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *',
            [title, description, courseId, dueDate, maxScore, allowLateSubmission, latePenalty]
        );

        res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create assignment'
        });
    }
});

// Get all assignments for a course
router.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { courseId } = req.params;

        const assignments = await pool.query(
            'SELECT * FROM assignments WHERE course_id = $1 ORDER BY due_date ASC',
            [courseId]
        );

        res.json({
            success: true,
            data: assignments.rows
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignments'
        });
    }
});

// Submit an assignment (student only)
router.post('/:id/submit', authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (!req.user || req.user.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Only students can submit assignments'
            });
        }

        const { id } = req.params;
        const { fileUrl, fileName } = req.body;

        const assignmentResult = await pool.query('SELECT * FROM assignments WHERE id = $1', [id]);
        const assignment = assignmentResult.rows[0];

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        const submissionDate = new Date();
        const isLate = submissionDate > new Date(assignment.due_date);

        if (isLate && !assignment.allow_late_submission) {
            return res.status(400).json({
                success: false,
                message: 'Late submissions are not allowed for this assignment'
            });
        }

        const status = isLate ? 'late' : 'submitted';

        const result = await pool.query(
            'INSERT INTO student_submissions (assignment_id, student_id, submission_date, file_url, file_name, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
            [id, req.user.id, submissionDate, fileUrl, fileName, status]
        );

        res.status(201).json({
            success: true,
            message: 'Assignment submitted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit assignment'
        });
    }
});

// Grade a submission (trainer only)
router.post('/submissions/:id/grade', authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (!req.user || req.user.role !== 'trainer') {
            return res.status(403).json({
                success: false,
                message: 'Only trainers can grade submissions'
            });
        }

        const { id } = req.params;
        const { grade, feedback } = req.body;

        if (grade < 0 || grade > 100) {
            return res.status(400).json({
                success: false,
                message: 'Grade must be between 0 and 100'
            });
        }

        const result = await pool.query(
            'UPDATE student_submissions SET grade = $1, feedback = $2, graded_by = $3, graded_at = NOW(), status = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [grade, feedback, req.user.id, 'graded', id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Submission graded successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to grade submission'
        });
    }
});

// Get submissions for an assignment (trainer only)
router.get('/:id/submissions', authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (!req.user || req.user.role !== 'trainer') {
            return res.status(403).json({
                success: false,
                message: 'Only trainers can view all submissions'
            });
        }

        const { id } = req.params;

        const submissions = await pool.query(
            'SELECT s.*, CONCAT(u.first_name, \' \', u.last_name) as student_name FROM student_submissions s JOIN users u ON s.student_id = u.id WHERE s.assignment_id = $1 ORDER BY s.submission_date DESC',
            [id]
        );

        res.json({
            success: true,
            data: submissions.rows
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions'
        });
    }
});

// Get student's own submissions
router.get('/my-submissions', authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (!req.user || req.user.role !== 'user') {
            return res.status(403).json({
                success: false,
                message: 'Only students can view their submissions'
            });
        }

        const submissions = await pool.query(
            'SELECT s.*, a.title as assignment_title, a.due_date FROM student_submissions s JOIN assignments a ON s.assignment_id = a.id WHERE s.student_id = $1 ORDER BY s.submission_date DESC',
            [req.user.id]
        );

        res.json({
            success: true,
            data: submissions.rows
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions'
        });
    }
});

export default router;