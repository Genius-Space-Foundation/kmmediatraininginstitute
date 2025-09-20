import { UserRepository } from "../repositories/UserRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { AssignmentRepository } from "../repositories/AssignmentRepository";
import { LiveClassRepository } from "../repositories/LiveClassRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { EnquiryRepository } from "../repositories/EnquiryRepository";
import { pool } from "../database/database";
import { logger } from "../utils/logger";
import { DashboardStats, StudentDashboardStats } from "../types";

export class DashboardService {
  constructor(
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private assignmentRepository: AssignmentRepository,
    private liveClassRepository: LiveClassRepository,
    private paymentRepository: PaymentRepository,
    private enquiryRepository: EnquiryRepository
  ) {}

  async getAdminDashboardStats(): Promise<DashboardStats> {
    try {
      // Get basic counts
      const [totalStudents, totalCourses, totalAssignments, totalRevenue] =
        await Promise.all([
          this.getTotalStudents(),
          this.getTotalCourses(),
          this.getTotalAssignments(),
          this.getTotalRevenue(),
        ]);

      // Get recent data
      const [recentRegistrations, upcomingClasses, pendingAssignments] =
        await Promise.all([
          this.getRecentRegistrations(),
          this.getUpcomingClasses(),
          this.getPendingAssignments(),
        ]);

      return {
        total_students: totalStudents,
        total_courses: totalCourses,
        total_assignments: totalAssignments,
        total_revenue: totalRevenue,
        recent_registrations: recentRegistrations,
        upcoming_classes: upcomingClasses,
        pending_assignments: pendingAssignments,
      };
    } catch (error) {
      logger.error("Error getting admin dashboard stats:", error);
      throw error;
    }
  }

  async getStudentDashboardStats(
    studentId: string
  ): Promise<StudentDashboardStats> {
    try {
      const [
        enrolledCourses,
        completedAssignments,
        upcomingClasses,
        pendingAssignments,
        recentProgress,
        upcomingDeadlines,
      ] = await Promise.all([
        this.getEnrolledCoursesCount(studentId),
        this.getCompletedAssignmentsCount(studentId),
        this.getUpcomingClassesCount(studentId),
        this.getPendingAssignmentsCount(studentId),
        this.getRecentProgress(studentId),
        this.getUpcomingDeadlines(studentId),
      ]);

      return {
        enrolled_courses: enrolledCourses,
        completed_assignments: completedAssignments,
        upcoming_classes: upcomingClasses,
        pending_assignments: pendingAssignments,
        recent_progress: recentProgress,
        upcoming_deadlines: upcomingDeadlines,
      };
    } catch (error) {
      logger.error("Error getting student dashboard stats:", error);
      throw error;
    }
  }

  private async getTotalStudents(): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = true";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  private async getTotalCourses(): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM courses WHERE is_active = true";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  private async getTotalAssignments(): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM assignments WHERE is_active = true";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  private async getTotalRevenue(): Promise<number> {
    return this.paymentRepository.getTotalRevenue();
  }

  private async getRecentRegistrations(limit: number = 5): Promise<any[]> {
    const query = `
      SELECT cr.*, c.title as course_title, c.image_url as course_image,
             u.first_name, u.last_name, u.email as student_email
      FROM course_registrations cr
      JOIN courses c ON cr.course_id = c.id
      JOIN users u ON cr.student_id = u.id
      ORDER BY cr.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  private async getUpcomingClasses(limit: number = 5): Promise<any[]> {
    return this.liveClassRepository
      .findUpcoming(undefined, 7)
      .then((classes) => classes.slice(0, limit));
  }

  private async getPendingAssignments(limit: number = 5): Promise<any[]> {
    const query = `
      SELECT a.*, c.title as course_title, c.image_url as course_image,
             COUNT(s.id) as submissions_count
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE a.is_active = true AND a.due_date > CURRENT_TIMESTAMP
      GROUP BY a.id, c.title, c.image_url
      ORDER BY a.due_date ASC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  private async getEnrolledCoursesCount(studentId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM course_registrations 
      WHERE student_id = $1 AND status = 'approved'
    `;
    const result = await pool.query(query, [studentId]);
    return parseInt(result.rows[0].count);
  }

  private async getCompletedAssignmentsCount(
    studentId: string
  ): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM assignment_submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN course_registrations cr ON a.course_id = cr.course_id
      WHERE s.student_id = $1 AND cr.student_id = $1 AND s.status = 'graded'
    `;
    const result = await pool.query(query, [studentId]);
    return parseInt(result.rows[0].count);
  }

  private async getUpcomingClassesCount(studentId: string): Promise<number> {
    const upcomingClasses = await this.liveClassRepository.findUpcoming(
      studentId,
      7
    );
    return upcomingClasses.length;
  }

  private async getPendingAssignmentsCount(studentId: string): Promise<number> {
    const upcomingAssignments = await this.assignmentRepository.findUpcoming(
      studentId,
      7
    );
    return upcomingAssignments.length;
  }

  private async getRecentProgress(
    studentId: string,
    limit: number = 5
  ): Promise<any[]> {
    const query = `
      SELECT lp.*, c.title as course_title, c.image_url as course_image,
             cm.title as material_title
      FROM learning_progress lp
      JOIN courses c ON lp.course_id = c.id
      LEFT JOIN course_materials cm ON lp.material_id = cm.id
      WHERE lp.student_id = $1
      ORDER BY lp.last_accessed DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [studentId, limit]);
    return result.rows;
  }

  private async getUpcomingDeadlines(
    studentId: string,
    limit: number = 5
  ): Promise<any[]> {
    return this.assignmentRepository
      .findUpcoming(studentId, 7)
      .then((assignments) => assignments.slice(0, limit));
  }

  async getAnalyticsData(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    revenue: { month: number; revenue: number }[];
    registrations: { month: number; count: number }[];
    enquiries: { month: number; count: number }[];
  }> {
    const currentYear = new Date().getFullYear();
    const start = startDate || new Date(currentYear, 0, 1);
    const end = endDate || new Date(currentYear, 11, 31);

    const [revenue, registrations, enquiries] = await Promise.all([
      this.getMonthlyRevenue(currentYear),
      this.getMonthlyRegistrations(currentYear),
      this.getMonthlyEnquiries(currentYear),
    ]);

    return {
      revenue,
      registrations,
      enquiries,
    };
  }

  private async getMonthlyRegistrations(
    year: number
  ): Promise<{ month: number; count: number }[]> {
    const query = `
      SELECT EXTRACT(MONTH FROM created_at) as month, 
             COUNT(*) as count
      FROM course_registrations
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    const result = await pool.query(query, [year]);
    return result.rows.map((row) => ({
      month: row.month,
      count: parseInt(row.count),
    }));
  }

  private async getMonthlyEnquiries(
    year: number
  ): Promise<{ month: number; count: number }[]> {
    const query = `
      SELECT EXTRACT(MONTH FROM created_at) as month, 
             COUNT(*) as count
      FROM enquiries
      WHERE EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `;
    const result = await pool.query(query, [year]);
    return result.rows.map((row) => ({
      month: row.month,
      count: parseInt(row.count),
    }));
  }
}



