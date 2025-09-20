// Core entity types for the application

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "admin" | "trainer" | "student";
  is_active: boolean;
  email_verified: boolean;
  profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  price: number;
  duration_weeks?: number;
  level: "beginner" | "intermediate" | "advanced";
  category?: string;
  image_url?: string;
  is_active: boolean;
  trainer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CourseMaterial {
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

export interface CourseRegistration {
  id: string;
  student_id: string;
  course_id: string;
  registration_date: Date;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "partial" | "failed" | "refunded";
  total_amount: number;
  paid_amount: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CourseFeeInstallment {
  id: string;
  registration_id: string;
  installment_number: number;
  amount: number;
  due_date: Date;
  paid_date?: Date;
  status: "pending" | "paid" | "overdue" | "cancelled";
  payment_reference?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  instructions?: string;
  due_date?: Date;
  max_points: number;
  assignment_type: "homework" | "project" | "quiz" | "exam";
  is_active: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  file_url?: string;
  file_name?: string;
  submitted_at: Date;
  grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: Date;
  status: "submitted" | "graded" | "returned";
  created_at: Date;
  updated_at: Date;
}

export interface LiveClass {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  scheduled_date: Date;
  duration_minutes: number;
  meeting_url?: string;
  meeting_id?: string;
  meeting_password?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CatchupSession {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  recording_url?: string;
  duration_minutes?: number;
  original_class_id?: string;
  is_active: boolean;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IndustrialAttachment {
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
  status: "pending" | "approved" | "ongoing" | "completed" | "cancelled";
  feedback?: string;
  grade?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CapstoneProject {
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
  status: "proposed" | "approved" | "in_progress" | "completed" | "cancelled";
  supervisor_id?: string;
  grade?: number;
  feedback?: string;
  project_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Payment {
  id: string;
  registration_id?: string;
  student_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference?: string;
  paystack_reference?: string;
  status: "pending" | "successful" | "failed" | "cancelled";
  gateway_response?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course_interest?: string;
  message: string;
  status: "new" | "contacted" | "enrolled" | "closed";
  assigned_to?: string;
  response?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SuccessStory {
  id: string;
  student_id?: string;
  title: string;
  content: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  action_url?: string;
  created_at: Date;
}

export interface LearningProgress {
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
}



