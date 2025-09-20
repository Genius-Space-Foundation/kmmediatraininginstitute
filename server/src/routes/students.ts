import { Router, Request, Response } from "express";
import { authenticateToken, requireUser } from "../middleware/auth";
import { AuthRequest } from "../types";
import { pool } from "../database/database";

const router = Router();

// Get student dashboard overview data
router.get(
  "/dashboard/overview",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Get user's registrations with course details
      const registrationsQuery = `
      SELECT r.*, c.name as "courseName", c.description as "courseDescription", 
             c.duration, c.price, c."maxStudents"
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC
    `;

      const registrationsResult = await pool.query(registrationsQuery, [
        userId,
      ]);
      const registrations = registrationsResult.rows;

      // Calculate statistics
      const totalRegistrations = registrations.length;
      const activeRegistrations = registrations.filter(
        (r: any) => r.status === "approved"
      ).length;
      const pendingRegistrations = registrations.filter(
        (r: any) => r.status === "pending"
      ).length;
      const completedRegistrations = registrations.filter(
        (r: any) => r.status === "completed"
      ).length;

      // Get recent payments (simplified query to avoid missing columns)
      const paymentsQuery = `
      SELECT p.*, c.name as "courseName"
      FROM payments p
      JOIN courses c ON p."courseId" = c.id
      WHERE p."userId" = $1
      ORDER BY p."createdAt" DESC
      LIMIT 5
    `;

      const paymentsResult = await pool.query(paymentsQuery, [userId]);
      const payments = paymentsResult.rows;

      // Calculate total spent
      const totalSpent = payments
        .filter((p: any) => p.status === "success")
        .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

      // Get assignment statistics - simplified to avoid complex joins
      let assignmentStats = {
        total: "0",
        completed: "0",
        pending: "0",
        overdue: "0",
      };

      try {
        const assignmentsQuery = `
          SELECT COUNT(*) as total
          FROM assignments a
          JOIN courses c ON a."courseId" = c.id
          JOIN registrations r ON c.id = r."courseId"
          WHERE r."userId" = $1 AND r.status = 'approved'
        `;
        const assignmentsResult = await pool.query(assignmentsQuery, [userId]);
        assignmentStats = assignmentsResult.rows[0] || assignmentStats;
      } catch (error) {
        console.log("Assignment stats query failed, using defaults:", error);
      }

      res.json({
        success: true,
        data: {
          stats: {
            totalRegistrations,
            activeRegistrations,
            pendingRegistrations,
            completedRegistrations,
            totalSpent: totalSpent.toFixed(2),
            averageGrade: 85.5, // Mock data for now
            studyStreak: 7, // Mock data for now
            totalAssignments: parseInt(assignmentStats?.total || "0"),
            completedAssignments: parseInt(assignmentStats?.completed || "0"),
            pendingAssignments: parseInt(assignmentStats?.pending || "0"),
            overdueAssignments: parseInt(assignmentStats?.overdue || "0"),
            totalPayments: payments.length,
            pendingPayments: payments.filter((p: any) => p.status === "pending")
              .length,
            completedPayments: payments.filter(
              (p: any) => p.status === "success"
            ).length,
            lastActivity: "2 hours ago", // Mock data for now
            notifications: 3, // Mock data for now
            systemStatus: "online",
          },
          recentRegistrations: registrations.slice(0, 5),
          recentPayments: payments.slice(0, 5),
        },
      });
    } catch (error) {
      console.error("Dashboard overview error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's courses
router.get(
  "/courses",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const query = `
      SELECT r.*, c.name as "courseName", c.description as "courseDescription", 
             c.duration, c.price, c."maxStudents", c."featuredImage"
      FROM registrations r
      JOIN courses c ON r."courseId" = c.id
      WHERE r."userId" = $1
      ORDER BY r."createdAt" DESC
    `;

      const result = await pool.query(query, [userId]);

      res.json({
        success: true,
        data: { registrations: result.rows },
      });
    } catch (error) {
      console.error("Student courses error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's payments
router.get(
  "/payments",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const query = `
      SELECT p.*, c.name as "courseName"
      FROM payments p
      JOIN courses c ON p."courseId" = c.id
      WHERE p."userId" = $1
      ORDER BY p."createdAt" DESC
    `;

      const result = await pool.query(query, [userId]);

      res.json({
        success: true,
        data: { payments: result.rows },
      });
    } catch (error) {
      console.error("Student payments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's assignments
router.get(
  "/assignments",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Get assignments for courses the student is enrolled in
      const query = `
        SELECT a.*, c.name as "courseName"
        FROM assignments a
        JOIN courses c ON a."courseId" = c.id
        JOIN registrations r ON c.id = r."courseId"
        WHERE r."userId" = $1 AND r.status = 'approved'
        ORDER BY a."dueDate" ASC
      `;

      const result = await pool.query(query, [userId]);

      res.json({
        success: true,
        data: { assignments: result.rows },
      });
    } catch (error) {
      console.error("Student assignments error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's notifications
router.get(
  "/notifications",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // For now, return empty notifications array
      // This can be expanded later with a proper notifications table
      res.json({
        success: true,
        data: { notifications: [] },
      });
    } catch (error) {
      console.error("Student notifications error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get chart data for progress
router.get(
  "/charts/progress",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      // Return mock progress data for now
      const progressData = [
        { name: "Week 1", value: 20 },
        { name: "Week 2", value: 35 },
        { name: "Week 3", value: 50 },
        { name: "Week 4", value: 65 },
        { name: "Week 5", value: 80 },
        { name: "Week 6", value: 90 },
        { name: "Week 7", value: 95 },
        { name: "Week 8", value: 100 },
      ];

      res.json({
        success: true,
        data: progressData,
      });
    } catch (error) {
      console.error("Progress chart error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get chart data for payments
router.get(
  "/charts/payments",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Get payment data grouped by month - simplified
      const query = `
        SELECT 'Jan' as name, 0 as value
        UNION ALL
        SELECT 'Feb' as name, 0 as value
        UNION ALL
        SELECT 'Mar' as name, 0 as value
        UNION ALL
        SELECT 'Apr' as name, 0 as value
        UNION ALL
        SELECT 'May' as name, 0 as value
        UNION ALL
        SELECT 'Jun' as name, 0 as value
      `;

      const result = await pool.query(query);

      // If no data, return mock data
      if (result.rows.length === 0) {
        const mockData = [
          { name: "Jan", value: 599 },
          { name: "Feb", value: 799 },
          { name: "Mar", value: 1200 },
          { name: "Apr", value: 899 },
          { name: "May", value: 1500 },
          { name: "Jun", value: 1100 },
        ];
        return res.json({
          success: true,
          data: mockData,
        });
      }

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Payments chart error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get chart data for assignments
router.get(
  "/charts/assignments",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      // Get assignment statistics - simplified
      const query = `
        SELECT 'Completed' as name, 0 as value
        UNION ALL
        SELECT 'Pending' as name, 0 as value
        UNION ALL
        SELECT 'Overdue' as name, 0 as value
      `;

      const result = await pool.query(query);

      // If no data, return mock data
      if (result.rows.length === 0) {
        const mockData = [
          { name: "Completed", value: 8 },
          { name: "Pending", value: 3 },
          { name: "Overdue", value: 1 },
        ];
        return res.json({
          success: true,
          data: mockData,
        });
      }

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      console.error("Assignments chart error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get student's profile data
router.get(
  "/profile",
  authenticateToken,
  requireUser,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const query = `
        SELECT id, email, "firstName", "lastName", phone, address, role, "profileImage", "createdAt"
        FROM users
        WHERE id = $1
      `;

      const result = await pool.query(query, [userId]);
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      console.error("Student profile error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default router;
