// Enhanced Learning Experiences Types

export interface LiveClass {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes: number;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  maxParticipants: number;
  recordingUrl?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiveClassParticipant {
  id: number;
  classId: number;
  studentId: number;
  joinedAt?: string;
  leftAt?: string;
  attendanceDuration: number;
  createdAt: string;
}

export interface CatchupSession {
  id: number;
  courseId: number;
  studentId: number;
  mentorId: number;
  sessionDate: string;
  sessionType: "weekly_review" | "one_on_one" | "group" | "emergency";
  topicsCovered: string[];
  studentConcerns?: string;
  mentorFeedback?: string;
  actionItems: string[];
  nextSessionDate?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  studentSatisfaction?: number;
  mentorRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: number;
  assignmentId: number;
  milestoneName: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  mentorFeedback?: string;
  studentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndustrialAttachment {
  id: number;
  studentId: number;
  courseId: number;
  companyName: string;
  companyContact?: string;
  companyEmail?: string;
  positionTitle?: string;
  startDate?: string;
  endDate?: string;
  status: "pending" | "approved" | "active" | "completed" | "cancelled";
  supervisorName?: string;
  supervisorEmail?: string;
  weeklyReports: string[];
  finalReport?: string;
  companyFeedback?: string;
  studentRating?: number;
  companyRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgress {
  id: number;
  studentId: number;
  courseId: number;
  progressPercentage: number;
  totalHoursStudied: number;
  lastActivityDate?: string;
  currentModule?: string;
  completedModules: string[];
  learningGoals: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: number;
  studentId: number;
  courseId: number;
  sessionType: "self_study" | "live_class" | "group_study" | "mentor_session";
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  topicsCovered: string[];
  materialsUsed: string[];
  notes?: string;
  satisfactionRating?: number;
  createdAt: string;
}

export interface LearningMaterial {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  materialType:
    | "video"
    | "document"
    | "presentation"
    | "quiz"
    | "assignment"
    | "resource";
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  durationMinutes?: number;
  isRequired: boolean;
  isPublic: boolean;
  moduleName?: string;
  orderIndex: number;
  downloadCount: number;
  viewCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPath {
  id: number;
  courseId: number;
  pathName: string;
  description?: string;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  estimatedDurationWeeks: number;
  prerequisites: string[];
  learningOutcomes: string[];
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface CreateLiveClassRequest {
  courseId: number;
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes?: number;
  maxParticipants?: number;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
}

export interface UpdateLiveClassRequest {
  title?: string;
  description?: string;
  scheduledDate?: string;
  durationMinutes?: number;
  maxParticipants?: number;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  status?: "scheduled" | "live" | "completed" | "cancelled";
  recordingUrl?: string;
}

export interface CreateCatchupSessionRequest {
  courseId: number;
  studentId: number;
  mentorId: number;
  sessionDate: string;
  sessionType?: "weekly_review" | "one_on_one" | "group" | "emergency";
  topicsCovered?: string[];
  studentConcerns?: string;
  actionItems?: string[];
  nextSessionDate?: string;
}

export interface UpdateCatchupSessionRequest {
  sessionDate?: string;
  sessionType?: "weekly_review" | "one_on_one" | "group" | "emergency";
  topicsCovered?: string[];
  studentConcerns?: string;
  mentorFeedback?: string;
  actionItems?: string[];
  nextSessionDate?: string;
  status?: "scheduled" | "completed" | "cancelled" | "rescheduled";
  studentSatisfaction?: number;
  mentorRating?: number;
}

export interface CreateIndustrialAttachmentRequest {
  studentId: number;
  courseId: number;
  companyName: string;
  companyContact?: string;
  companyEmail?: string;
  positionTitle?: string;
  startDate?: string;
  endDate?: string;
  supervisorName?: string;
  supervisorEmail?: string;
}

export interface UpdateIndustrialAttachmentRequest {
  companyName?: string;
  companyContact?: string;
  companyEmail?: string;
  positionTitle?: string;
  startDate?: string;
  endDate?: string;
  status?: "pending" | "approved" | "active" | "completed" | "cancelled";
  supervisorName?: string;
  supervisorEmail?: string;
  weeklyReports?: string[];
  finalReport?: string;
  companyFeedback?: string;
  studentRating?: number;
  companyRating?: number;
}

export interface CreateStudySessionRequest {
  courseId: number;
  sessionType: "self_study" | "live_class" | "group_study" | "mentor_session";
  startTime: string;
  endTime?: string;
  topicsCovered?: string[];
  materialsUsed?: string[];
  notes?: string;
  satisfactionRating?: number;
}

export interface UpdateLearningProgressRequest {
  progressPercentage?: number;
  totalHoursStudied?: number;
  currentModule?: string;
  completedModules?: string[];
  learningGoals?: string[];
  achievements?: string[];
}

// Capstone Project interfaces
export interface CapstoneProject {
  id: number;
  course_id: number;
  trainer_id: number;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  due_date: Date;
  max_team_size: number;
  status: "active" | "inactive" | "completed";
  created_at: Date;
  updated_at: Date;
}

export interface CapstoneSubmission {
  id: number;
  project_id: number;
  student_id: number;
  submission_text: string;
  team_members?: string[];
  status: "submitted" | "graded" | "rejected";
  grade?: number;
  feedback?: string;
  submitted_at: Date;
  graded_at?: Date;
}

export interface CreateCapstoneProjectRequest {
  course_id: number;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  due_date: string;
  max_team_size?: number;
}

export interface UpdateCapstoneProjectRequest {
  title?: string;
  description?: string;
  objectives?: string[];
  requirements?: string[];
  due_date?: string;
  max_team_size?: number;
  status?: "active" | "inactive" | "completed";
}

export interface SubmitCapstoneProjectRequest {
  submission_text: string;
  team_members?: string[];
}

// Updated Industrial Attachment interfaces to match database schema
export interface IndustrialAttachmentOpportunity {
  id: number;
  course_id: number;
  trainer_id: number;
  company_name: string;
  position_title: string;
  description: string;
  requirements: string[];
  duration_weeks: number;
  start_date: Date;
  end_date: Date;
  location: string;
  stipend?: number;
  max_students: number;
  status: "active" | "inactive" | "completed";
  created_at: Date;
  updated_at: Date;
}

export interface AttachmentApplication {
  id: number;
  attachment_id: number;
  student_id: number;
  cover_letter: string;
  resume_url?: string;
  portfolio_url?: string;
  status: "pending" | "accepted" | "rejected";
  feedback?: string;
  applied_at: Date;
  reviewed_at?: Date;
}

export interface CreateIndustrialAttachmentOpportunityRequest {
  course_id: number;
  company_name: string;
  position_title: string;
  description: string;
  requirements: string[];
  duration_weeks: number;
  start_date: string;
  end_date: string;
  location: string;
  stipend?: number;
  max_students?: number;
}

export interface UpdateIndustrialAttachmentOpportunityRequest {
  company_name?: string;
  position_title?: string;
  description?: string;
  requirements?: string[];
  duration_weeks?: number;
  start_date?: string;
  end_date?: string;
  location?: string;
  stipend?: number;
  max_students?: number;
  status?: "active" | "inactive" | "completed";
}

export interface ApplyAttachmentRequest {
  cover_letter: string;
  resume_url?: string;
  portfolio_url?: string;
}
