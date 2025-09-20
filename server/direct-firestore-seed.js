/**
 * Direct Firestore Course Seeding Script
 *
 * This script directly creates courses in Firestore using the existing setup
 */

// Set environment variables
process.env.FIREBASE_PROJECT_ID = "kmmedia-training-institute";
process.env.NODE_ENV = "development";

const admin = require("firebase-admin");

// Initialize Firebase Admin
try {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log("✅ Firebase Admin initialized");
} catch (error) {
  console.log("Firebase already initialized or error:", error.message);
}

const db = admin.firestore();

// Sample courses data
const sampleCourses = [
  {
    name: "Web Development Fundamentals",
    description:
      "Learn the basics of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.",
    excerpt:
      "Master the fundamentals of web development with hands-on projects and real-world examples.",
    duration: "8 weeks",
    price: 299,
    maxStudents: 25,
    level: "beginner",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-web-dev.jpg",
    syllabus:
      "Week 1-2: HTML Basics, Week 3-4: CSS Styling, Week 5-6: JavaScript Fundamentals, Week 7-8: Project Development",
    requirements:
      "Basic computer skills, no prior programming experience required",
    learningOutcomes:
      "Build responsive websites, understand web technologies, create interactive web pages",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    categoryIndex: "Tech",
    levelIndex: "beginner",
    searchKeywords: [
      "web",
      "development",
      "html",
      "css",
      "javascript",
      "tech",
      "beginner",
    ],
    priceRange: "medium",
  },
  {
    name: "Digital Marketing Mastery",
    description:
      "Comprehensive digital marketing course covering SEO, social media marketing, content marketing, and analytics. Learn to create effective digital marketing campaigns.",
    excerpt:
      "Transform your digital marketing skills with this comprehensive course covering all major platforms and strategies.",
    duration: "6 weeks",
    price: 199,
    maxStudents: 30,
    level: "intermediate",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-digital-marketing.jpg",
    syllabus:
      "Week 1: Digital Marketing Overview, Week 2: SEO & Content Marketing, Week 3: Social Media Marketing, Week 4: Email Marketing, Week 5: Analytics & Measurement, Week 6: Campaign Planning",
    requirements:
      "Basic understanding of business concepts, access to social media platforms",
    learningOutcomes:
      "Create effective digital marketing campaigns, analyze marketing performance, manage social media presence",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    categoryIndex: "Media",
    levelIndex: "intermediate",
    searchKeywords: [
      "digital",
      "marketing",
      "seo",
      "social",
      "media",
      "analytics",
      "media",
      "intermediate",
    ],
    priceRange: "low",
  },
  {
    name: "Graphic Design Essentials",
    description:
      "Learn professional graphic design principles, tools, and techniques. Create stunning visuals for print and digital media using industry-standard software.",
    excerpt:
      "Master the art of visual communication with professional graphic design techniques and tools.",
    duration: "10 weeks",
    price: 399,
    maxStudents: 20,
    level: "beginner",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-graphic-design.jpg",
    syllabus:
      "Week 1-2: Design Principles, Week 3-4: Adobe Photoshop, Week 5-6: Adobe Illustrator, Week 7-8: Typography, Week 9-10: Portfolio Development",
    requirements:
      "Access to Adobe Creative Suite (Photoshop, Illustrator), creative mindset",
    learningOutcomes:
      "Create professional designs, understand design principles, build a design portfolio",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    categoryIndex: "Media",
    levelIndex: "beginner",
    searchKeywords: [
      "graphic",
      "design",
      "photoshop",
      "illustrator",
      "visual",
      "media",
      "beginner",
    ],
    priceRange: "medium",
  },
  {
    name: "Mobile App Development",
    description:
      "Build native and cross-platform mobile applications using React Native. Learn to create apps for both iOS and Android platforms.",
    excerpt:
      "Develop mobile applications that work on both iOS and Android using modern development tools.",
    duration: "12 weeks",
    price: 599,
    maxStudents: 15,
    level: "intermediate",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-mobile-dev.jpg",
    syllabus:
      "Week 1-3: React Native Basics, Week 4-6: Navigation & State Management, Week 7-9: API Integration, Week 10-12: App Deployment",
    requirements:
      "Basic JavaScript knowledge, computer with development environment",
    learningOutcomes:
      "Build cross-platform mobile apps, understand mobile development concepts, deploy apps to app stores",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    categoryIndex: "Tech",
    levelIndex: "intermediate",
    searchKeywords: [
      "mobile",
      "app",
      "development",
      "react",
      "native",
      "ios",
      "android",
      "tech",
      "intermediate",
    ],
    priceRange: "high",
  },
  {
    name: "Photography & Videography",
    description:
      "Professional photography and videography course covering camera techniques, lighting, composition, and post-production editing.",
    excerpt:
      "Capture stunning photos and videos with professional techniques and equipment knowledge.",
    duration: "8 weeks",
    price: 349,
    maxStudents: 18,
    level: "beginner",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-photography.jpg",
    syllabus:
      "Week 1-2: Camera Basics & Settings, Week 3-4: Composition & Lighting, Week 5-6: Video Production, Week 7-8: Post-Production Editing",
    requirements: "DSLR or mirrorless camera, basic computer skills",
    learningOutcomes:
      "Take professional photos and videos, understand camera settings, edit photos and videos",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    categoryIndex: "Media",
    levelIndex: "beginner",
    searchKeywords: [
      "photography",
      "videography",
      "camera",
      "editing",
      "media",
      "beginner",
    ],
    priceRange: "medium",
  },
  {
    name: "Data Science & Analytics",
    description:
      "Learn data analysis, visualization, and machine learning using Python and popular data science libraries. Work with real datasets and build predictive models.",
    excerpt:
      "Master data science skills with hands-on projects and real-world datasets.",
    duration: "14 weeks",
    price: 799,
    maxStudents: 12,
    level: "intermediate",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-data-science.jpg",
    syllabus:
      "Week 1-3: Python Basics, Week 4-6: Data Analysis with Pandas, Week 7-9: Data Visualization, Week 10-12: Machine Learning, Week 13-14: Capstone Project",
    requirements: "Basic programming knowledge, computer with Python installed",
    learningOutcomes:
      "Analyze data, create visualizations, build machine learning models, work with real datasets",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    categoryIndex: "Tech",
    levelIndex: "intermediate",
    searchKeywords: [
      "data",
      "science",
      "analytics",
      "python",
      "machine",
      "learning",
      "tech",
      "intermediate",
    ],
    priceRange: "high",
  },
];

async function seedCourses() {
  try {
    console.log("🌱 Starting direct Firestore course seeding...");

    const batch = db.batch();

    for (const course of sampleCourses) {
      const courseRef = db.collection("courses").doc();
      batch.set(courseRef, course);
      console.log(`✅ Prepared course: ${course.name}`);
    }

    await batch.commit();
    console.log("🎉 Successfully seeded all courses!");
    console.log(`📊 Total courses created: ${sampleCourses.length}`);

    // Test the courses API
    console.log("\n🧪 Testing courses API...");
    const coursesSnapshot = await db
      .collection("courses")
      .where("isActive", "==", true)
      .get();
    console.log(`📚 Found ${coursesSnapshot.size} active courses in database`);

    // List the courses
    coursesSnapshot.forEach((doc) => {
      const course = doc.data();
      console.log(`- ${course.name} (${course.category}) - GHC${course.price}`);
    });
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedCourses();
