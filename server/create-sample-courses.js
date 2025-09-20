/**
 * Create Sample Courses Script
 * 
 * This script creates sample courses using the existing API endpoints
 * by first creating an admin user and then using the course creation API.
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Sample courses data
const sampleCourses = [
  {
    name: "Web Development Fundamentals",
    description: "Learn the basics of web development including HTML, CSS, and JavaScript. Perfect for beginners who want to start their journey in web development.",
    excerpt: "Master the fundamentals of web development with hands-on projects and real-world examples.",
    duration: "8 weeks",
    price: 299,
    maxStudents: 25,
    level: "beginner",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-web-dev.jpg",
    syllabus: "Week 1-2: HTML Basics, Week 3-4: CSS Styling, Week 5-6: JavaScript Fundamentals, Week 7-8: Project Development",
    requirements: "Basic computer skills, no prior programming experience required",
    learningOutcomes: "Build responsive websites, understand web technologies, create interactive web pages"
  },
  {
    name: "Digital Marketing Mastery",
    description: "Comprehensive digital marketing course covering SEO, social media marketing, content marketing, and analytics. Learn to create effective digital marketing campaigns.",
    excerpt: "Transform your digital marketing skills with this comprehensive course covering all major platforms and strategies.",
    duration: "6 weeks",
    price: 199,
    maxStudents: 30,
    level: "intermediate",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-digital-marketing.jpg",
    syllabus: "Week 1: Digital Marketing Overview, Week 2: SEO & Content Marketing, Week 3: Social Media Marketing, Week 4: Email Marketing, Week 5: Analytics & Measurement, Week 6: Campaign Planning",
    requirements: "Basic understanding of business concepts, access to social media platforms",
    learningOutcomes: "Create effective digital marketing campaigns, analyze marketing performance, manage social media presence"
  },
  {
    name: "Graphic Design Essentials",
    description: "Learn professional graphic design principles, tools, and techniques. Create stunning visuals for print and digital media using industry-standard software.",
    excerpt: "Master the art of visual communication with professional graphic design techniques and tools.",
    duration: "10 weeks",
    price: 399,
    maxStudents: 20,
    level: "beginner",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-graphic-design.jpg",
    syllabus: "Week 1-2: Design Principles, Week 3-4: Adobe Photoshop, Week 5-6: Adobe Illustrator, Week 7-8: Typography, Week 9-10: Portfolio Development",
    requirements: "Access to Adobe Creative Suite (Photoshop, Illustrator), creative mindset",
    learningOutcomes: "Create professional designs, understand design principles, build a design portfolio"
  },
  {
    name: "Mobile App Development",
    description: "Build native and cross-platform mobile applications using React Native. Learn to create apps for both iOS and Android platforms.",
    excerpt: "Develop mobile applications that work on both iOS and Android using modern development tools.",
    duration: "12 weeks",
    price: 599,
    maxStudents: 15,
    level: "intermediate",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-mobile-dev.jpg",
    syllabus: "Week 1-3: React Native Basics, Week 4-6: Navigation & State Management, Week 7-9: API Integration, Week 10-12: App Deployment",
    requirements: "Basic JavaScript knowledge, computer with development environment",
    learningOutcomes: "Build cross-platform mobile apps, understand mobile development concepts, deploy apps to app stores"
  },
  {
    name: "Photography & Videography",
    description: "Professional photography and videography course covering camera techniques, lighting, composition, and post-production editing.",
    excerpt: "Capture stunning photos and videos with professional techniques and equipment knowledge.",
    duration: "8 weeks",
    price: 349,
    maxStudents: 18,
    level: "beginner",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-photography.jpg",
    syllabus: "Week 1-2: Camera Basics & Settings, Week 3-4: Composition & Lighting, Week 5-6: Video Production, Week 7-8: Post-Production Editing",
    requirements: "DSLR or mirrorless camera, basic computer skills",
    learningOutcomes: "Take professional photos and videos, understand camera settings, edit photos and videos"
  },
  {
    name: "Data Science & Analytics",
    description: "Learn data analysis, visualization, and machine learning using Python and popular data science libraries. Work with real datasets and build predictive models.",
    excerpt: "Unlock insights from data using Python and machine learning techniques for business intelligence.",
    duration: "14 weeks",
    price: 799,
    maxStudents: 12,
    level: "advanced",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-data-science.jpg",
    syllabus: "Week 1-3: Python for Data Science, Week 4-6: Data Analysis & Visualization, Week 7-9: Machine Learning Basics, Week 10-12: Advanced ML, Week 13-14: Capstone Project",
    requirements: "Basic programming knowledge, mathematical background helpful",
    learningOutcomes: "Analyze data effectively, build machine learning models, create data visualizations"
  },
  {
    name: "UI/UX Design",
    description: "Master user interface and user experience design principles. Learn to create intuitive and engaging digital experiences using modern design tools.",
    excerpt: "Design user-friendly interfaces and experiences that users love with professional UI/UX techniques.",
    duration: "10 weeks",
    price: 449,
    maxStudents: 22,
    level: "intermediate",
    category: "Media",
    isActive: true,
    featuredImage: "/images/course-ui-ux.jpg",
    syllabus: "Week 1-2: UX Research & User Personas, Week 3-4: Wireframing & Prototyping, Week 5-6: Visual Design Principles, Week 7-8: Design Systems, Week 9-10: Portfolio & Presentation",
    requirements: "Access to design tools (Figma, Sketch), creative thinking skills",
    learningOutcomes: "Design user-centered interfaces, conduct UX research, create design systems"
  },
  {
    name: "Cybersecurity Fundamentals",
    description: "Learn essential cybersecurity concepts, threat detection, and security best practices. Protect systems and data from cyber threats.",
    excerpt: "Secure digital systems and protect against cyber threats with essential cybersecurity knowledge.",
    duration: "8 weeks",
    price: 399,
    maxStudents: 20,
    level: "intermediate",
    category: "Tech",
    isActive: true,
    featuredImage: "/images/course-cybersecurity.jpg",
    syllabus: "Week 1-2: Security Fundamentals, Week 3-4: Network Security, Week 5-6: Application Security, Week 7-8: Incident Response",
    requirements: "Basic computer networking knowledge, interest in security",
    learningOutcomes: "Identify security threats, implement security measures, respond to security incidents"
  }
];

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...');
    
    const adminData = {
      email: 'admin@kmmedia.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };

    // First try to register the admin user
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, adminData);
      console.log('✅ Admin user created successfully');
      return response.data.data.token;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('👤 Admin user already exists, logging in...');
        // Try to login instead
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: adminData.email,
          password: adminData.password
        });
        console.log('✅ Admin user logged in successfully');
        return loginResponse.data.data.token;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.response?.data || error.message);
    throw error;
  }
}

async function createCourses(token) {
  try {
    console.log('📚 Creating sample courses...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    for (const course of sampleCourses) {
      try {
        const response = await axios.post(`${API_BASE_URL}/courses`, course, { headers });
        console.log(`✅ Created course: ${course.name}`);
      } catch (error) {
        console.error(`❌ Error creating course ${course.name}:`, error.response?.data || error.message);
      }
    }
    
    console.log('🎉 Course creation completed!');
  } catch (error) {
    console.error('❌ Error creating courses:', error.response?.data || error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting sample course creation...');
    
    // Create admin user and get token
    const token = await createAdminUser();
    
    // Create courses
    await createCourses(token);
    
    console.log('✨ All done! Courses should now be visible to students.');
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();


