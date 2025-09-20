import { LiveClassRepository } from "../repositories/LiveClassRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { UserRepository } from "../repositories/UserRepository";
import { logger } from "../utils/logger";
import {
  LiveClass,
  CatchupSession,
  CreateLiveClassRequest,
  UpdateLiveClassRequest,
  PaginationParams,
} from "../types";
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from "../utils/errors";

export class LiveClassService {
  constructor(
    private liveClassRepository: LiveClassRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository
  ) {}

  async getLiveClassById(id: string): Promise<LiveClass> {
    const liveClass = await this.liveClassRepository.findById(id);
    if (!liveClass) {
      throw new NotFoundError("Live class not found");
    }
    return liveClass;
  }

  async getLiveClassesByCourse(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<LiveClass[]> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return this.liveClassRepository.findByCourseId(courseId, pagination);
  }

  async getUpcomingLiveClasses(
    studentId?: string,
    days: number = 7
  ): Promise<LiveClass[]> {
    return this.liveClassRepository.findUpcoming(studentId, days);
  }

  async getOngoingLiveClasses(): Promise<LiveClass[]> {
    return this.liveClassRepository.findOngoing();
  }

  async getCompletedLiveClasses(
    courseId?: string,
    pagination?: PaginationParams
  ): Promise<LiveClass[]> {
    return this.liveClassRepository.findCompleted(courseId, pagination);
  }

  async createLiveClass(
    liveClassData: CreateLiveClassRequest,
    createdBy: string
  ): Promise<LiveClass> {
    // Verify course exists and user has permission
    const course = await this.courseRepository.findById(
      liveClassData.course_id
    );
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Check if user is trainer for this course or admin
    const creator = await this.userRepository.findById(createdBy);
    if (!creator) {
      throw new NotFoundError("User not found");
    }

    if (
      creator.role !== "admin" &&
      (creator.role !== "trainer" || course.trainer_id !== createdBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to create live classes for this course"
      );
    }

    // Validate scheduled date
    const scheduledDate = new Date(liveClassData.scheduled_date);
    if (scheduledDate <= new Date()) {
      throw new ValidationError("Scheduled date must be in the future");
    }

    // Validate duration
    if (
      liveClassData.duration_minutes <= 0 ||
      liveClassData.duration_minutes > 480
    ) {
      throw new ValidationError("Duration must be between 1 and 480 minutes");
    }

    const liveClass = await this.liveClassRepository.create({
      course_id: liveClassData.course_id,
      title: liveClassData.title,
      description: liveClassData.description,
      scheduled_date: scheduledDate,
      duration_minutes: liveClassData.duration_minutes,
      meeting_url: liveClassData.meeting_url,
      meeting_id: liveClassData.meeting_id,
      meeting_password: liveClassData.meeting_password,
      status: "scheduled",
      created_by: createdBy,
    });

    logger.info(`Live class created: ${liveClass.id} by user: ${createdBy}`);
    return liveClass;
  }

  async updateLiveClass(
    id: string,
    updates: UpdateLiveClassRequest,
    updatedBy: string
  ): Promise<LiveClass> {
    const liveClass = await this.liveClassRepository.findById(id);
    if (!liveClass) {
      throw new NotFoundError("Live class not found");
    }

    // Check permissions
    const updater = await this.userRepository.findById(updatedBy);
    if (!updater) {
      throw new NotFoundError("User not found");
    }

    if (
      updater.role !== "admin" &&
      (updater.role !== "trainer" || liveClass.created_by !== updatedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to update this live class"
      );
    }

    // Validate scheduled date if provided
    if (updates.scheduled_date) {
      const scheduledDate = new Date(updates.scheduled_date);
      if (scheduledDate <= new Date()) {
        throw new ValidationError("Scheduled date must be in the future");
      }
    }

    // Validate duration if provided
    if (updates.duration_minutes !== undefined) {
      if (updates.duration_minutes <= 0 || updates.duration_minutes > 480) {
        throw new ValidationError("Duration must be between 1 and 480 minutes");
      }
    }

    const updatedLiveClass = await this.liveClassRepository.update(id, {
      ...updates,
      scheduled_date: updates.scheduled_date
        ? new Date(updates.scheduled_date)
        : undefined,
    });

    if (!updatedLiveClass) {
      throw new Error("Failed to update live class");
    }

    logger.info(`Live class updated: ${id} by user: ${updatedBy}`);
    return updatedLiveClass;
  }

  async deleteLiveClass(id: string, deletedBy: string): Promise<void> {
    const liveClass = await this.liveClassRepository.findById(id);
    if (!liveClass) {
      throw new NotFoundError("Live class not found");
    }

    // Check permissions
    const deleter = await this.userRepository.findById(deletedBy);
    if (!deleter) {
      throw new NotFoundError("User not found");
    }

    if (
      deleter.role !== "admin" &&
      (deleter.role !== "trainer" || liveClass.created_by !== deletedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to delete this live class"
      );
    }

    const success = await this.liveClassRepository.delete(id);
    if (!success) {
      throw new Error("Failed to delete live class");
    }

    logger.info(`Live class deleted: ${id} by user: ${deletedBy}`);
  }

  async startLiveClass(id: string, startedBy: string): Promise<LiveClass> {
    const liveClass = await this.liveClassRepository.findById(id);
    if (!liveClass) {
      throw new NotFoundError("Live class not found");
    }

    if (liveClass.status !== "scheduled") {
      throw new ValidationError("Only scheduled live classes can be started");
    }

    const updatedLiveClass = await this.liveClassRepository.update(id, {
      status: "ongoing",
    });

    if (!updatedLiveClass) {
      throw new Error("Failed to start live class");
    }

    logger.info(`Live class started: ${id} by user: ${startedBy}`);
    return updatedLiveClass;
  }

  async endLiveClass(id: string, endedBy: string): Promise<LiveClass> {
    const liveClass = await this.liveClassRepository.findById(id);
    if (!liveClass) {
      throw new NotFoundError("Live class not found");
    }

    if (liveClass.status !== "ongoing") {
      throw new ValidationError("Only ongoing live classes can be ended");
    }

    const updatedLiveClass = await this.liveClassRepository.update(id, {
      status: "completed",
    });

    if (!updatedLiveClass) {
      throw new Error("Failed to end live class");
    }

    logger.info(`Live class ended: ${id} by user: ${endedBy}`);
    return updatedLiveClass;
  }

  async getAttendeesCount(classId: string): Promise<number> {
    return this.liveClassRepository.getAttendeesCount(classId);
  }

  // Catchup Session methods
  async getCatchupSessionById(id: string): Promise<CatchupSession> {
    const session = await this.liveClassRepository.findCatchupSessionById(id);
    if (!session) {
      throw new NotFoundError("Catchup session not found");
    }
    return session;
  }

  async getCatchupSessionsByCourse(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<CatchupSession[]> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return this.liveClassRepository.findCatchupSessionsByCourse(
      courseId,
      pagination
    );
  }

  async createCatchupSession(
    sessionData: {
      course_id: string;
      title: string;
      description?: string;
      recording_url?: string;
      duration_minutes?: number;
      original_class_id?: string;
    },
    createdBy: string
  ): Promise<CatchupSession> {
    // Verify course exists and user has permission
    const course = await this.courseRepository.findById(sessionData.course_id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Check if user is trainer for this course or admin
    const creator = await this.userRepository.findById(createdBy);
    if (!creator) {
      throw new NotFoundError("User not found");
    }

    if (
      creator.role !== "admin" &&
      (creator.role !== "trainer" || course.trainer_id !== createdBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to create catchup sessions for this course"
      );
    }

    // Validate original class if provided
    if (sessionData.original_class_id) {
      const originalClass = await this.liveClassRepository.findById(
        sessionData.original_class_id
      );
      if (!originalClass) {
        throw new NotFoundError("Original live class not found");
      }
    }

    const session = await this.liveClassRepository.createCatchupSession({
      course_id: sessionData.course_id,
      title: sessionData.title,
      description: sessionData.description,
      recording_url: sessionData.recording_url,
      duration_minutes: sessionData.duration_minutes,
      original_class_id: sessionData.original_class_id,
      is_active: true,
      created_by: createdBy,
    });

    logger.info(`Catchup session created: ${session.id} by user: ${createdBy}`);
    return session;
  }

  async updateCatchupSession(
    id: string,
    updates: Partial<CatchupSession>,
    updatedBy: string
  ): Promise<CatchupSession> {
    const session = await this.liveClassRepository.findCatchupSessionById(id);
    if (!session) {
      throw new NotFoundError("Catchup session not found");
    }

    // Check permissions
    const updater = await this.userRepository.findById(updatedBy);
    if (!updater) {
      throw new NotFoundError("User not found");
    }

    if (
      updater.role !== "admin" &&
      (updater.role !== "trainer" || session.created_by !== updatedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to update this catchup session"
      );
    }

    const updatedSession = await this.liveClassRepository.updateCatchupSession(
      id,
      updates
    );

    if (!updatedSession) {
      throw new Error("Failed to update catchup session");
    }

    logger.info(`Catchup session updated: ${id} by user: ${updatedBy}`);
    return updatedSession;
  }

  async deleteCatchupSession(id: string, deletedBy: string): Promise<void> {
    const session = await this.liveClassRepository.findCatchupSessionById(id);
    if (!session) {
      throw new NotFoundError("Catchup session not found");
    }

    // Check permissions
    const deleter = await this.userRepository.findById(deletedBy);
    if (!deleter) {
      throw new NotFoundError("User not found");
    }

    if (
      deleter.role !== "admin" &&
      (deleter.role !== "trainer" || session.created_by !== deletedBy)
    ) {
      throw new AuthorizationError(
        "You don't have permission to delete this catchup session"
      );
    }

    const success = await this.liveClassRepository.deleteCatchupSession(id);
    if (!success) {
      throw new Error("Failed to delete catchup session");
    }

    logger.info(`Catchup session deleted: ${id} by user: ${deletedBy}`);
  }
}



