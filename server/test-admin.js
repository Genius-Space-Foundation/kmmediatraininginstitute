const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Mock admin routes
app.get("/api/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 150,
      totalCourses: 25,
      totalRegistrations: 300,
      totalRevenue: 45000,
      activeUsers: 120,
      completedCourses: 180,
      pendingRegistrations: 15,
      monthlyRevenue: 8500,
    },
    message: "Admin stats retrieved successfully",
  });
});

app.get("/api/users/all", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Users retrieved successfully",
  });
});

app.get("/api/courses/all", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Courses retrieved successfully",
  });
});

app.get("/api/trainers/all", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Trainers retrieved successfully",
  });
});

app.get("/api/payments/all", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Payments retrieved successfully",
  });
});

app.get("/api/courses/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalCourses: 25,
      activeCourses: 20,
      inactiveCourses: 5,
      totalEnrollments: 300,
      averageRating: 4.5,
      totalRevenue: 45000,
    },
    message: "Course stats retrieved successfully",
  });
});

app.get("/api/registrations/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalRegistrations: 300,
      pendingRegistrations: 15,
      approvedRegistrations: 250,
      rejectedRegistrations: 35,
      monthlyRegistrations: 45,
    },
    message: "Registration stats retrieved successfully",
  });
});

app.get("/api/trainers/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalTrainers: 10,
      activeTrainers: 8,
      inactiveTrainers: 2,
      averageExperience: 6.5,
      totalCoursesTaught: 50,
    },
    message: "Trainer stats retrieved successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Test admin server running on port ${PORT}`);
});
