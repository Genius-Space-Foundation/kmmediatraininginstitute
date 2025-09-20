/**
 * Course Seeding Script using API
 *
 * This script creates an admin user and then uses the API to create courses
 */

const axios = require("axios");

const API_BASE_URL = "http://localhost:5000/api";

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
  },
];

async function createAdminUser() {
  // First try to login with existing admin user
  try {
    console.log("🔐 Attempting to login with existing admin user...");

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@kmmedia.com",
      password: "admin123456",
    });

    if (loginResponse.data.success) {
      console.log("✅ Admin login successful");
      return loginResponse.data.data.token;
    }
  } catch (loginError) {
    console.log(
      "ℹ️  Admin login failed, attempting to create new admin user..."
    );

    try {
      const adminData = {
        email: "admin@kmmedia.com",
        password: "admin123456",
        firstName: "Admin",
        lastName: "User",
        address: "123 Main Street, Accra, Ghana",
      };

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        adminData
      );

      if (response.data.success) {
        console.log("✅ Admin user created successfully");
        return response.data.data.token;
      }
    } catch (error) {
      console.error(
        "❌ Error creating admin user:",
        error.response?.data?.message
      );
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors);
      }
      throw error;
    }
  }
}

async function createCourse(courseData, token) {
  try {
    const response = await axios.post(`${API_BASE_URL}/courses`, courseData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data.success) {
      console.log(`✅ Created course: ${courseData.name}`);
      return response.data.data.course;
    }
  } catch (error) {
    console.error(
      `❌ Error creating course ${courseData.name}:`,
      error.response?.data?.message
    );
    throw error;
  }
}

async function seedCourses() {
  try {
    console.log("🌱 Starting course seeding via API...");

    // Create admin user and get token
    const token = await createAdminUser();

    if (!token) {
      throw new Error("Failed to get admin token");
    }

    console.log("\n📚 Creating courses...");

    // Create courses one by one
    for (const courseData of sampleCourses) {
      await createCourse(courseData, token);
      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n🎉 Successfully seeded all courses!");
    console.log(`📊 Total courses created: ${sampleCourses.length}`);

    // Test the courses API
    console.log("\n🧪 Testing courses API...");
    const coursesResponse = await axios.get(`${API_BASE_URL}/courses`);

    if (coursesResponse.data.success) {
      const courses = coursesResponse.data.data.courses;
      console.log(`📚 Found ${courses.length} courses in database`);

      // List the courses
      courses.forEach((course) => {
        console.log(
          `- ${course.name} (${course.category}) - GHC${course.price}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error seeding courses:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedCourses();
