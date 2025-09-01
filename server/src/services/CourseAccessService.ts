import { pool } from "../database/database";
import { CourseAccess } from "../types";

class CourseAccessService {
  /**
   * Check if a student has access to a specific course
   */
  async hasAccess(studentId: number, courseId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT r.status 
         FROM registrations r 
         WHERE r."userId" = $1 AND r."courseId" = $2`,
        [studentId, courseId]
      );

      // Student has access if registration is approved
      return result.rows.length > 0 && result.rows[0].status === 'approved';
    } finally {
      client.release();
    }
  }

  /**
   * Get all courses a student has access to
   */
  async getStudentCourses(studentId: number): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT c.*, r.status as "registrationStatus", r."registrationDate"
         FROM courses c
         JOIN registrations r ON c.id = r."courseId"
         WHERE r."userId" = $1 AND r.status = 'approved'
         ORDER BY r."registrationDate" DESC`,
        [studentId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Grant access to a student for a course (admin function)
   */
  async grantAccess(studentId: number, courseId: number, grantedBy: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE registrations 
         SET status = 'approved', "updatedAt" = CURRENT_TIMESTAMP
         WHERE "userId" = $1 AND "courseId" = $2`,
        [studentId, courseId]
      );

      console.log(`✅ Access granted to student ${studentId} for course ${courseId} by admin ${grantedBy}`);
    } finally {
      client.release();
    }
  }

  /**
   * Revoke access from a student for a course (admin function)
   */
  async revokeAccess(studentId: number, courseId: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE registrations 
         SET status = 'rejected', "updatedAt" = CURRENT_TIMESTAMP
         WHERE "userId" = $1 AND "courseId" = $2`,
        [studentId, courseId]
      );

      console.log(`❌ Access revoked from student ${studentId} for course ${courseId}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get students who have access to a specific course
   */
  async getCourseStudents(courseId: number): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u."firstName", u."lastName", u.email, u.phone,
                r.status, r."registrationDate", r."updatedAt"
         FROM users u
         JOIN registrations r ON u.id = r."userId"
         WHERE r."courseId" = $1 AND r.status = 'approved'
         ORDER BY r."registrationDate" DESC`,
        [courseId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Get pending registrations for a course (admin function)
   */
  async getPendingRegistrations(courseId: number): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT u.id, u."firstName", u."lastName", u.email, u.phone,
                r.status, r."registrationDate", r.notes
         FROM users u
         JOIN registrations r ON u.id = r."userId"
         WHERE r."courseId" = $1 AND r.status = 'pending'
         ORDER BY r."registrationDate" ASC`,
        [courseId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }
}

export const courseAccessService = new CourseAccessService();







