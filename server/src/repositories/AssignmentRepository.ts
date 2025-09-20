import { BaseRepository } from "./BaseRepository";
import { Assignment, AssignmentSubmission } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export class AssignmentRepository extends BaseRepository {
  async findById(id: string): Promise<Assignment | null> {
    const query = `
      SELECT a.*, u.first_name, u.last_name, u.email as created_by_email
      FROM assignments a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `;
    return this.queryOne<Assignment>(query, [id]);
  }

  async findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<Assignment[]> {
    let query = `
      SELECT a.*, u.first_name, u.last_name, u.email as created_by_email,
             COUNT(s.id) as submissions_count
      FROM assignments a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE a.course_id = $1 AND a.is_active = true
      GROUP BY a.id, u.first_name, u.last_name, u.email
    `;

    const params: any[] = [courseId];

    if (pagination?.sort) {
      query += ` ORDER BY a.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY a.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<Assignment>(query, params);
  }

  async findByStudentId(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<Assignment[]> {
    let query = `
      SELECT DISTINCT a.*, c.title as course_title, c.image_url as course_image,
             s.id as submission_id, s.status as submission_status, s.grade,
             s.submitted_at, s.feedback
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN course_registrations cr ON c.id = cr.course_id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = $1
      WHERE cr.student_id = $1 AND a.is_active = true
    `;

    const params: any[] = [studentId];

    if (pagination?.sort) {
      query += ` ORDER BY a.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY a.due_date ASC NULLS LAST`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<Assignment>(query, params);
  }

  async findUpcoming(
    studentId: string,
    days: number = 7
  ): Promise<Assignment[]> {
    const query = `
      SELECT a.*, c.title as course_title, c.image_url as course_image,
             s.id as submission_id, s.status as submission_status
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      JOIN course_registrations cr ON c.id = cr.course_id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.student_id = $1
      WHERE cr.student_id = $1 
        AND a.is_active = true 
        AND a.due_date IS NOT NULL
        AND a.due_date <= CURRENT_TIMESTAMP + INTERVAL '${days} days'
        AND a.due_date > CURRENT_TIMESTAMP
        AND (s.id IS NULL OR s.status = 'submitted')
      ORDER BY a.due_date ASC
    `;
    return this.query<Assignment>(query, [studentId]);
  }

  async create(
    assignment: Omit<Assignment, "id" | "created_at" | "updated_at">
  ): Promise<Assignment> {
    const query = `
      INSERT INTO assignments (course_id, title, description, instructions, due_date, 
                             max_points, assignment_type, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      assignment.course_id,
      assignment.title,
      assignment.description,
      assignment.instructions,
      assignment.due_date,
      assignment.max_points,
      assignment.assignment_type,
      assignment.is_active,
      assignment.created_by,
    ];
    return this.queryOne<Assignment>(query, params);
  }

  async update(
    id: string,
    updates: Partial<Assignment>
  ): Promise<Assignment | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE assignments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof Assignment]),
    ];
    return this.queryOne<Assignment>(query, params);
  }

  async delete(id: string): Promise<boolean> {
    const query = "UPDATE assignments SET is_active = false WHERE id = $1";
    const result = await this.query(query, [id]);
    return result.rowCount > 0;
  }

  async countByCourseId(courseId: string): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM assignments WHERE course_id = $1 AND is_active = true";
    const result = await this.queryOne<{ count: string }>(query, [courseId]);
    return parseInt(result.count);
  }

  // Assignment Submission methods
  async findSubmissionById(id: string): Promise<AssignmentSubmission | null> {
    const query = `
      SELECT s.*, a.title as assignment_title, a.max_points,
             u.first_name, u.last_name, u.email as student_email
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN users u ON s.student_id = u.id
      WHERE s.id = $1
    `;
    return this.queryOne<AssignmentSubmission>(query, [id]);
  }

  async findSubmissionsByAssignment(
    assignmentId: string,
    pagination?: PaginationParams
  ): Promise<AssignmentSubmission[]> {
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email as student_email,
             a.title as assignment_title, a.max_points
      FROM assignment_submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.assignment_id = $1
    `;

    const params: any[] = [assignmentId];

    if (pagination?.sort) {
      query += ` ORDER BY s.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY s.submitted_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<AssignmentSubmission>(query, params);
  }

  async findSubmissionByStudentAndAssignment(
    studentId: string,
    assignmentId: string
  ): Promise<AssignmentSubmission | null> {
    const query = `
      SELECT s.*, a.title as assignment_title, a.max_points
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = $1 AND s.assignment_id = $2
    `;
    return this.queryOne<AssignmentSubmission>(query, [
      studentId,
      assignmentId,
    ]);
  }

  async createSubmission(
    submission: Omit<AssignmentSubmission, "id" | "created_at" | "updated_at">
  ): Promise<AssignmentSubmission> {
    const query = `
      INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, 
                                        file_url, file_name, submitted_at, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      submission.assignment_id,
      submission.student_id,
      submission.submission_text,
      submission.file_url,
      submission.file_name,
      submission.submitted_at,
      submission.status,
    ];
    return this.queryOne<AssignmentSubmission>(query, params);
  }

  async updateSubmission(
    id: string,
    updates: Partial<AssignmentSubmission>
  ): Promise<AssignmentSubmission | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE assignment_submissions 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof AssignmentSubmission]),
    ];
    return this.queryOne<AssignmentSubmission>(query, params);
  }

  async gradeSubmission(
    id: string,
    grade: number,
    feedback: string,
    gradedBy: string
  ): Promise<AssignmentSubmission | null> {
    const query = `
      UPDATE assignment_submissions 
      SET grade = $2, feedback = $3, graded_by = $4, graded_at = CURRENT_TIMESTAMP, 
          status = 'graded', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    return this.queryOne<AssignmentSubmission>(query, [
      id,
      grade,
      feedback,
      gradedBy,
    ]);
  }
}



