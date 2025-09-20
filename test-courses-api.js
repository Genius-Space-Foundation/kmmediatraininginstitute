/**
 * Test Courses API Response
 *
 * This script simulates the API response to test the frontend
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

app.use(cors());
app.use(express.json());

// Mock courses data that matches the Firestore structure
const mockCourses = [
  {
    id: "GMng8VPsUu6dht7FVY9Y",
    name: "Data Science with Python",
    description: "Master data analysis and machine learning",
    instructor: "Dr. Sarah Data",
    instructorId: "trainer2",
    category: "Data Science",
    level: "Intermediate",
    duration: "16 weeks",
    price: 399.99,
    status: "active", // Using status instead of isActive
    maxStudents: 25,
    currentStudents: 12,
    startDate: "2025-10-03T03:47:54.242Z",
    endDate: "2026-01-23T03:47:54.242Z",
    modules: [
      {
        title: "Python Fundamentals",
        description: "Learn Python programming basics",
        duration: "3 weeks",
        order: 1,
      },
      {
        title: "Data Analysis with Pandas",
        description: "Analyze data using pandas library",
        duration: "4 weeks",
        order: 2,
      },
    ],
    prerequisites: ["Basic programming knowledge", "High school mathematics"],
    learningOutcomes: [
      "Analyze large datasets",
      "Create data visualizations",
      "Build machine learning models",
      "Present data insights effectively",
    ],
    createdAt: "2025-09-19T03:47:57.693Z",
    updatedAt: "2025-09-19T03:47:57.693Z",
  },
  {
    id: "BAgDXODUISvIOPWCQyQE",
    name: "Complete Web Development Bootcamp",
    description: "Learn full-stack web development from scratch",
    instructor: "John Trainer",
    instructorId: "trainer1",
    category: "Web Development",
    level: "Beginner",
    duration: "12 weeks",
    price: 299.99,
    status: "active", // Using status instead of isActive
    maxStudents: 30,
    currentStudents: 15,
    startDate: "2025-09-26T03:47:54.242Z",
    endDate: "2025-12-19T03:47:54.242Z",
    modules: [
      {
        title: "HTML & CSS Fundamentals",
        description: "Learn the basics of web markup and styling",
        duration: "2 weeks",
        order: 1,
      },
      {
        title: "JavaScript Essentials",
        description: "Master JavaScript programming",
        duration: "3 weeks",
        order: 2,
      },
    ],
    prerequisites: ["Basic computer skills", "Internet connection"],
    learningOutcomes: [
      "Build responsive websites",
      "Create dynamic web applications",
      "Understand full-stack development",
      "Deploy applications to production",
    ],
    createdAt: "2025-09-19T03:47:57.246Z",
    updatedAt: "2025-09-19T03:47:57.246Z",
  },
];

// Courses endpoint
app.get("/api/courses", (req, res) => {
  console.log("📚 Courses API called");

  // Filter active courses (courses with status: "active")
  const activeCourses = mockCourses.filter(
    (course) => course.status === "active"
  );

  console.log(`✅ Returning ${activeCourses.length} active courses`);

  res.json({
    success: true,
    data: {
      courses: activeCourses,
    },
  });
});

// Course by ID endpoint
app.get("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  console.log(`🔍 Course detail API called for ID: ${id}`);

  const course = mockCourses.find((c) => c.id === id);

  if (course) {
    console.log(`✅ Found course: ${course.name}`);
    res.json({
      success: true,
      data: {
        course: course,
      },
    });
  } else {
    console.log(`❌ Course not found for ID: ${id}`);
    res.status(404).json({
      success: false,
      message: "Course not found",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Mock API is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API server running on port ${PORT}`);
  console.log(`📚 Courses endpoint: http://localhost:${PORT}/api/courses`);
  console.log(
    `🔍 Course detail endpoint: http://localhost:${PORT}/api/courses/:id`
  );
});
