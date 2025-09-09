CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "courseId" INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "dueDate" TIMESTAMP NOT NULL,
    "maxScore" INTEGER DEFAULT 100,
    "allowLateSubmission" BOOLEAN DEFAULT false,
    "latePenalty" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_max_score CHECK ("maxScore" > 0),
    CONSTRAINT valid_late_penalty CHECK ("latePenalty" >= 0 AND "latePenalty" <= 100)
);

CREATE TABLE IF NOT EXISTS student_submissions (
    id SERIAL PRIMARY KEY,
    "assignmentId" INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    "studentId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "submissionDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,
    "fileName" VARCHAR(255),
    "status" VARCHAR(20) DEFAULT 'submitted',
    "grade" INTEGER,
    "feedback" TEXT,
    "gradedBy" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "gradedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_grade CHECK (grade >= 0 AND grade <= 100),
    CONSTRAINT valid_status CHECK (status IN ('submitted', 'graded', 'late'))
);

-- Create indexes for better query performance
CREATE INDEX idx_assignments_course ON assignments("courseId");
CREATE INDEX idx_submissions_assignment ON student_submissions("assignmentId");
CREATE INDEX idx_submissions_student ON student_submissions("studentId");
