-- Course Materials, Assignments, and Quizzes Migration
-- This script creates the necessary tables for course content management

-- Course Materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id SERIAL PRIMARY KEY,
  "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK(type IN ('document', 'video', 'link', 'file')),
  file_url TEXT,
  file_name VARCHAR(255),
  file_size INTEGER,
  duration INTEGER, -- for videos in minutes
  order_index INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  "dueDate" TIMESTAMP,
  "maxScore" INTEGER DEFAULT 100,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "timeLimit" INTEGER, -- in minutes, NULL for no time limit
  "maxAttempts" INTEGER DEFAULT 1,
  "passingScore" INTEGER DEFAULT 70,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id SERIAL PRIMARY KEY,
  "quizId" INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  "questionType" VARCHAR(50) NOT NULL CHECK("questionType" IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB, -- for multiple choice questions
  "correctAnswer" TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Assignment Submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  "assignmentId" INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "submissionText" TEXT,
  "fileUrl" TEXT,
  "fileName" VARCHAR(255),
  "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "gradedAt" TIMESTAMP,
  "score" INTEGER,
  "feedback" TEXT,
  "status" VARCHAR(50) DEFAULT 'submitted' CHECK(status IN ('submitted', 'graded', 'late')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Quiz Attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id SERIAL PRIMARY KEY,
  "quizId" INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "startedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  "score" INTEGER,
  "answers" JSONB, -- stores student answers
  "status" VARCHAR(50) DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'abandoned')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Progress Tracking table
CREATE TABLE IF NOT EXISTS student_progress (
  id SERIAL PRIMARY KEY,
  "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "materialId" INTEGER REFERENCES course_materials(id) ON DELETE CASCADE,
  "assignmentId" INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
  "quizId" INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  "status" VARCHAR(50) NOT NULL CHECK(status IN ('not_started', 'in_progress', 'completed')),
  "completedAt" TIMESTAMP,
  "timeSpent" INTEGER, -- in minutes
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("studentId", "courseId", "materialId"),
  UNIQUE("studentId", "courseId", "assignmentId"),
  UNIQUE("studentId", "courseId", "quizId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials("courseId");
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments("courseId");
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes("courseId");
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions("quizId");
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions("assignmentId");
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions("studentId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts("quizId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts("studentId");
CREATE INDEX IF NOT EXISTS idx_student_progress_student_course ON student_progress("studentId", "courseId");

-- Add comments for documentation
COMMENT ON TABLE course_materials IS 'Stores course materials like documents, videos, and files';
COMMENT ON TABLE assignments IS 'Stores course assignments with due dates and scoring';
COMMENT ON TABLE quizzes IS 'Stores course quizzes with time limits and passing scores';
COMMENT ON TABLE quiz_questions IS 'Stores individual questions for quizzes';
COMMENT ON TABLE assignment_submissions IS 'Stores student submissions for assignments';
COMMENT ON TABLE quiz_attempts IS 'Stores student attempts at quizzes';
COMMENT ON TABLE student_progress IS 'Tracks student progress through course materials';





