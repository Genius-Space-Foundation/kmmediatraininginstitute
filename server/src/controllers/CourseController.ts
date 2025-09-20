import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { courseService } from "../services/CourseService";
import { CourseRequest, AuthRequest } from "../types";
import { logger } from "../utils/logger";
import { withCache, invalidate } from "../utils/cache";

export class CourseController extends BaseController {
  async createCourse(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin", "trainer"]);
      const courseData: CourseRequest = req.body;
      const trainerId =
        req.user?.role === "trainer" ? this.getUserId(req) : undefined;
      const created = await courseService.createCourse(courseData, trainerId);
      await invalidate("courses:list:*");
      return created;
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
      const key = `courses:list:page=${page}:limit=${limit}:category=${
        category || "all"
      }`;
      const cachedCall = withCache(key, 60, async () => {
        return await courseService.getAllCourses(page, limit, category);
      });
      return await cachedCall();
    });
  }

  async updateCourse(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin", "trainer"]);
      const courseId = parseInt(req.params.id);
      const updateData: Partial<CourseRequest> = req.body;
      const updated = await courseService.updateCourse(courseId, updateData);
      await invalidate("courses:list:*");
      return updated;
    });
  }

  async deleteCourse(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      this.requireRole(req, ["admin"]);
      const courseId = parseInt(req.params.id);
      await courseService.deleteCourse(courseId);
      await invalidate("courses:list:*");
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
      const result = await courseService.toggleCourseStatus(courseId);
      await invalidate("courses:list:*");
      return result;
    });
  }
}

export const courseController = new CourseController();
