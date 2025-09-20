/**
 * Course Service
 *
 * Service layer for course-related operations using Firestore.
 */

import { Course, CourseRequest, CourseWithTrainer } from "../types";
import { logger } from "../utils/logger";
import { NotFoundError, ValidationError } from "../utils/errors";
import FirestoreService, {
  QueryOptions,
  PaginationOptions,
} from "./FirestoreService";

export class CourseService {
  private collectionName = "courses";

  /**
   * Create a new course
   */
  async createCourse(
    courseData: CourseRequest,
    instructorId?: string
  ): Promise<CourseWithTrainer> {
    try {
      const courseDoc = {
        ...courseData,
        instructorId: instructorId || courseData.instructorId || null,
        isActive: courseData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const courseId = await FirestoreService.createDocument(
        this.collectionName,
        courseDoc
      );

      logger.info("Course created successfully", {
        courseId,
        name: courseData.name,
      });

      // Return the created course with trainer info if available
      const createdCourse = await this.getCourseById(courseId);
      return createdCourse;
    } catch (error) {
      logger.error("Error creating course:", error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<CourseWithTrainer> {
    try {
      const courseDoc = await FirestoreService.getDocument<Course>(
        this.collectionName,
        id
      );

      if (!courseDoc) {
        throw new NotFoundError("Course not found");
      }

      const course: Course = {
        id: courseDoc.id,
        ...courseDoc.data,
      };

      // Get trainer information if instructorId exists
      let trainer = null;
      if (course.instructorId) {
        try {
          const trainerDoc = await FirestoreService.getDocument(
            "users",
            course.instructorId
          );
          if (trainerDoc) {
            trainer = {
              id: trainerDoc.id,
              ...trainerDoc.data,
            };
          }
        } catch (error) {
          logger.warn("Could not fetch trainer information:", error);
        }
      }

      return {
        ...course,
        trainer,
      } as CourseWithTrainer;
    } catch (error) {
      logger.error("Error getting course by ID:", error);
      throw error;
    }
  }

  /**
   * Get all active courses
   */
  async getActiveCourses(limit: number = 10): Promise<Course[]> {
    try {
      const conditions: QueryOptions[] = [
        { field: "isActive", operator: "==", value: true },
      ];

      const pagination: PaginationOptions = {
        limit,
        orderByField: "createdAt",
        orderDirection: "desc",
      };

      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        conditions,
        pagination
      );

      return result.data.map((course) => ({
        id: course.id || "",
        ...course,
      }));
    } catch (error) {
      logger.error("Error getting active courses:", error);
      throw error;
    }
  }

  /**
   * Get courses by category
   */
  async getCoursesByCategory(
    category: string,
    limit: number = 10
  ): Promise<Course[]> {
    try {
      const conditions: QueryOptions[] = [
        { field: "category", operator: "==", value: category },
      ];

      const pagination: PaginationOptions = {
        limit,
        orderByField: "createdAt",
        orderDirection: "desc",
      };

      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        conditions,
        pagination
      );

      return result.data.map((course) => ({
        id: course.id || "",
        ...course,
      }));
    } catch (error) {
      logger.error("Error getting courses by category:", error);
      throw error;
    }
  }

  /**
   * Search courses by name or description
   */
  async searchCourses(
    searchTerm: string,
    limit: number = 10
  ): Promise<Course[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      // Firestore doesn't support full-text search natively
      // We'll implement a basic prefix search on name field
      const conditions: QueryOptions[] = [
        { field: "name", operator: ">=", value: searchTerm.toLowerCase() },
        {
          field: "name",
          operator: "<=",
          value: searchTerm.toLowerCase() + "\uf8ff",
        },
        { field: "isActive", operator: "==", value: true },
      ];

      const pagination: PaginationOptions = {
        limit,
        orderByField: "name",
        orderDirection: "asc",
      };

      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        conditions,
        pagination
      );

      return result.data.map((course) => ({
        id: course.id || "",
        ...course,
      }));
    } catch (error) {
      logger.error("Error searching courses:", error);
      throw error;
    }
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    try {
      const conditions: QueryOptions[] = [
        { field: "isActive", operator: "==", value: true },
        { field: "isFeatured", operator: "==", value: true },
      ];

      const pagination: PaginationOptions = {
        limit,
        orderByField: "createdAt",
        orderDirection: "desc",
      };

      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        conditions,
        pagination
      );

      return result.data.map((course) => ({
        id: course.id || "",
        ...course,
      }));
    } catch (error) {
      logger.error("Error getting featured courses:", error);
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(
    id: string,
    updateData: Partial<CourseRequest>
  ): Promise<Course> {
    try {
      // Check if course exists
      const existingCourse = await this.getCourseById(id);

      await FirestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );

      logger.info("Course updated successfully", { courseId: id });

      const updatedCourse = await this.getCourseById(id);
      return updatedCourse;
    } catch (error) {
      logger.error("Error updating course:", error);
      throw error;
    }
  }

  /**
   * Delete course (soft delete by setting isActive to false)
   */
  async deleteCourse(id: string): Promise<void> {
    try {
      await FirestoreService.updateDocument(this.collectionName, id, {
        isActive: false,
      });

      logger.info("Course deleted successfully", { courseId: id });
    } catch (error) {
      logger.error("Error deleting course:", error);
      throw error;
    }
  }

  /**
   * Subscribe to course updates
   */
  subscribeToCourses(
    callback: (courses: Course[]) => void,
    conditions: QueryOptions[] = [
      { field: "isActive", operator: "==", value: true },
    ],
    pagination: PaginationOptions = { limit: 50 }
  ): () => void {
    return FirestoreService.subscribeToCollection<Course>(
      this.collectionName,
      conditions,
      (docs) => {
        const courses = docs.map((doc) => ({
          id: doc.id,
          ...doc.data,
        }));
        callback(courses);
      },
      pagination
    );
  }

  /**
   * Get course statistics
   */
  async getCourseStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    featured: number;
  }> {
    try {
      const [totalResult, activeResult, inactiveResult, featuredResult] =
        await Promise.all([
          FirestoreService.getAllDocuments(this.collectionName),
          FirestoreService.queryDocuments(this.collectionName, [
            { field: "isActive", operator: "==", value: true },
          ]),
          FirestoreService.queryDocuments(this.collectionName, [
            { field: "isActive", operator: "==", value: false },
          ]),
          FirestoreService.queryDocuments(this.collectionName, [
            { field: "isFeatured", operator: "==", value: true },
          ]),
        ]);

      return {
        total: totalResult.data.length,
        active: activeResult.data.length,
        inactive: inactiveResult.data.length,
        featured: featuredResult.data.length,
      };
    } catch (error) {
      logger.error("Error getting course statistics:", error);
      throw error;
    }
  }

  /**
   * Extract keywords from course content for search
   */
  private extractKeywords(content: string): string[] {
    if (!content) return [];

    // Simple keyword extraction
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    // Remove duplicates and empty strings
    return Array.from(new Set(words.filter((keyword) => keyword.length > 2)));
  }
}

export const courseService = new CourseService();
