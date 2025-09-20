import { Router, Request, Response } from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";
import { FirestoreUtils } from "../database/firestore";
import { logger } from "../utils/logger";

const router = Router();

// Get admin dashboard stats (temporarily without auth for testing)
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    // Mock stats data for now - replace with actual Firestore queries
    const stats = {
      totalUsers: 150,
      totalCourses: 25,
      totalRegistrations: 300,
      totalRevenue: 45000,
      activeUsers: 120,
      completedCourses: 180,
      pendingRegistrations: 15,
      monthlyRevenue: 8500,
    };

    res.json({
      success: true,
      data: stats,
      message: "Admin stats retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all users (admin only) - temporarily without auth for testing
router.get("/users/admin/all", async (req: Request, res: Response) => {
  try {
    // Mock users data for now - replace with actual Firestore query
    const users = [
      {
        id: "1",
        email: "admin@kmmedia.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        email: "student@kmmedia.com",
        firstName: "Student",
        lastName: "User",
        role: "student",
        isActive: true,
        createdAt: "2024-01-02T00:00:00Z",
      },
    ];

    res.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all courses (admin only)
router.get("/courses/admin/all", async (req: Request, res: Response) => {
  try {
    // Mock courses data for now - replace with actual Firestore query
    const courses = [
      {
        id: "1",
        name: "Web Development Fundamentals",
        description: "Learn the basics of web development",
        duration: "8 weeks",
        price: 299,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        name: "Data Science with Python",
        description: "Master data analysis and machine learning",
        duration: "12 weeks",
        price: 399,
        isActive: true,
        createdAt: "2024-01-02T00:00:00Z",
      },
    ];

    res.json({
      success: true,
      data: courses,
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all trainers (admin only)
router.get("/trainers/admin/all", async (req: Request, res: Response) => {
  try {
    // Mock trainers data for now - replace with actual Firestore query
    const trainers = [
      {
        id: "1",
        email: "trainer1@kmmedia.com",
        firstName: "John",
        lastName: "Doe",
        specialization: "Web Development",
        experience: 5,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        email: "trainer2@kmmedia.com",
        firstName: "Jane",
        lastName: "Smith",
        specialization: "Data Science",
        experience: 7,
        isActive: true,
        createdAt: "2024-01-02T00:00:00Z",
      },
    ];

    res.json({
      success: true,
      data: trainers,
      message: "Trainers retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching trainers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainers",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get all payments (admin only)
router.get("/payments/admin/all", async (req: Request, res: Response) => {
  try {
    // Mock payments data for now - replace with actual Firestore query
    const payments = [
      {
        id: "1",
        userId: "2",
        courseId: "1",
        amount: 299,
        status: "success",
        paymentMethod: "card",
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: "2",
        userId: "2",
        courseId: "2",
        amount: 399,
        status: "success",
        paymentMethod: "card",
        createdAt: "2024-01-20T00:00:00Z",
      },
    ];

    res.json({
      success: true,
      data: payments,
      message: "Payments retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get course stats (admin only)
router.get("/courses/admin/stats", async (req: Request, res: Response) => {
  try {
    // Mock course stats for now - replace with actual Firestore query
    const stats = {
      totalCourses: 25,
      activeCourses: 20,
      inactiveCourses: 5,
      totalEnrollments: 300,
      averageRating: 4.5,
      totalRevenue: 45000,
    };

    res.json({
      success: true,
      data: stats,
      message: "Course stats retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching course stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get registration stats (admin only)
router.get(
  "/registrations/admin/stats",
  async (req: Request, res: Response) => {
    try {
      // Mock registration stats for now - replace with actual Firestore query
      const stats = {
        totalRegistrations: 300,
        pendingRegistrations: 15,
        approvedRegistrations: 250,
        rejectedRegistrations: 35,
        monthlyRegistrations: 45,
      };

      res.json({
        success: true,
        data: stats,
        message: "Registration stats retrieved successfully",
      });
    } catch (error) {
      logger.error("Error fetching registration stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch registration stats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Get trainer stats (admin only)
router.get("/trainers/admin/stats", async (req: Request, res: Response) => {
  try {
    // Mock trainer stats for now - replace with actual Firestore query
    const stats = {
      totalTrainers: 10,
      activeTrainers: 8,
      inactiveTrainers: 2,
      averageExperience: 6.5,
      totalCoursesTaught: 50,
    };

    res.json({
      success: true,
      data: stats,
      message: "Trainer stats retrieved successfully",
    });
  } catch (error) {
    logger.error("Error fetching trainer stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
