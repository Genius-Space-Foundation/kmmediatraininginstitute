const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Simple admin server is running" });
});

// Admin stats
app.get("/api/admin/stats", (req, res) => {
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

// Course stats
app.get("/api/courses/admin/stats", (req, res) => {
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

// Registration stats
app.get("/api/registrations/admin/stats", (req, res) => {
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

// Trainer stats
app.get("/api/trainers/admin/stats", (req, res) => {
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

// Users
app.get("/api/users/admin/all", (req, res) => {
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

// Courses
app.get("/api/courses/admin/all", (req, res) => {
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

// Payments
app.get("/api/payments/admin/all", (req, res) => {
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

// Trainers
app.get("/api/trainers/admin/all", (req, res) => {
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

// Create trainer
app.post("/api/trainers/admin/register", (req, res) => {
  const { firstName, lastName, email, specialization, experience } = req.body;

  // Generate a new ID
  const newId = (Math.floor(Math.random() * 1000) + 3).toString();

  const newTrainer = {
    id: newId,
    email: email || `trainer${newId}@kmmedia.com`,
    firstName: firstName || "New",
    lastName: lastName || "Trainer",
    specialization: specialization || "General",
    experience: experience || 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: newTrainer,
    message: "Trainer created successfully",
  });
});

// Create course
app.post("/api/courses/admin/create", (req, res) => {
  const { name, description, duration, price, category, instructor } = req.body;

  // Generate a new ID
  const newId = (Math.floor(Math.random() * 1000) + 3).toString();

  const newCourse = {
    id: newId,
    name: name || "New Course",
    description: description || "Course description",
    duration: duration || "8 weeks",
    price: price || 299,
    category: category || "General",
    instructor: instructor || "TBD",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: newCourse,
    message: "Course created successfully",
  });
});

// Create course (alternative endpoint that the client expects)
app.post("/api/courses", (req, res) => {
  const {
    name,
    description,
    duration,
    price,
    category,
    instructorId,
    maxStudents,
    level,
    isActive,
  } = req.body;

  // Generate a new ID
  const newId = (Math.floor(Math.random() * 1000) + 3).toString();

  const newCourse = {
    id: newId,
    name: name || "New Course",
    description: description || "Course description",
    duration: duration || "8 weeks",
    price: price || 299,
    category: category || "General",
    instructorId: instructorId || null,
    instructorName: "TBD",
    maxStudents: maxStudents || 50,
    level: level || "beginner",
    isActive: isActive !== undefined ? isActive : true,
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: newCourse,
    message: "Course created successfully",
  });
});

// Create user
app.post("/api/users/admin/create", (req, res) => {
  const { firstName, lastName, email, role } = req.body;

  // Generate a new ID
  const newId = (Math.floor(Math.random() * 1000) + 3).toString();

  const newUser = {
    id: newId,
    email: email || `user${newId}@kmmedia.com`,
    firstName: firstName || "New",
    lastName: lastName || "User",
    role: role || "student",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: newUser,
    message: "User created successfully",
  });
});

// Update trainer
app.put("/api/trainers/admin/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  res.json({
    success: true,
    data: { id, ...updateData, updatedAt: new Date().toISOString() },
    message: "Trainer updated successfully",
  });
});

// Update course
app.put("/api/courses/admin/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  res.json({
    success: true,
    data: { id, ...updateData, updatedAt: new Date().toISOString() },
    message: "Course updated successfully",
  });
});

// Update user
app.put("/api/users/admin/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  res.json({
    success: true,
    data: { id, ...updateData, updatedAt: new Date().toISOString() },
    message: "User updated successfully",
  });
});

// Delete trainer
app.delete("/api/trainers/admin/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    message: "Trainer deleted successfully",
  });
});

// Delete course
app.delete("/api/courses/admin/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    message: "Course deleted successfully",
  });
});

// Delete user
app.delete("/api/users/admin/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

// Student dashboard routes
app.get("/api/students/dashboard/courses", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Student courses retrieved successfully",
  });
});

app.get("/api/students/dashboard/assignments", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Student assignments retrieved successfully",
  });
});

app.get("/api/students/dashboard/announcements", (req, res) => {
  res.json({
    success: true,
    data: [
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
    ],
    message: "Student announcements retrieved successfully",
  });
});

app.listen(PORT, () => {
  console.log(`Simple admin server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Admin stats: http://localhost:${PORT}/api/admin/stats`);
});
