import { Router, Request, Response } from "express";
import { authenticateToken, requireUser } from "../middleware/auth";
import { AuthRequest } from "../types";
import { FirestoreUtils } from "../database/firestore";

const router = Router();

// Get student dashboard courses (temporarily without auth for testing)
router.get("/dashboard/courses", async (req: Request, res: Response) => {
  try {
    // const userId = req.user!.id; // Temporarily commented out for testing

    // For now, return mock data until we implement the full Firestore queries
    const mockCourses = [
      {
        id: "1",
        name: "Web Development Fundamentals",
        description:
          "Learn the basics of web development with HTML, CSS, and JavaScript",
        duration: "8 weeks",
        price: 299,
        status: "enrolled",
        progress: 65,
        instructor: "John Doe",
        startDate: "2024-01-15",
        endDate: "2024-03-15",
      },
      {
        id: "2",
        name: "Data Science with Python",
        description: "Master data analysis and machine learning with Python",
        duration: "12 weeks",
        price: 399,
        status: "enrolled",
        progress: 30,
        instructor: "Jane Smith",
        startDate: "2024-02-01",
        endDate: "2024-04-30",
      },
    ];

    res.json({
      success: true,
      data: mockCourses,
      message: "Student courses retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching student courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student courses",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get student dashboard assignments (temporarily without auth for testing)
router.get("/dashboard/assignments", async (req: Request, res: Response) => {
  try {
    // const userId = req.user!.id; // Temporarily commented out for testing

    // Mock assignments data
    const mockAssignments = [
      {
        id: "1",
        title: "HTML/CSS Portfolio Project",
        courseId: "1",
        courseName: "Web Development Fundamentals",
        dueDate: "2024-02-15",
        status: "submitted",
        grade: 85,
        maxScore: 100,
        description: "Create a personal portfolio website using HTML and CSS",
      },
      {
        id: "2",
        title: "JavaScript Calculator",
        courseId: "1",
        courseName: "Web Development Fundamentals",
        dueDate: "2024-02-28",
        status: "pending",
        grade: null,
        maxScore: 100,
        description: "Build an interactive calculator using JavaScript",
      },
      {
        id: "3",
        title: "Data Analysis Report",
        courseId: "2",
        courseName: "Data Science with Python",
        dueDate: "2024-03-10",
        status: "in_progress",
        grade: null,
        maxScore: 100,
        description: "Analyze a dataset and create a comprehensive report",
      },
    ];

    res.json({
      success: true,
      data: mockAssignments,
      message: "Student assignments retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student assignments",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get student dashboard announcements (temporarily without auth for testing)
router.get("/dashboard/announcements", async (req: Request, res: Response) => {
  try {
    // const userId = req.user!.id; // Temporarily commented out for testing

    // Mock announcements data
    const mockAnnouncements = [
      {
        id: "1",
        title: "Welcome to the New Semester!",
        content:
          "Welcome to the new semester. Please check your course schedules and assignments.",
        date: "2024-01-15",
        priority: "high",
        courseId: null,
        courseName: "General",
      },
      {
        id: "2",
        title: "Assignment Submission Deadline Extended",
        content:
          "The deadline for the HTML/CSS Portfolio Project has been extended to February 20th.",
        date: "2024-02-10",
        priority: "medium",
        courseId: "1",
        courseName: "Web Development Fundamentals",
      },
      {
        id: "3",
        title: "New Course Material Available",
        content:
          "New Python libraries documentation has been added to the Data Science course.",
        date: "2024-02-05",
        priority: "low",
        courseId: "2",
        courseName: "Data Science with Python",
      },
    ];

    res.json({
      success: true,
      data: mockAnnouncements,
      message: "Student announcements retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching student announcements:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student announcements",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
