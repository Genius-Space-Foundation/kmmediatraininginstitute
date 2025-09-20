// Data Transfer Objects for API requests and responses

import {
  User,
  Course,
  Assignment,
  LiveClass,
  Payment,
  Enquiry,
  SuccessStory,
} from "./entities";

// Common DTOs
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// Auth DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: "student" | "trainer";
}

export interface AuthResponse {
  user: Omit<User, "password_hash">;
  token: string;
  expiresIn: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User DTOs
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_image_url?: string;
}

export interface UserResponse extends Omit<User, "password_hash"> {}

// Course DTOs
export interface CreateCourseRequest {
  title: string;
  description?: string;
  short_description?: string;
  price: number;
  duration_weeks?: number;
  level: "beginner" | "intermediate" | "advanced";
  category?: string;
  image_url?: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  is_active?: boolean;
}

export interface CourseResponse extends Course {
  trainer?: UserResponse;
  student_count?: number;
  materials_count?: number;
}

export interface CourseRegistrationRequest {
  course_id: string;
  notes?: string;
}

export interface CourseRegistrationResponse {
  id: string;
  course: CourseResponse;
  student: UserResponse;
  registration_date: Date;
  status: string;
  payment_status: string;
  total_amount: number;
  paid_amount: number;
  installments?: any[];
}

// Assignment DTOs
export interface CreateAssignmentRequest {
  course_id: string;
  title: string;
  description: string;
  instructions?: string;
  due_date?: string;
  max_points: number;
  assignment_type: "homework" | "project" | "quiz" | "exam";
}

export interface UpdateAssignmentRequest
  extends Partial<CreateAssignmentRequest> {
  is_active?: boolean;
}

export interface AssignmentResponse extends Assignment {
  course?: CourseResponse;
  submissions_count?: number;
  submissions?: AssignmentSubmissionResponse[];
}

export interface AssignmentSubmissionRequest {
  assignment_id: string;
  submission_text?: string;
  file?: File;
}

export interface AssignmentSubmissionResponse {
  id: string;
  assignment: AssignmentResponse;
  student: UserResponse;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  submitted_at: Date;
  grade?: number;
  feedback?: string;
  status: string;
}

export interface GradeSubmissionRequest {
  grade: number;
  feedback?: string;
}

// Live Class DTOs
export interface CreateLiveClassRequest {
  course_id: string;
  title: string;
  description?: string;
  scheduled_date: string;
  duration_minutes: number;
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
}

export interface UpdateLiveClassRequest
  extends Partial<CreateLiveClassRequest> {
  status?: "scheduled" | "ongoing" | "completed" | "cancelled";
}

export interface LiveClassResponse extends LiveClass {
  course?: CourseResponse;
  attendees_count?: number;
}

// Payment DTOs
export interface CreatePaymentRequest {
  registration_id: string;
  amount: number;
  payment_method?: string;
}

export interface PaymentResponse extends Payment {
  registration?: CourseRegistrationResponse;
  student?: UserResponse;
}

export interface PaystackWebhookRequest {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
    };
  };
}

// Enquiry DTOs
export interface CreateEnquiryRequest {
  name: string;
  email: string;
  phone?: string;
  course_interest?: string;
  message: string;
}

export interface UpdateEnquiryRequest {
  status?: "new" | "contacted" | "enrolled" | "closed";
  assigned_to?: string;
  response?: string;
}

export interface EnquiryResponse extends Enquiry {
  assigned_user?: UserResponse;
}

// Success Story DTOs
export interface CreateSuccessStoryRequest {
  student_id?: string;
  title: string;
  content: string;
  image_url?: string;
  is_featured?: boolean;
}

export interface UpdateSuccessStoryRequest
  extends Partial<CreateSuccessStoryRequest> {
  is_active?: boolean;
}

export interface SuccessStoryResponse extends SuccessStory {
  student?: UserResponse;
}

// Course Material DTOs
export interface CreateCourseMaterialRequest {
  course_id: string;
  title: string;
  description?: string;
  file?: File;
  order_index?: number;
}

export interface UpdateCourseMaterialRequest
  extends Partial<CreateCourseMaterialRequest> {
  is_active?: boolean;
}

export interface CourseMaterialResponse {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  order_index: number;
  is_active: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

// Industrial Attachment DTOs
export interface CreateIndustrialAttachmentRequest {
  company_name: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_phone?: string;
}

export interface UpdateIndustrialAttachmentRequest
  extends Partial<CreateIndustrialAttachmentRequest> {
  status?: "pending" | "approved" | "ongoing" | "completed" | "cancelled";
  feedback?: string;
  grade?: number;
}

export interface IndustrialAttachmentResponse {
  id: string;
  student_id: string;
  company_name: string;
  position: string;
  start_date: Date;
  end_date?: Date;
  description?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_phone?: string;
  status: string;
  feedback?: string;
  grade?: number;
  created_at: Date;
  updated_at: Date;
}

// Capstone Project DTOs
export interface CreateCapstoneProjectRequest {
  course_id: string;
  title: string;
  description: string;
  objectives?: string;
  methodology?: string;
  deliverables?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateCapstoneProjectRequest
  extends Partial<CreateCapstoneProjectRequest> {
  status?: "proposed" | "approved" | "in_progress" | "completed" | "cancelled";
  supervisor_id?: string;
  grade?: number;
  feedback?: string;
  project_url?: string;
}

export interface CapstoneProjectResponse {
  id: string;
  student_id: string;
  course_id: string;
  title: string;
  description: string;
  objectives?: string;
  methodology?: string;
  deliverables?: string;
  start_date?: Date;
  end_date?: Date;
  status: string;
  supervisor_id?: string;
  grade?: number;
  feedback?: string;
  project_url?: string;
  created_at: Date;
  updated_at: Date;
  student?: UserResponse;
  course?: CourseResponse;
  supervisor?: UserResponse;
}

// Learning Progress DTOs
export interface LearningProgressResponse {
  id: string;
  student_id: string;
  course_id: string;
  material_id?: string;
  progress_percentage: number;
  time_spent_minutes: number;
  last_accessed: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
  course?: CourseResponse;
  material?: CourseMaterialResponse;
}

// Dashboard DTOs
export interface DashboardStats {
  total_students: number;
  total_courses: number;
  total_assignments: number;
  total_revenue: number;
  recent_registrations: CourseRegistrationResponse[];
  upcoming_classes: LiveClassResponse[];
  pending_assignments: AssignmentResponse[];
}

export interface StudentDashboardStats {
  enrolled_courses: number;
  completed_assignments: number;
  upcoming_classes: number;
  pending_assignments: number;
  recent_progress: LearningProgressResponse[];
  upcoming_deadlines: AssignmentResponse[];
}



