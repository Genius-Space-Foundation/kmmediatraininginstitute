import { Request } from "express";

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "trainer";
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  experience?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  excerpt?: string;
  duration: string;
  price: number;
  maxStudents: number;
  level?: string;
  category: string;
  instructorId?: number;
  isActive: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  userId: number;
  courseId: number;
  status: "pending" | "approved" | "rejected" | "completed";
  registrationDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationWithDetails extends Registration {
  user: Pick<User, "id" | "firstName" | "lastName" | "email">;
  course: Pick<Course, "id" | "name" | "description">;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface CourseRequest {
  name: string;
  description: string;
  excerpt?: string;
  duration: string;
  price: number;
  maxStudents: number;
  level?: string;
  category: string;
  instructorId?: number;
  isActive?: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
}

export interface RegistrationRequest {
  courseId: number;
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fullName: string;
  dateOfBirth: string;
  residentialAddress: string;
  nationality: string;
  religion?: string;
  maritalStatus: string;
  occupation: string;
  telephone?: string;

  // Educational Background
  levelOfEducation: string;
  nameOfSchool: string;
  yearAttendedFrom: string;
  yearAttendedTo: string;
  certificateObtained?: string;
}

// Enhanced Payment-related interfaces
export interface PaymentRequest {
  courseId: number;
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  callbackUrl: string;
  paymentType: "application_fee" | "course_fee" | "installment";
  installmentNumber?: number;
  totalInstallments?: number;
  installmentAmount?: number;
  remainingBalance?: number;
  metadata?: Record<string, any>;
}

export interface CourseFeeInstallmentRequest {
  courseId: number;
  totalCourseFee: number;
  totalInstallments: number;
  paymentPlan: "weekly" | "monthly" | "quarterly";
  installmentAmount: number;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: {
    authorizationUrl: string;
    reference: string;
    accessCode: string;
  };
}

export interface PaymentVerificationRequest {
  reference: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    paidAt: string;
    channel: string;
    currency: string;
    metadata: Record<string, any>;
  };
}

export interface PaymentRecord {
  id: number;
  userId: number;
  courseId: number;
  reference: string;
  amount: number;
  currency: string;
  paymentType: "application_fee" | "course_fee" | "installment";
  status: "pending" | "success" | "failed" | "cancelled";
  paymentMethod: string;
  installmentNumber?: number;
  totalInstallments?: number;
  installmentAmount?: number;
  remainingBalance?: number;
  metadata?: Record<string, any>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFeeInstallment {
  id: number;
  userId: number;
  courseId: number;
  totalCourseFee: number;
  applicationFeePaid: boolean;
  applicationFeeReference?: string;
  totalInstallments: number;
  installmentAmount: number;
  paidInstallments: number;
  remainingBalance: number;
  nextDueDate?: string;
  paymentPlan: "weekly" | "monthly" | "quarterly";
  status: "active" | "completed" | "defaulted" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  authorId: number;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  scheduledFor?: string;
  publishedAt?: string;
  tags?: string;
  metaDescription?: string;
  seoTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  scheduledFor?: string;
  tags?: string;
  metaDescription?: string;
  seoTitle?: string;
}

export interface StoryComment {
  id: number;
  storyId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryCommentRequest {
  content: string;
}

export interface StoryLike {
  id: number;
  storyId: number;
  userId: number;
  createdAt: string;
}

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface TrainerProfile {
  id: number;
  userId: number;
  specialization: string;
  bio: string;
  experience: number;
  certifications?: string;
  hourlyRate?: number;
  availability?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerProfileWithUser extends TrainerProfile {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "phone">;
}

export interface TrainerProfileRequest {
  specialization: string;
  bio: string;
  experience: number;
  certifications?: string;
  hourlyRate?: number;
  availability?: string;
}

export interface CourseWithTrainer extends Course {
  instructorId?: number;
  instructor?: Pick<User, "id" | "firstName" | "lastName" | "specialization">;
}

// Course Materials interfaces
export interface CourseMaterial {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  type: "document" | "video" | "link" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // for videos in minutes
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseMaterialRequest {
  title: string;
  description?: string;
  type: "document" | "video" | "link" | "file";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  orderIndex?: number;
  isActive?: boolean;
}

// Assignment interfaces
export interface Assignment {
  id: number;
  courseId: number;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  maxScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequest {
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  maxScore?: number;
  isActive?: boolean;
}

// Quiz interfaces
export interface Quiz {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  maxAttempts: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizRequest {
  title: string;
  description?: string;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
  isActive?: boolean;
}

// Quiz Question interfaces
export interface QuizQuestion {
  id: number;
  quizId: number;
  question: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  options?: string[]; // for multiple choice questions
  correctAnswer: string;
  points: number;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionRequest {
  question: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string;
  points?: number;
  orderIndex?: number;
}

// Assignment Submission interfaces
export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  submissionText?: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  gradedAt?: string;
  score?: number;
  feedback?: string;
  status: "submitted" | "graded" | "late";
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmissionRequest {
  submissionText?: string;
  fileUrl?: string;
  fileName?: string;
}

// Quiz Attempt interfaces
export interface QuizAttempt {
  id: number;
  quizId: number;
  studentId: number;
  startedAt: string;
  completedAt?: string;
  score?: number;
  answers?: Record<string, any>; // stores student answers
  status: "in_progress" | "completed" | "abandoned";
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttemptRequest {
  answers?: Record<string, any>;
}

// Student Progress interfaces
export interface StudentProgress {
  id: number;
  studentId: number;
  courseId: number;
  materialId?: number;
  assignmentId?: number;
  quizId?: number;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: string;
  timeSpent?: number; // in minutes
  createdAt: string;
  updatedAt: string;
}

export interface StudentProgressRequest {
  status: "not_started" | "in_progress" | "completed";
  timeSpent?: number;
}

// Course Access interfaces
export interface CourseAccess {
  studentId: number;
  courseId: number;
  hasAccess: boolean;
  accessGrantedAt?: string;
  accessGrantedBy?: number;
}
