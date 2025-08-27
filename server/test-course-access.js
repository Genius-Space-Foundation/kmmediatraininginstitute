const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:chris00@localhost:5432/kmmedia",
});

async function testCourseAccess() {
  const client = await pool.connect();

  try {
    console.log("🔍 Testing course access system...");

    // 1. Check current registrations
    const registrationsResult = await client.query(
      'SELECT r.*, u."firstName", u."lastName", c.name as "courseName" FROM registrations r JOIN users u ON r."userId" = u.id JOIN courses c ON r."courseId" = c.id ORDER BY r."createdAt" DESC'
    );

    console.log(`📊 Found ${registrationsResult.rows.length} registrations:`);
    registrationsResult.rows.forEach((reg, index) => {
      console.log(
        `  ${index + 1}. ${reg.firstName} ${reg.lastName} - ${
          reg.courseName
        } (${reg.status})`
      );
    });

    // 2. Test approving a registration
    if (registrationsResult.rows.length > 0) {
      const pendingRegistration = registrationsResult.rows.find(
        (r) => r.status === "pending"
      );

      if (pendingRegistration) {
        console.log(
          `\n🔧 Approving registration for ${pendingRegistration.firstName} ${pendingRegistration.lastName}...`
        );

        await client.query(
          `UPDATE registrations 
           SET status = 'approved', "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [pendingRegistration.id]
        );

        console.log("✅ Registration approved successfully!");

        // 3. Test course access
        const hasAccess = await client.query(
          `SELECT r.status 
           FROM registrations r 
           WHERE r."userId" = $1 AND r."courseId" = $2`,
          [pendingRegistration.userId, pendingRegistration.courseId]
        );

        if (
          hasAccess.rows.length > 0 &&
          hasAccess.rows[0].status === "approved"
        ) {
          console.log("✅ Student now has access to the course!");
        } else {
          console.log("❌ Student does not have access to the course");
        }
      } else {
        console.log("ℹ️ No pending registrations found to approve");
      }
    }

    // 4. Test adding course materials
    console.log("\n🔧 Testing course materials...");
    const courseResult = await client.query(
      "SELECT id, name FROM courses LIMIT 1"
    );

    if (courseResult.rows.length > 0) {
      const course = courseResult.rows[0];

      // Add a sample course material (using actual schema)
      const materialResult = await client.query(
        `INSERT INTO course_materials (
          "courseId", title, description, "fileUrl", "fileType", "fileName", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          course.id,
          "Introduction to Course",
          "Welcome to the course!",
          "https://example.com/intro.pdf",
          "pdf",
          "introduction.pdf",
        ]
      );

      console.log(
        "✅ Course material added successfully:",
        materialResult.rows[0].title
      );

      // 5. Test adding an assignment (using correct constraint values)
      const assignmentResult = await client.query(
        `INSERT INTO assignments (
          "courseId", title, description, "dueDate", "maxScore", "assignmentType", "instructions", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          course.id,
          "First Assignment",
          "Complete the introduction module",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          100,
          "individual",
          "Submit your answers in the text box below",
        ]
      );

      console.log(
        "✅ Assignment added successfully:",
        assignmentResult.rows[0].title
      );

      // 6. Test adding a quiz (using actual schema)
      const quizResult = await client.query(
        `INSERT INTO quizzes (
          "courseId", title, description, "timeLimit", "attemptsAllowed", "isActive", "totalQuestions", "totalPoints", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          course.id,
          "Module 1 Quiz",
          "Test your knowledge of the introduction",
          30,
          2,
          true,
          5,
          100,
        ]
      );

      console.log("✅ Quiz added successfully:", quizResult.rows[0].title);

      // 7. Test adding quiz questions (using correct constraint values)
      const quizId = quizResult.rows[0].id;
      const questionResult = await client.query(
        `INSERT INTO quiz_questions (
          "quizId", question, "questionType", options, "correctAnswer", points, "order", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          quizId,
          "What is the main topic of this course?",
          "multiple_choice",
          JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
          "Option A",
          20,
          1,
        ]
      );

      console.log("✅ Quiz question added successfully");

      // 8. Show all content for the course
      console.log("\n📋 Course content summary:");

      const materialsResult = await client.query(
        'SELECT COUNT(*) as count FROM course_materials WHERE "courseId" = $1',
        [course.id]
      );
      console.log(`  • Materials: ${materialsResult.rows[0].count}`);

      const assignmentsResult = await client.query(
        'SELECT COUNT(*) as count FROM assignments WHERE "courseId" = $1',
        [course.id]
      );
      console.log(`  • Assignments: ${assignmentsResult.rows[0].count}`);

      const quizzesResult = await client.query(
        'SELECT COUNT(*) as count FROM quizzes WHERE "courseId" = $1',
        [course.id]
      );
      console.log(`  • Quizzes: ${quizzesResult.rows[0].count}`);

      const questionsResult = await client.query(
        'SELECT COUNT(*) as count FROM quiz_questions qq JOIN quizzes q ON qq."quizId" = q.id WHERE q."courseId" = $1',
        [course.id]
      );
      console.log(`  • Quiz Questions: ${questionsResult.rows[0].count}`);

      // 9. Test student progress tracking
      console.log("\n🔧 Testing student progress tracking...");
      const studentId = registrationsResult.rows[0].userId;

      const progressResult = await client.query(
        `INSERT INTO student_progress (
          "studentId", "courseId", "materialId", status, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [studentId, course.id, materialResult.rows[0].id, "completed"]
      );

      console.log("✅ Student progress tracked successfully");

      // 10. Test assignment submission
      console.log("\n🔧 Testing assignment submission...");
      const submissionResult = await client.query(
        `INSERT INTO assignment_submissions (
          "assignmentId", "studentId", "submissionText", "submittedAt", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          assignmentResult.rows[0].id,
          studentId,
          "This is my assignment submission.",
        ]
      );

      console.log("✅ Assignment submission created successfully");

      // 11. Test quiz attempt
      console.log("\n🔧 Testing quiz attempt...");
      const attemptResult = await client.query(
        `INSERT INTO quiz_attempts (
          "quizId", "studentId", "startedAt", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [quizId, studentId, "in_progress"]
      );

      console.log("✅ Quiz attempt created successfully");
    } else {
      console.log("❌ No courses found in database");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

testCourseAccess();
