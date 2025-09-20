import { FirestoreAssignmentRepository } from "../repositories/FirestoreAssignmentRepository";
import { FirestoreCourseRepository } from "../repositories/FirestoreCourseRepository";
import { UserService } from "./UserService";
import { logger } from "../utils/logger";
import {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  AssignmentSubmissionRequest,
  GradeSubmissionRequest,
  PaginationParams,
} from "../types";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
} from "../utils/errors";

export class AssignmentService {
  constructor(
    private assignmentRepository: FirestoreAssignmentRepository,
    private courseRepository: FirestoreCourseRepository,
    private userService: UserService
  ) {}

  async getAssignmentById(id: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findByIdWithDetails(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }
    return assignment;
  }

  async getAssignmentsByCourse(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<Assignment[]> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return this.assignmentRepository.findByCourseId(courseId, pagination);
  }

  async getAssignmentsByStudent(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<Assignment[]> {
    // Verify student exists
    const student = await this.userService.getUserById(studentId);
    if (!student || student.role !== "user") {
      throw new NotFoundError("Student not found");
    }

    return this.assignmentRepository.findByStudentId(studentId, pagination);
  }

  async getUpcomingAssignments(
    studentId: string,
    days: number = 7
  ): Promise<Assignment[]> {
    return this.assignmentRepository.findUpcoming(studentId, days);
  }

  async createAssignment(
    assignmentData: CreateAssignmentRequest,
    createdBy: string
  ): Promise<Assignment> {
    // Verify course exists and user has permission
    const course = await this.courseRepository.findById(
      assignmentData.course_id
    );
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Check if user is trainer for this course or admin
    const creator = await this.userService.getUserById(createdBy);
    if (!creator) {
      throw new NotFoundError("User not found");
    }

    if (
      creator.role !== "admin" &&
      (creator.role !== "trainer" || course.instructor?.id !== createdBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to create assignments for this course"
      );
    }

    // Validate due date if provided
    if (assignmentData.due_date) {
      const dueDate = new Date(assignmentData.due_date);
      if (dueDate <= new Date()) {
        throw new ValidationError("Due date must be in the future");
      }
    }

    // Validate max points
    if (assignmentData.max_points <= 0 || assignmentData.max_points > 1000) {
      throw new ValidationError("Max points must be between 1 and 1000");
    }

    const assignment = await this.assignmentRepository.createAssignment({
      courseId: assignmentData.course_id,
      title: assignmentData.title,
      description: assignmentData.description,
      instructions: assignmentData.instructions,
      dueDate: assignmentData.due_date
        ? new Date(assignmentData.due_date).toISOString()
        : undefined,
      maxPoints: assignmentData.max_points,
      assignmentType: assignmentData.assignment_type,
      isActive: true,
      createdBy: createdBy,
    });

    logger.info(`Assignment created: ${assignment.id} by user: ${createdBy}`);
    return assignment;
  }

  async updateAssignment(
    id: string,
    updates: UpdateAssignmentRequest,
    updatedBy: string
  ): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Check permissions
    const updater = await this.userRepository.findById(updatedBy);
    if (!updater) {
      throw new NotFoundError("User not found");
    }

    if (
      updater.role !== "admin" &&
      (updater.role !== "trainer" || assignment.created_by !== updatedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to update this assignment"
      );
    }

    // Validate due date if provided
    if (updates.due_date) {
      const dueDate = new Date(updates.due_date);
      if (dueDate <= new Date()) {
        throw new ValidationError("Due date must be in the future");
      }
    }

    // Validate max points if provided
    if (updates.max_points !== undefined) {
      if (updates.max_points <= 0 || updates.max_points > 1000) {
        throw new ValidationError("Max points must be between 1 and 1000");
      }
    }

    const updatedAssignment = await this.assignmentRepository.update(id, {
      ...updates,
      due_date: updates.due_date ? new Date(updates.due_date) : undefined,
    });

    if (!updatedAssignment) {
      throw new Error("Failed to update assignment");
    }

    logger.info(`Assignment updated: ${id} by user: ${updatedBy}`);
    return updatedAssignment;
  }

  async deleteAssignment(id: string, deletedBy: string): Promise<void> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    // Check permissions
    const deleter = await this.userRepository.findById(deletedBy);
    if (!deleter) {
      throw new NotFoundError("User not found");
    }

    if (
      deleter.role !== "admin" &&
      (deleter.role !== "trainer" || assignment.created_by !== deletedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to delete this assignment"
      );
    }

    const success = await this.assignmentRepository.delete(id);
    if (!success) {
      throw new Error("Failed to delete assignment");
    }

    logger.info(`Assignment deleted: ${id} by user: ${deletedBy}`);
  }

  // Assignment Submission methods
  async getSubmissionById(id: string): Promise<AssignmentSubmission> {
    const submission = await this.assignmentRepository.findSubmissionById(id);
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }
    return submission;
  }

  async getSubmissionsByAssignment(
    assignmentId: string,
    pagination?: PaginationParams
  ): Promise<AssignmentSubmission[]> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    return this.assignmentRepository.findSubmissionsByAssignment(
      assignmentId,
      pagination
    );
  }

  async submitAssignment(
    assignmentId: string,
    submissionData: AssignmentSubmissionRequest,
    studentId: string
  ): Promise<AssignmentSubmission> {
    // Verify assignment exists
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    if (!assignment.is_active) {
      throw new ValidationError("Assignment is no longer active");
    }

    // Check if due date has passed
    if (assignment.due_date && new Date() > assignment.due_date) {
      throw new ValidationError("Assignment due date has passed");
    }

    // Check if student is enrolled in the course
    const course = await this.courseRepository.findById(assignment.course_id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Check if student has already submitted
    const existingSubmission =
      await this.assignmentRepository.findSubmissionByStudentAndAssignment(
        studentId,
        assignmentId
      );
    if (existingSubmission) {
      throw new ConflictError("You have already submitted this assignment");
    }

    // Validate submission data
    if (!submissionData.submission_text && !submissionData.file) {
      throw new ValidationError("Either submission text or file is required");
    }

    const submission = await this.assignmentRepository.createSubmission({
      assignment_id: assignmentId,
      student_id: studentId,
      submission_text: submissionData.submission_text,
      file_url: submissionData.file
        ? `/uploads/assignments/${assignmentId}/${studentId}`
        : undefined,
      file_name: submissionData.file ? submissionData.file.name : undefined,
      submitted_at: new Date(),
      status: "submitted",
    });

    logger.info(
      `Assignment submitted: ${assignmentId} by student: ${studentId}`
    );
    return submission;
  }

  async gradeSubmission(
    submissionId: string,
    gradeData: GradeSubmissionRequest,
    gradedBy: string
  ): Promise<AssignmentSubmission> {
    const submission = await this.assignmentRepository.findSubmissionById(
      submissionId
    );
    if (!submission) {
      throw new NotFoundError("Submission not found");
    }

    // Check permissions
    const grader = await this.userRepository.findById(gradedBy);
    if (!grader) {
      throw new NotFoundError("User not found");
    }

    const assignment = await this.assignmentRepository.findById(
      submission.assignment_id
    );
    if (!assignment) {
      throw new NotFoundError("Assignment not found");
    }

    if (
      grader.role !== "admin" &&
      (grader.role !== "trainer" || assignment.created_by !== gradedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to grade this submission"
      );
    }

    // Validate grade
    if (gradeData.grade < 0 || gradeData.grade > assignment.max_points) {
      throw new ValidationError(
        `Grade must be between 0 and ${assignment.max_points}`
      );
    }

    const gradedSubmission = await this.assignmentRepository.gradeSubmission(
      submissionId,
      gradeData.grade,
      gradeData.feedback || "",
      gradedBy
    );

    if (!gradedSubmission) {
      throw new Error("Failed to grade submission");
    }

    logger.info(`Submission graded: ${submissionId} by user: ${gradedBy}`);
    return gradedSubmission;
  }

  async getStudentSubmission(
    assignmentId: string,
    studentId: string
  ): Promise<AssignmentSubmission | null> {
    return this.assignmentRepository.findSubmissionByStudentAndAssignment(
      studentId,
      assignmentId
    );
  }

  async getAssignmentStats(assignmentId: string): Promise<{
    total_submissions: number;
    graded_submissions: number;
    average_grade: number;
    pending_grades: number;
  }> {
    const submissions =
      await this.assignmentRepository.findSubmissionsByAssignment(assignmentId);

    const totalSubmissions = submissions.length;
    const gradedSubmissions = submissions.filter(
      (s) => s.grade !== null
    ).length;
    const pendingGrades = totalSubmissions - gradedSubmissions;

    const grades = submissions
      .filter((s) => s.grade !== null)
      .map((s) => s.grade!);
    const averageGrade =
      grades.length > 0
        ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length
        : 0;

    return {
      total_submissions: totalSubmissions,
      graded_submissions: gradedSubmissions,
      average_grade: Math.round(averageGrade * 100) / 100,
      pending_grades: pendingGrades,
    };
  }
}
