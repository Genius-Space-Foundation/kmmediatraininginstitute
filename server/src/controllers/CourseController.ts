import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { courseService } from "../services/CourseService";
import { CourseRequest, AuthRequest } from "../types";
import { logger } from "../utils/logger";

export class CourseController extends BaseController {
  async createCourse(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin", "trainer"]);
      const courseData: CourseRequest = req.body;
      const trainerId =
        req.user?.role === "trainer" ? this.getUserId(req) : undefined;
      return await courseService.createCourse(courseData, trainerId);
    });
  }

  async getCourse(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const courseId = parseInt(req.params.id);
      return await courseService.getCourseById(courseId);
    });
  }

  async getAllCourses(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const { page, limit } = this.getPaginationParams(req);
      const category = req.query.category as string;
      return await courseService.getAllCourses(page, limit, category);
    });
  }

  async updateCourse(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin", "trainer"]);
      const courseId = parseInt(req.params.id);
      const updateData: Partial<CourseRequest> = req.body;
      return await courseService.updateCourse(courseId, updateData);
    });
  }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin"]);
      const courseId = parseInt(req.params.id);
      await courseService.deleteCourse(courseId);
      return { message: "Course deleted successfully" };
    });
  }

  async getCoursesByTrainer(req: AuthRequest, res: Response) {
    try {
      const trainerId = parseInt(req.params.trainerId);
      return await courseService.getCoursesByInstructor(trainerId);
    } catch (error) {
      logger.error("Error getting courses by trainer:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }

  async toggleCourseStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin"]);
      const courseId = parseInt(req.params.id);
      return await courseService.toggleCourseStatus(courseId);
    });
  }
}

export const courseController = new CourseController();
