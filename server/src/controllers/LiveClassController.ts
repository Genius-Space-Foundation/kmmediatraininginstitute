import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { LiveClassService } from "../services/LiveClassService";
import { LiveClassRepository } from "../repositories/LiveClassRepository";
import { CourseRepository } from "../repositories/CourseRepository";
import { UserRepository } from "../repositories/UserRepository";
import { pool } from "../database/database";
import { PaginationParams } from "../types";

export class LiveClassController extends BaseController {
  private liveClassService: LiveClassService;

  constructor() {
    super();
    const liveClassRepository = new LiveClassRepository(pool);
    const courseRepository = new CourseRepository(pool);
    const userRepository = new UserRepository(pool);
    this.liveClassService = new LiveClassService(
      liveClassRepository,
      courseRepository,
      userRepository
    );
  }

  async getLiveClassesByCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { courseId } = req.params;
      const pagination = this.getPaginationParams(req);
      return await this.liveClassService.getLiveClassesByCourse(
        courseId,
        pagination
      );
    });
  }

  async getUpcomingLiveClasses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const studentId = req.user?.role === "student" ? req.user.id : undefined;
      const days = parseInt(req.query.days as string) || 7;
      return await this.liveClassService.getUpcomingLiveClasses(
        studentId,
        days
      );
    });
  }

  async getOngoingLiveClasses(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      return await this.liveClassService.getOngoingLiveClasses();
    });
  }

  async getCompletedLiveClasses(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const courseId = req.query.courseId as string;
      const pagination = this.getPaginationParams(req);
      return await this.liveClassService.getCompletedLiveClasses(
        courseId,
        pagination
      );
    });
  }

  async getLiveClassById(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      return await this.liveClassService.getLiveClassById(id);
    });
  }

  async createLiveClass(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const createdBy = req.user?.id;
      if (!createdBy) throw new Error("User not authenticated");

      return await this.liveClassService.createLiveClass(req.body, createdBy);
    });
  }

  async updateLiveClass(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const updatedBy = req.user?.id;
      if (!updatedBy) throw new Error("User not authenticated");

      return await this.liveClassService.updateLiveClass(
        id,
        req.body,
        updatedBy
      );
    });
  }

  async deleteLiveClass(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const deletedBy = req.user?.id;
      if (!deletedBy) throw new Error("User not authenticated");

      await this.liveClassService.deleteLiveClass(id, deletedBy);
      return { message: "Live class deleted successfully" };
    });
  }

  async startLiveClass(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const startedBy = req.user?.id;
      if (!startedBy) throw new Error("User not authenticated");

      return await this.liveClassService.startLiveClass(id, startedBy);
    });
  }

  async endLiveClass(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const endedBy = req.user?.id;
      if (!endedBy) throw new Error("User not authenticated");

      return await this.liveClassService.endLiveClass(id, endedBy);
    });
  }

  async getAttendeesCount(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const count = await this.liveClassService.getAttendeesCount(id);
      return { attendees_count: count };
    });
  }

  // Catchup Session methods
  async getCatchupSessionsByCourse(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      const { courseId } = req.params;
      const pagination = this.getPaginationParams(req);
      return await this.liveClassService.getCatchupSessionsByCourse(
        courseId,
        pagination
      );
    });
  }

  async getCatchupSessionById(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      return await this.liveClassService.getCatchupSessionById(id);
    });
  }

  async createCatchupSession(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const createdBy = req.user?.id;
      if (!createdBy) throw new Error("User not authenticated");

      return await this.liveClassService.createCatchupSession(
        req.body,
        createdBy
      );
    });
  }

  async updateCatchupSession(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const updatedBy = req.user?.id;
      if (!updatedBy) throw new Error("User not authenticated");

      return await this.liveClassService.updateCatchupSession(
        id,
        req.body,
        updatedBy
      );
    });
  }

  async deleteCatchupSession(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { id } = req.params;
      const deletedBy = req.user?.id;
      if (!deletedBy) throw new Error("User not authenticated");

      await this.liveClassService.deleteCatchupSession(id, deletedBy);
      return { message: "Catchup session deleted successfully" };
    });
  }

  private getPaginationParams(req: Request): PaginationParams {
    return {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sort: req.query.sort as string,
      order: req.query.order as "asc" | "desc",
    };
  }
}



