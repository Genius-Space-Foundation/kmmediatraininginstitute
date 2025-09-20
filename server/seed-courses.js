/**
 * Course Seeding Script
 * 
 * This script creates sample courses in the Firestore database
 * so that students can see and apply for courses.
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://your-project-id.firebaseio.com'
});

const db = admin.firestore();

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
    learningOutcomes: "Build responsive websites, understand web technologies, create interactive web pages",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Create effective digital marketing campaigns, analyze marketing performance, manage social media presence",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Create professional designs, understand design principles, build a design portfolio",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Build cross-platform mobile apps, understand mobile development concepts, deploy apps to app stores",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Take professional photos and videos, understand camera settings, edit photos and videos",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Analyze data effectively, build machine learning models, create data visualizations",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Design user-centered interfaces, conduct UX research, create design systems",
    createdAt: new Date(),
    updatedAt: new Date()
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
    learningOutcomes: "Identify security threats, implement security measures, respond to security incidents",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedCourses() {
  try {
    console.log('🌱 Starting course seeding...');
    
    const batch = db.batch();
    
    for (const course of sampleCourses) {
      const courseRef = db.collection('courses').doc();
      batch.set(courseRef, course);
      console.log(`✅ Prepared course: ${course.name}`);
    }
    
    await batch.commit();
    console.log('🎉 Successfully seeded all courses!');
    console.log(`📊 Total courses created: ${sampleCourses.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedCourses();


