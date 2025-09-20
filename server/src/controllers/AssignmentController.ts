import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { BaseController } from "./BaseController";
import { AssignmentService } from "../services/AssignmentService";
import { AssignmentRepository } from "../repositories/AssignmentRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { UserRepository } from "../repositories/UserRepository";
import { pool } from "../database/database";
import { PaginationParams } from "../types";

export class AssignmentController extends BaseController {
  private assignmentService: AssignmentService;

  constructor() {
    super();
    const assignmentRepository = new AssignmentRepository();
    const courseRepository = new CourseRepository();
    const userRepository = new UserRepository();
    this.assignmentService = new AssignmentService(
      assignmentRepository,
      courseRepository,
      userRepository
    );
  }

  async getAssignmentsByCourse(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { courseId } = req.params;
      const pagination = this.getPaginationParams(req);
      return await this.assignmentService.getAssignmentsByCourse(
        courseId,
        pagination
      );
    });
  }

  async getAssignmentsByStudent(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { studentId } = req.params;
      const pagination = this.getPaginationParams(req);
      return await this.assignmentService.getAssignmentsByStudent(
        studentId,
        pagination
      );
    });
  }

  async getMyAssignments(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const studentId = req.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      const pagination = this.getPaginationParams(req);
      return await this.assignmentService.getAssignmentsByStudent(
        studentId,
        pagination
      );
    });
  }

  async getUpcomingAssignments(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const studentId = req.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      const days = parseInt(req.query.days as string) || 7;
      return await this.assignmentService.getUpcomingAssignments(
        studentId,
        days
      );
    });
  }

  async getAssignmentById(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      return await this.assignmentService.getAssignmentById(id);
    });
  }

  async createAssignment(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const createdBy = req.user?.id;
      if (!createdBy) throw new Error("User not authenticated");

      return await this.assignmentService.createAssignment(req.body, createdBy);
    });
  }

  async updateAssignment(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const updatedBy = req.user?.id;
      if (!updatedBy) throw new Error("User not authenticated");

      return await this.assignmentService.updateAssignment(
        id,
        req.body,
        updatedBy
      );
    });
  }

  async deleteAssignment(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const deletedBy = req.user?.id;
      if (!deletedBy) throw new Error("User not authenticated");

      await this.assignmentService.deleteAssignment(id, deletedBy);
      return { message: "Assignment deleted successfully" };
    });
  }

  async getSubmissionsByAssignment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const pagination = this.getPaginationParams(req);
      return await this.assignmentService.getSubmissionsByAssignment(
        id,
        pagination
      );
    });
  }

  async submitAssignment(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const studentId = req.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      return await this.assignmentService.submitAssignment(
        id,
        req.body,
        studentId
      );
    });
  }

  async getMySubmission(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const studentId = req.user?.id;
      if (!studentId) throw new Error("User not authenticated");

      return await this.assignmentService.getStudentSubmission(id, studentId);
    });
  }

  async gradeSubmission(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { submissionId } = req.params;
      const gradedBy = req.user?.id;
      if (!gradedBy) throw new Error("User not authenticated");

      return await this.assignmentService.gradeSubmission(
        submissionId,
        req.body,
        gradedBy
      );
    });
  }

  async getAssignmentStats(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      return await this.assignmentService.getAssignmentStats(id);
    });
  }

  private getPaginationParams(req: AuthRequest): {
    page: number;
    limit: number;
  } {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    return { page, limit };
  }
}
