/**
 * Firestore Database Initialization
 * Creates the expected collections with sample data
 */

import { db } from "../config/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export const initializeFirestore = {
  /**
   * Check if collections exist and create them with sample data if they don't
   */
  async initializeCollections(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const collections = [
        { name: "users", data: this.getSampleUsers() },
        { name: "courses", data: this.getSampleCourses() },
        { name: "registrations", data: this.getSampleRegistrations() },
        { name: "payments", data: this.getSamplePayments() },
        { name: "assignments", data: this.getSampleAssignments() },
        { name: "stories", data: this.getSampleStories() },
      ];

      let createdCount = 0;
      let existingCount = 0;

      for (const collectionInfo of collections) {
        // Check if collection exists
        const snapshot = await getDocs(collection(db, collectionInfo.name));

        if (snapshot.empty) {
          // Collection is empty, create sample data
          for (const data of collectionInfo.data) {
            await addDoc(collection(db, collectionInfo.name), {
              ...data,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          createdCount++;
          console.log(`✅ Created collection: ${collectionInfo.name}`);
        } else {
          existingCount++;
          console.log(
            `ℹ️ Collection already exists: ${collectionInfo.name} (${snapshot.size} documents)`
          );
        }
      }

      return {
        success: true,
        message: `Initialization complete! Created ${createdCount} collections, ${existingCount} already existed.`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to initialize collections: ${error.message}`,
      };
    }
  },

  /**
   * Sample users data
   */
  getSampleUsers() {
    return [
      {
        email: "admin@kmmedia.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        phone: "+1234567890",
        address: "123 Admin Street, City",
        fullName: "Admin User",
        displayName: "Admin User",
      },
      {
        email: "trainer@kmmedia.com",
        firstName: "John",
        lastName: "Trainer",
        role: "trainer",
        phone: "+1234567891",
        address: "456 Trainer Avenue, City",
        specialization: "Web Development",
        bio: "Experienced web developer with 10+ years of experience",
        experience: "10+ years",
        fullName: "John Trainer",
        displayName: "John Trainer",
      },
      {
        email: "student@kmmedia.com",
        firstName: "Jane",
        lastName: "Student",
        role: "user",
        phone: "+1234567892",
        address: "789 Student Road, City",
        fullName: "Jane Student",
        displayName: "Jane Student",
      },
    ];
  },

  /**
   * Sample courses data
   */
  getSampleCourses() {
    return [
      {
        title: "Complete Web Development Bootcamp",
        description: "Learn full-stack web development from scratch",
        instructor: "John Trainer",
        instructorId: "trainer1",
        category: "Web Development",
        level: "Beginner",
        duration: "12 weeks",
        price: 299.99,
        status: "active",
        maxStudents: 30,
        currentStudents: 15,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDate: new Date(Date.now() + 91 * 24 * 60 * 60 * 1000), // 13 weeks from now
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
          {
            title: "React Development",
            description: "Build modern web applications with React",
            duration: "4 weeks",
            order: 3,
          },
          {
            title: "Backend with Node.js",
            description: "Create server-side applications",
            duration: "3 weeks",
            order: 4,
          },
        ],
        prerequisites: ["Basic computer skills", "Internet connection"],
        learningOutcomes: [
          "Build responsive websites",
          "Create dynamic web applications",
          "Understand full-stack development",
          "Deploy applications to production",
        ],
      },
      {
        title: "Data Science with Python",
        description: "Master data analysis and machine learning",
        instructor: "Dr. Sarah Data",
        instructorId: "trainer2",
        category: "Data Science",
        level: "Intermediate",
        duration: "16 weeks",
        price: 399.99,
        status: "active",
        maxStudents: 25,
        currentStudents: 12,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(Date.now() + 126 * 24 * 60 * 60 * 1000), // 18 weeks from now
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
          {
            title: "Data Visualization",
            description: "Create compelling data visualizations",
            duration: "3 weeks",
            order: 3,
          },
          {
            title: "Machine Learning Basics",
            description: "Introduction to machine learning",
            duration: "6 weeks",
            order: 4,
          },
        ],
        prerequisites: [
          "Basic programming knowledge",
          "High school mathematics",
        ],
        learningOutcomes: [
          "Analyze large datasets",
          "Create data visualizations",
          "Build machine learning models",
          "Present data insights effectively",
        ],
      },
    ];
  },

  /**
   * Sample registrations data
   */
  getSampleRegistrations() {
    return [
      {
        userId: "student1",
        courseId: "course1",
        studentName: "Jane Student",
        studentEmail: "student@kmmedia.com",
        courseTitle: "Complete Web Development Bootcamp",
        status: "approved",
        registrationDate: new Date(),
        paymentStatus: "paid",
        amount: 299.99,
      },
      {
        userId: "student2",
        courseId: "course2",
        studentName: "Bob Learner",
        studentEmail: "bob@example.com",
        courseTitle: "Data Science with Python",
        status: "pending",
        registrationDate: new Date(),
        paymentStatus: "pending",
        amount: 399.99,
      },
    ];
  },

  /**
   * Sample payments data
   */
  getSamplePayments() {
    return [
      {
        userId: "student1",
        courseId: "course1",
        amount: 299.99,
        currency: "USD",
        status: "completed",
        paymentMethod: "credit_card",
        transactionId: "txn_123456789",
        paymentDate: new Date(),
        description: "Payment for Complete Web Development Bootcamp",
      },
      {
        userId: "student2",
        courseId: "course2",
        amount: 399.99,
        currency: "USD",
        status: "pending",
        paymentMethod: "bank_transfer",
        transactionId: "txn_987654321",
        paymentDate: new Date(),
        description: "Payment for Data Science with Python",
      },
    ];
  },

  /**
   * Sample assignments data
   */
  getSampleAssignments() {
    return [
      {
        courseId: "course1",
        title: "Build a Personal Portfolio Website",
        description:
          "Create a responsive portfolio website using HTML, CSS, and JavaScript",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        maxPoints: 100,
        instructions: [
          "Design a responsive layout",
          "Include at least 3 sections",
          "Use modern CSS techniques",
          "Make it mobile-friendly",
        ],
        status: "active",
        createdBy: "trainer1",
        moduleId: "module1",
      },
      {
        courseId: "course2",
        title: "Data Analysis Project",
        description: "Analyze a dataset and create visualizations",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        maxPoints: 150,
        instructions: [
          "Choose a dataset from Kaggle",
          "Perform exploratory data analysis",
          "Create at least 5 visualizations",
          "Write a summary report",
        ],
        status: "active",
        createdBy: "trainer2",
        moduleId: "module2",
      },
    ];
  },

  /**
   * Sample stories data
   */
  getSampleStories() {
    return [
      {
        title: "Welcome to KM Media Learning Platform",
        content:
          "We're excited to launch our comprehensive learning platform designed to help you master modern technologies and advance your career.",
        excerpt:
          "Discover our new learning platform with expert-led courses and hands-on projects.",
        category: "Announcement",
        author: "Admin User",
        authorId: "admin1",
        status: "published",
        isPublished: true,
        isFeatured: true,
        viewCount: 150,
        likeCount: 25,
        commentCount: 8,
        publishedAt: new Date(),
        featuredImage: "/images/hero-education.jpg",
        tags: ["announcement", "platform", "learning"],
      },
      {
        title: "5 Tips for Learning Web Development",
        content:
          "Learning web development can be challenging, but with the right approach, you can master it quickly. Here are our top 5 tips for success...",
        excerpt:
          "Essential tips to accelerate your web development learning journey.",
        category: "Tips",
        author: "John Trainer",
        authorId: "trainer1",
        status: "published",
        isPublished: true,
        isFeatured: false,
        viewCount: 89,
        likeCount: 15,
        commentCount: 3,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        featuredImage: "/images/web-dev-tips.jpg",
        tags: ["web development", "tips", "learning"],
      },
    ];
  },
};

export default initializeFirestore;

