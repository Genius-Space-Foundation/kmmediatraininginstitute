import { pool } from "./database";

export const initializeTables = async () => {
  const client = await pool.connect();

  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(50),
        address TEXT,
        specialization VARCHAR(255),
        bio TEXT,
        experience TEXT,
        "profileImage" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        excerpt TEXT,
        duration VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        "maxStudents" INTEGER NOT NULL,
        level VARCHAR(50) DEFAULT 'beginner',
        category VARCHAR(100) NOT NULL,
        "instructorId" INTEGER REFERENCES users(id),
        "isActive" BOOLEAN DEFAULT true,
        "featuredImage" TEXT,
        syllabus TEXT,
        requirements TEXT,
        "learningOutcomes" TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        "courseId" INTEGER NOT NULL REFERENCES courses(id),
        status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed')),
        "registrationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Personal Information
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        "fullName" VARCHAR(255) NOT NULL,
        "dateOfBirth" DATE NOT NULL,
        "residentialAddress" TEXT NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        religion VARCHAR(100),
        "maritalStatus" VARCHAR(50) NOT NULL,
        occupation VARCHAR(255) NOT NULL,
        telephone VARCHAR(50),
        
        -- Educational Background
        "levelOfEducation" VARCHAR(100) NOT NULL,
        "nameOfSchool" VARCHAR(255) NOT NULL,
        "yearAttendedFrom" INTEGER NOT NULL,
        "yearAttendedTo" INTEGER NOT NULL,
        "certificateObtained" VARCHAR(255),
        
        -- Parent/Guardian Information
        "parentGuardianName" VARCHAR(255) NOT NULL,
        "parentGuardianOccupation" VARCHAR(255) NOT NULL,
        "parentGuardianAddress" TEXT NOT NULL,
        "parentGuardianContact" VARCHAR(50) NOT NULL,
        "parentGuardianTelephone" VARCHAR(50),
        
        -- Course Information
        "preferredCourse" TEXT NOT NULL,
        "academicYear" VARCHAR(50) NOT NULL,
        
        -- Declaration and Comments
        declaration TEXT NOT NULL,
        comments TEXT,
        
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        "courseId" INTEGER NOT NULL REFERENCES courses(id),
        reference VARCHAR(255) UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'GHS',
        status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed')),
        "paymentMethod" VARCHAR(50) DEFAULT 'paystack',
        metadata JSONB,
        "paidAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Course Fee Installments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_fee_installments (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        "courseId" INTEGER NOT NULL REFERENCES courses(id),
        "totalCourseFee" DECIMAL(10,2) NOT NULL,
        "applicationFeePaid" BOOLEAN DEFAULT false,
        "applicationFeeReference" VARCHAR(255),
        "totalInstallments" INTEGER NOT NULL,
        "installmentAmount" DECIMAL(10,2) NOT NULL,
        "paidInstallments" INTEGER DEFAULT 0,
        "remainingBalance" DECIMAL(10,2) NOT NULL,
        "nextDueDate" TIMESTAMP,
        "paymentPlan" VARCHAR(50) NOT NULL CHECK("paymentPlan" IN ('weekly', 'monthly', 'quarterly')),
        status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'defaulted', 'cancelled')),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("userId", "courseId")
      )
    `);

    // Stories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        "featuredImage" TEXT,
        "authorId" INTEGER NOT NULL REFERENCES users(id),
        "isPublished" BOOLEAN DEFAULT false,
        "isFeatured" BOOLEAN DEFAULT false,
        "viewCount" INTEGER DEFAULT 0,
        "likeCount" INTEGER DEFAULT 0,
        "scheduledFor" TIMESTAMP,
        "publishedAt" TIMESTAMP,
        tags TEXT,
        "metaDescription" TEXT,
        "seoTitle" VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Story comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_comments (
        id SERIAL PRIMARY KEY,
        "storyId" INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Story likes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_likes (
        id SERIAL PRIMARY KEY,
        "storyId" INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
        "userId" INTEGER NOT NULL REFERENCES users(id),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("storyId", "userId")
      )
    `);

    // Trainer profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trainer_profiles (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        specialization VARCHAR(255) NOT NULL,
        bio TEXT NOT NULL,
        experience INTEGER NOT NULL,
        certifications TEXT,
        "hourlyRate" DECIMAL(10,2),
        availability TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Database tables initialized successfully");

    // Migration: Rename trainerId to instructorId if it exists
    try {
      await client.query(`
        ALTER TABLE courses 
        RENAME COLUMN "trainerId" TO "instructorId"
      `);
      console.log("Migrated trainerId to instructorId");
    } catch (error) {
      // Column might not exist or already be renamed, which is fine
      console.log("trainerId to instructorId migration not needed");
    }

    // Migration: Add new columns if they don't exist
    const newColumns = [
      { name: "excerpt", type: "TEXT" },
      { name: "level", type: "VARCHAR(50) DEFAULT 'beginner'" },
      { name: "featuredImage", type: "VARCHAR(500)" },
      { name: "syllabus", type: "TEXT" },
      { name: "requirements", type: "TEXT" },
      { name: "learningOutcomes", type: "TEXT" },
    ];

    for (const column of newColumns) {
      try {
        await client.query(`
          ALTER TABLE courses 
          ADD COLUMN "${column.name}" ${column.type}
        `);
        console.log(`Added column ${column.name} to courses table`);
      } catch (error) {
        // Column might already exist, which is fine
        console.log(`Column ${column.name} already exists or migration failed`);
      }
    }

    // Migration: Add new columns to stories table if they don't exist
    const storyNewColumns = [
      { name: "tags", type: "TEXT" },
      { name: "metaDescription", type: "TEXT" },
      { name: "seoTitle", type: "VARCHAR(255)" },
    ];

    for (const column of storyNewColumns) {
      try {
        await client.query(`
          ALTER TABLE stories 
          ADD COLUMN "${column.name}" ${column.type}
        `);
        console.log(`Added column ${column.name} to stories table`);
      } catch (error) {
        // Column might already exist, which is fine
        console.log(`Column ${column.name} already exists or migration failed`);
      }
    }

    // Migration: Force recreate featuredImage column as TEXT
    try {
      await client.query(`
        ALTER TABLE courses 
        DROP COLUMN IF EXISTS "featuredImage"
      `);
      await client.query(`
        ALTER TABLE courses 
        ADD COLUMN "featuredImage" TEXT
      `);
      console.log("Recreated featuredImage column as TEXT in courses table");
    } catch (error) {
      console.log("featuredImage column recreation failed:", error);
    }

    try {
      await client.query(`
        ALTER TABLE stories 
        DROP COLUMN IF EXISTS "featuredImage"
      `);
      await client.query(`
        ALTER TABLE stories 
        ADD COLUMN "featuredImage" TEXT
      `);
      console.log("Recreated featuredImage column as TEXT in stories table");
    } catch (error) {
      console.log("featuredImage column recreation failed:", error);
    }

    // Insert default admin user if not exists
    const adminResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      ["admin@kmmedia.com"]
    );

    if (adminResult.rows.length === 0) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = bcrypt.hashSync("admin123", 10);

      await client.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role)
         VALUES ($1, $2, $3, $4, $5)`,
        ["admin@kmmedia.com", hashedPassword, "Admin", "User", "admin"]
      );
      console.log("Default admin user created: admin@kmmedia.com / admin123");
    }

    // Insert default trainer user if not exists
    const trainerResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      ["trainer@kmmedia.com"]
    );

    if (trainerResult.rows.length === 0) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = bcrypt.hashSync("trainer123", 10);

      await client.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role, specialization, bio, experience)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          "trainer@kmmedia.com",
          hashedPassword,
          "John",
          "Trainer",
          "trainer",
          "Web Development & React",
          "Experienced web developer with 8+ years in React, Node.js, and modern web technologies. Passionate about teaching and helping students succeed.",
          8,
        ]
      );
      console.log(
        "Default trainer user created: trainer@kmmedia.com / trainer123"
      );
    }

    // Insert sample courses if they don't exist
    const courseCount = await client.query(
      "SELECT COUNT(*) as count FROM courses"
    );
    if (courseCount.rows[0].count === "0") {
      const sampleCourses = [
        [
          "Web Development Bootcamp",
          "Learn modern web development with React and Node.js",
          "12 weeks",
          999.99,
          20,
          "Tech",
        ],
        [
          "Data Science Fundamentals",
          "Introduction to data analysis and machine learning",
          "8 weeks",
          799.99,
          15,
          "Tech",
        ],
        [
          "Digital Marketing Mastery",
          "Complete digital marketing strategy and implementation",
          "10 weeks",
          699.99,
          25,
          "Media",
        ],
        [
          "UI/UX Design Principles",
          "Master user interface and user experience design",
          "6 weeks",
          599.99,
          18,
          "Media",
        ],
        [
          "Fashion Design",
          "Learn the basics of fashion design and tailoring.",
          "14 weeks",
          499.99,
          12,
          "Vocational",
        ],
        [
          "Culinary Arts",
          "Professional cooking and kitchen management.",
          "16 weeks",
          899.99,
          10,
          "Vocational",
        ],
      ];

      for (const course of sampleCourses) {
        await client.query(
          `INSERT INTO courses (name, description, duration, price, "maxStudents", category)
         VALUES ($1, $2, $3, $4, $5, $6)`,
          course
        );
      }

      console.log("Sample courses created");
    }

    // Clear existing stories and insert new ones with detailed content
    await client.query("DELETE FROM stories");
    const sampleStories = [
      [
        "Sarah's Journey: From Beginner to Web Developer",
        `Sarah Johnson had spent the last five years working as a retail manager at a local clothing store. While she enjoyed helping customers and managing her team, she couldn't shake the feeling that she was meant for something more. The world was becoming increasingly digital, and Sarah wanted to be part of that transformation.

"I was always curious about how websites worked," Sarah recalls. "I'd spend hours browsing different sites, wondering how they were built and how I could create something like that myself."

The turning point came when Sarah's store decided to launch an online presence. She volunteered to help with the project, but quickly realized she had no idea where to start. That's when she discovered our Web Development Bootcamp.

**Taking the Leap**

Enrolling in the bootcamp was one of the scariest decisions Sarah had ever made. "I had zero coding experience," she admits. "I didn't even know what HTML stood for. But the instructors assured me that they'd start from the very beginning, and they were right."

The first week was overwhelming. Sarah learned about HTML structure, CSS styling, and the basics of how websites are built. "It was like learning a new language," she says. "But once I built my first simple webpage, I was hooked."

**The Learning Process**

As the weeks progressed, Sarah's confidence grew. She learned JavaScript, React, and Node.js. She built projects from scratch, collaborated with classmates, and received feedback from industry professionals.

"The hands-on approach was incredible," Sarah explains. "Instead of just reading about coding, we were actually building real projects. By week 4, I had created a fully functional e-commerce site for a local bakery."

**The Breakthrough**

The biggest breakthrough came during week 6 when Sarah built her portfolio website. "I couldn't believe I had created something that looked so professional," she says. "I showed it to my family and friends, and they were amazed. That's when I knew I could really do this."

**The Job Search**

Armed with her new skills and a portfolio of projects, Sarah began applying for web development positions. Within three weeks, she received an offer from a local tech startup.

"I was nervous about the interview," Sarah admits. "But the bootcamp had prepared me well. I was able to walk through my projects, explain my code, and demonstrate my problem-solving skills."

**Life After the Bootcamp**

Today, Sarah works as a junior web developer at TechStart Inc., where she builds and maintains client websites. She's also started freelancing on the side, taking on small projects for local businesses.

"The best part is the flexibility," Sarah says. "I can work from anywhere, and I'm constantly learning new things. Every project is different, and I love the challenge."

**Advice for Others**

Sarah's advice for anyone considering a career change? "Don't let fear hold you back. If I can do it, anyone can. The bootcamp provided the structure, support, and skills I needed to succeed. Just be prepared to work hard and stay committed."

**Looking Forward**

Sarah is already planning her next steps. She wants to learn more about backend development and eventually become a full-stack developer. "The learning never stops in this field," she says. "And that's what makes it so exciting."

Sarah's story is proof that with the right training, dedication, and support, anyone can transform their career and find success in the tech industry.`,
        "Meet Sarah, who transformed her career from retail to web development in just 8 weeks through our comprehensive bootcamp program.",
        "success_story",
        null,
        1,
        true,
        true,
        0,
        0,
        null,
        new Date().toISOString(),
      ],
      [
        "Upcoming: AI & Machine Learning Workshop",
        `We're thrilled to announce our most comprehensive AI & Machine Learning workshop yet! This intensive 2-day event will bring together industry experts, cutting-edge technology, and hands-on learning experiences that will transform your understanding of artificial intelligence.

**What to Expect**

Over the course of two action-packed days, participants will dive deep into the world of AI and machine learning. Our expert instructors will guide you through the fundamentals of machine learning algorithms, neural networks, and practical applications of AI in today's business landscape.

**Day 1: Foundations of AI & Machine Learning**

The workshop begins with a comprehensive overview of artificial intelligence and its evolution over the past decade. You'll learn about:

• The history and evolution of AI technology
• Different types of machine learning (supervised, unsupervised, reinforcement)
• Key algorithms and their applications
• Tools and frameworks used in modern AI development

Our hands-on sessions will include building your first machine learning model using Python and popular libraries like TensorFlow and scikit-learn. You'll work with real datasets and see immediate results.

**Day 2: Advanced Applications & Future Trends**

Day two focuses on advanced topics and practical applications:

• Deep learning and neural networks
• Natural language processing (NLP)
• Computer vision applications
• AI ethics and responsible development
• Future trends in AI technology

You'll participate in group projects where you'll apply your knowledge to solve real-world problems. Our instructors will provide personalized feedback and guidance throughout the process.

**Meet Our Expert Instructors**

Dr. Emily Chen - Senior AI Researcher at TechCorp
With over 15 years of experience in machine learning, Dr. Chen has published numerous papers on neural networks and deep learning applications. She's worked with companies like Google, Microsoft, and various startups to implement AI solutions.

Marcus Rodriguez - Lead Data Scientist at DataFlow Inc.
Marcus specializes in practical AI applications and has helped over 50 companies implement machine learning solutions. He's known for his ability to explain complex concepts in simple, understandable terms.

**Who Should Attend**

This workshop is perfect for:
• Software developers looking to expand their skills
• Business professionals interested in AI applications
• Students pursuing careers in technology
• Entrepreneurs exploring AI opportunities
• Anyone curious about the future of technology

**What You'll Take Away**

By the end of the workshop, you'll have:
• A solid understanding of AI and machine learning fundamentals
• Hands-on experience with popular AI tools and frameworks
• A portfolio of projects to showcase your skills
• Connections with industry professionals and fellow learners
• A roadmap for continuing your AI education

**Workshop Details**

Date: [Upcoming Date]
Time: 9:00 AM - 5:00 PM (both days)
Location: Our state-of-the-art learning center
Price: $299 (includes materials, lunch, and networking dinner)

**Special Early Bird Offer**

Register before [date] and save $50! Use code "AIFUTURE" at checkout.

**Limited Seats Available**

We're limiting this workshop to 30 participants to ensure personalized attention and hands-on learning. Don't miss this opportunity to jumpstart your AI journey!

**Register Today**

Spaces are filling up quickly. Visit our website or call us to secure your spot in this transformative learning experience.`,
        "Don't miss our upcoming AI & Machine Learning workshop - 2 days of intensive learning with industry experts.",
        "event",
        null,
        1,
        true,
        false,
        0,
        0,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
      ],
      [
        "The Future of Education: How Technology is Transforming Learning",
        `Education has always been about preparing students for the future, but today, the future is arriving faster than ever before. As we navigate the digital age, technology is fundamentally changing how we learn, teach, and think about education.

**The Digital Revolution in Education**

Gone are the days when learning was confined to textbooks and traditional classrooms. Today's students have access to a wealth of digital resources, interactive tools, and global learning communities. This transformation isn't just about using computers in the classroom—it's about reimagining the entire educational experience.

**Personalized Learning Experiences**

One of the most significant changes technology has brought to education is the ability to personalize learning experiences. Adaptive learning platforms can now adjust content and pacing based on individual student needs, strengths, and learning styles.

"Every student learns differently," explains Dr. Sarah Williams, an educational technology researcher. "Technology allows us to meet students where they are and provide the support they need to succeed."

**Breaking Down Geographic Barriers**

Technology has made education more accessible than ever before. Students in remote areas can now access world-class educational resources. Online learning platforms connect learners from around the globe, creating diverse and enriching learning communities.

**The Rise of Project-Based Learning**

Modern education emphasizes hands-on, project-based learning that prepares students for real-world challenges. Technology tools enable students to work on authentic projects, collaborate with peers globally, and receive feedback from industry professionals.

**Preparing for the Jobs of Tomorrow**

As automation and AI reshape the job market, education must evolve to prepare students for careers that don't yet exist. This means focusing on skills like critical thinking, creativity, collaboration, and adaptability—skills that technology can enhance but not replace.

**Challenges and Opportunities**

While technology offers incredible opportunities for education, it also presents challenges. The digital divide, concerns about screen time, and the need for human connection in learning are all important considerations.

"Technology should enhance human interaction, not replace it," says Professor Michael Chen, who studies educational technology. "The best learning environments combine the power of technology with the warmth of human connection."

**Looking Ahead**

As we look to the future, it's clear that technology will continue to play a central role in education. The key is to use it thoughtfully, ensuring that it serves the fundamental goal of helping every student reach their full potential.

The future of education isn't about choosing between technology and traditional methods—it's about finding the right balance that maximizes learning outcomes for all students.`,
        "Explore how technology is reshaping education and preparing students for the future.",
        "industry_news",
        null,
        1,
        true,
        true,
        0,
        0,
        null,
        new Date().toISOString(),
      ],
      [
        "5 Essential Tips for Learning to Code",
        `Learning to code can be an exciting and rewarding journey, but it can also be overwhelming for beginners. Whether you're starting from scratch or looking to improve your skills, these five essential tips will help you succeed in your coding journey.

**1. Start with the Fundamentals**

Before diving into complex frameworks and libraries, make sure you have a solid understanding of programming fundamentals. This includes:

• Variables and data types
• Control structures (if/else, loops)
• Functions and methods
• Object-oriented programming concepts
• Basic algorithms and data structures

"Many beginners want to jump straight into building apps," says coding instructor David Kim. "But without strong fundamentals, you'll struggle when things get complex. Take the time to build a solid foundation."

**2. Practice, Practice, Practice**

Coding is a skill that improves with practice. Set aside time every day to write code, even if it's just for 30 minutes. Work on small projects, solve coding challenges, and experiment with different approaches.

"Consistency is key," emphasizes Sarah Johnson, a self-taught developer. "I practiced coding every day for six months before I felt confident. The daily practice made all the difference."

**3. Learn by Building Projects**

Theory is important, but nothing beats hands-on experience. Start with simple projects and gradually increase complexity. Some beginner-friendly project ideas include:

• A personal portfolio website
• A simple calculator
• A to-do list application
• A basic game (like Tic-tac-toe)
• A weather app using APIs

**4. Embrace the Debugging Process**

Bugs and errors are a natural part of programming. Instead of getting frustrated, learn to see debugging as a valuable learning opportunity. Develop a systematic approach to troubleshooting:

• Read error messages carefully
• Use debugging tools and console logs
• Break down problems into smaller parts
• Don't be afraid to ask for help

"Every bug you solve makes you a better programmer," says senior developer Maria Rodriguez. "The debugging process teaches you how code actually works."

**5. Join the Community**

Programming is a collaborative field. Connect with other learners and developers through:

• Online forums and communities
• Local coding meetups
• Open source projects
• Social media groups
• Coding bootcamps and courses

**The Learning Journey**

Remember that learning to code is a marathon, not a sprint. Everyone learns at their own pace, and it's normal to feel stuck sometimes. The key is to stay persistent and keep learning.

"Don't compare your progress to others," advises coding mentor James Wilson. "Focus on your own growth and celebrate your achievements, no matter how small they seem."

**Getting Started**

Ready to begin your coding journey? Start with these resources:

• Free online tutorials and courses
• Interactive coding platforms
• Programming books and documentation
• Mentorship programs
• Structured learning programs

The most important thing is to start. Pick a language, find a project that interests you, and begin coding today. Your future self will thank you for taking that first step.`,
        "Master the fundamentals of programming with these proven strategies for success.",
        "tip",
        null,
        1,
        true,
        false,
        0,
        0,
        null,
        new Date().toISOString(),
      ],
      [
        "Behind the Scenes: A Day in the Life of Our Instructors",
        `Ever wondered what it's like to be an instructor at our learning center? Join us for a behind-the-scenes look at a typical day in the life of our dedicated teaching team.

**Morning Routine: Preparing for the Day**

The day begins early for our instructors. Most arrive at the center by 7:30 AM to prepare for their classes. This includes reviewing lesson plans, setting up equipment, and ensuring all learning materials are ready.

"I like to arrive early to get my mind in the right space," says web development instructor Alex Thompson. "Teaching is as much about preparation as it is about delivery."

**Classroom Setup and Technology**

Our modern classrooms are equipped with the latest technology, including high-performance computers, interactive displays, and specialized software. Instructors spend time ensuring everything is working perfectly before students arrive.

"Technology can be unpredictable," notes data science instructor Dr. Lisa Park. "We always have backup plans and alternative approaches ready."

**Student Arrival and Morning Check-ins**

As students begin arriving, instructors take time to check in with each person. This personal touch helps build relationships and identify any issues that might affect learning.

"Every student is different," explains UI/UX instructor Maria Santos. "Some need encouragement, others need space to work independently. Understanding these differences is crucial."

**Interactive Learning Sessions**

Our classes are designed to be highly interactive. Instructors don't just lecture—they facilitate discussions, guide hands-on activities, and provide real-time feedback.

"The best learning happens when students are actively engaged," says programming instructor David Chen. "I try to create an environment where questions are welcome and experimentation is encouraged."

**One-on-One Support**

Throughout the day, instructors provide individual support to students who need extra help. This might involve explaining a concept in a different way, helping debug code, or providing career guidance.

"Sometimes a student just needs someone to believe in them," shares career counselor Sarah Williams. "That moment when they finally understand something difficult—that's what makes this job so rewarding."

**Lunch and Networking**

Lunch breaks are often spent networking with colleagues, sharing teaching strategies, and discussing ways to improve the learning experience.

"We're constantly learning from each other," says digital marketing instructor Mike Johnson. "Every instructor brings different experiences and perspectives to the table."

**Afternoon Sessions and Project Work**

Afternoon sessions typically focus on project work and practical applications. Instructors guide students through real-world scenarios and help them apply their knowledge.

"Projects are where everything comes together," explains full-stack development instructor Rachel Green. "Students get to see how all the pieces fit together and build something they're proud of."

**Evening Office Hours**

Many instructors offer evening office hours for students who need extra help or want to discuss career opportunities.

"I've had some of my best conversations during office hours," says cybersecurity instructor Tom Wilson. "Students often open up about their goals and concerns in these more relaxed settings."

**Continuous Learning and Development**

Our instructors are committed to their own professional development. They regularly attend conferences, take courses, and stay updated with industry trends.

"The tech industry moves fast," says AI instructor Dr. Emily Chen. "If we're not learning, we can't effectively teach our students."

**The Rewards of Teaching**

Despite the challenges, our instructors find great satisfaction in their work. Seeing students succeed and grow is the ultimate reward.

"Nothing compares to the moment when a student gets their first job offer," says career services director Lisa Rodriguez. "It's a reminder of why we do what we do."

**Building the Future**

Our instructors aren't just teaching skills—they're helping build the future workforce. Every student they help succeed is another person ready to contribute to the digital economy.

"We're not just teaching coding or design," says center director James Wilson. "We're teaching problem-solving, creativity, and resilience. These are skills that will serve our students throughout their careers."

**Join Our Team**

Interested in becoming an instructor? We're always looking for passionate educators who want to make a difference in students' lives. Visit our careers page to learn more about opportunities to join our teaching team.`,
        "Discover what goes into creating an exceptional learning experience for our students.",
        "behind_scenes",
        null,
        1,
        true,
        false,
        0,
        0,
        null,
        new Date().toISOString(),
      ],
    ];

    for (const story of sampleStories) {
      await client.query(
        `INSERT INTO stories (title, content, excerpt, category, "featuredImage", "authorId", "isPublished", "isFeatured", "viewCount", "likeCount", "scheduledFor", "publishedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        story
      );
    }

    console.log("Sample stories created");

    // Enhanced Course Management Tables

    // Course Materials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_materials (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "fileUrl" TEXT NOT NULL,
        "fileType" VARCHAR(50) NOT NULL,
        "fileSize" INTEGER,
        "fileName" VARCHAR(255) NOT NULL,
        module VARCHAR(100),
        "isPublic" BOOLEAN DEFAULT true,
        "downloadCount" INTEGER DEFAULT 0,
        "viewCount" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        "dueDate" TIMESTAMP NOT NULL,
        "maxScore" INTEGER DEFAULT 100,
        "assignmentType" VARCHAR(50) DEFAULT 'individual' CHECK("assignmentType" IN ('individual', 'group')),
        instructions TEXT,
        "attachmentUrl" TEXT,
        "attachmentName" VARCHAR(255),
        "isActive" BOOLEAN DEFAULT true,
        "allowLateSubmission" BOOLEAN DEFAULT false,
        "latePenalty" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quizzes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        "timeLimit" INTEGER, -- in minutes, null for no limit
        "attemptsAllowed" INTEGER DEFAULT 1,
        "isActive" BOOLEAN DEFAULT true,
        "startDate" TIMESTAMP,
        "endDate" TIMESTAMP,
        "totalQuestions" INTEGER DEFAULT 0,
        "totalPoints" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quiz Questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        "quizId" INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        "questionType" VARCHAR(50) NOT NULL CHECK("questionType" IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
        options JSONB, -- for multiple choice questions
        "correctAnswer" TEXT,
        points INTEGER DEFAULT 1,
        "order" INTEGER DEFAULT 0,
        "isRequired" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student Submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_submissions (
        id SERIAL PRIMARY KEY,
        "assignmentId" INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
        "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "submissionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "fileUrl" TEXT,
        "fileName" VARCHAR(255),
        "fileSize" INTEGER,
        "submissionText" TEXT,
        grade INTEGER,
        feedback TEXT,
        status VARCHAR(50) DEFAULT 'submitted' CHECK(status IN ('submitted', 'late', 'missing', 'graded')),
        "isLate" BOOLEAN DEFAULT false,
        "latePenaltyApplied" INTEGER DEFAULT 0,
        "gradedBy" INTEGER REFERENCES users(id),
        "gradedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Student Quiz Attempts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_quiz_attempts (
        id SERIAL PRIMARY KEY,
        "quizId" INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "attemptNumber" INTEGER DEFAULT 1,
        score INTEGER,
        "maxScore" INTEGER,
        "startTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "endTime" TIMESTAMP,
        "timeSpent" INTEGER, -- in seconds
        "isCompleted" BOOLEAN DEFAULT false,
        answers JSONB, -- store student answers
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Course Announcements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_announcements (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        "isImportant" BOOLEAN DEFAULT false,
        "isPublished" BOOLEAN DEFAULT true,
        "createdBy" INTEGER NOT NULL REFERENCES users(id),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Course Progress Tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "materialId" INTEGER REFERENCES course_materials(id) ON DELETE CASCADE,
        "assignmentId" INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        "quizId" INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        "progressType" VARCHAR(50) NOT NULL CHECK("progressType" IN ('material_viewed', 'assignment_submitted', 'quiz_completed')),
        "completionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "score" INTEGER,
        "maxScore" INTEGER,
        "timeSpent" INTEGER, -- in seconds
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Enhanced course management tables created");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
};
