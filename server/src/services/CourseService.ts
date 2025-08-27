import { Course, CourseRequest, CourseWithTrainer } from "../types";
import { logger } from "../utils/logger";
import { courseRepository } from "../repositories/CourseRepository";
import { NotFoundError } from "../utils/errors";

export class CourseService {
  async createCourse(
    courseData: CourseRequest,
    instructorId?: number
  ): Promise<CourseWithTrainer> {
    const course = await courseRepository.create({
      ...courseData,
      isActive: courseData.isActive ?? true,
      instructorId: instructorId || courseData.instructorId || undefined,
    });

    logger.info("Course created successfully", {
      courseId: course.id,
      name: course.name,
    });
    return course;
  }

  async getCourseById(id: number): Promise<CourseWithTrainer> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }
    return course;
  }

  async getAllCourses(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<{
    courses: CourseWithTrainer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await courseRepository.findAll(page, limit, category);
  }

  async updateCourse(
    id: number,
    updateData: Partial<CourseRequest>
  ): Promise<CourseWithTrainer> {
    const course = await courseRepository.update(id, updateData);
    logger.info("Course updated successfully", { courseId: id });
    return course;
  }

  async deleteCourse(id: number): Promise<void> {
    await courseRepository.delete(id);
    logger.info("Course deleted successfully", { courseId: id });
  }

  async getCoursesByInstructor(
    instructorId: number
  ): Promise<CourseWithTrainer[]> {
    return await courseRepository.findByInstructorId(instructorId);
  }

  async toggleCourseStatus(id: number): Promise<CourseWithTrainer> {
    const course = await courseRepository.toggleStatus(id);
    logger.info("Course status toggled", {
      courseId: id,
      isActive: course.isActive,
    });
    return course;
  }
}

export const courseService = new CourseService();
