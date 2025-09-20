/**
 * Firestore Course Repository
 *
 * This repository handles all course-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { Course, CourseWithTrainer } from "../types";
import { NotFoundError } from "../utils/errors";

export interface FirestoreCourse extends Omit<Course, "id"> {
  id: string;
  status?: string; // Added status field for backward compatibility
  instructor?: {
    id: string;
    name: string;
    specialization: string;
  };
  categoryIndex: string;
  levelIndex: string;
  searchKeywords: string[];
  priceRange: string;
}

export class FirestoreCourseRepository extends FirestoreBaseRepository {
  constructor() {
    super("courses");
  }

  // Using base class findById method directly

  /**
   * Create a new course
   */
  async createCourse(courseData: {
    name: string;
    description: string;
    excerpt?: string;
    duration: string;
    price: number;
    maxStudents: number;
    level?: string;
    category: string;
    instructorId?: string;
    isActive?: boolean;
    featuredImage?: string;
    syllabus?: string;
    requirements?: string;
    learningOutcomes?: string;
  }): Promise<FirestoreCourse> {
    // Get instructor data if instructorId is provided
    let instructor = null;
    if (courseData.instructorId) {
      try {
        const instructorDoc = await FirestoreUtils.getDocument(
          "users",
          courseData.instructorId
        ).get();
        if (instructorDoc.exists) {
          const instructorData = instructorDoc.data()!;
          instructor = {
            id: courseData.instructorId,
            name: `${instructorData.firstName} ${instructorData.lastName}`,
            specialization: instructorData.specialization || "",
          };
        }
      } catch (error) {
        console.warn("Could not fetch instructor data:", error);
      }
    }

    const courseDataWithIndexes = {
      ...courseData,
      level: courseData.level || "beginner",
      isActive: courseData.isActive !== undefined ? courseData.isActive : true,
      instructor: instructor || undefined,
      categoryIndex: courseData.category,
      levelIndex: courseData.level || "beginner",
      searchKeywords: this.generateSearchKeywords(
        courseData.name,
        courseData.description,
        courseData.category
      ),
      priceRange: this.categorizePrice(courseData.price),
    };

    return super.create(courseDataWithIndexes);
  }

  /**
   * Update course
   */
  async updateCourse(
    id: string,
    updateData: Partial<FirestoreCourse>
  ): Promise<FirestoreCourse> {
    // Update indexed fields if relevant data changes
    if (updateData.name || updateData.description || updateData.category) {
      const currentCourse = await this.findById<FirestoreCourse>(id);
      if (currentCourse) {
        const name = updateData.name || currentCourse.name;
        const description = updateData.description || currentCourse.description;
        const category = updateData.category || currentCourse.category;

        updateData.searchKeywords = this.generateSearchKeywords(
          name,
          description,
          category
        );
        updateData.categoryIndex = category;
      }
    }

    if (updateData.level) {
      updateData.levelIndex = updateData.level;
    }

    if (updateData.price) {
      updateData.priceRange = this.categorizePrice(updateData.price);
    }

    // Update instructor data if instructorId changes
    if (updateData.instructorId) {
      try {
        const instructorDoc = await FirestoreUtils.getDocument(
          "users",
          updateData.instructorId
        ).get();
        if (instructorDoc.exists) {
          const instructorData = instructorDoc.data()!;
          updateData.instructor = {
            id: updateData.instructorId,
            name: `${instructorData.firstName} ${instructorData.lastName}`,
            specialization: instructorData.specialization || "",
          };
        }
      } catch (error) {
        console.warn("Could not fetch instructor data:", error);
      }
    }

    return super.update(id, updateData);
  }

  /**
   * Delete course
   */
  async delete(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Get all courses with pagination
   */
  async findAllCourses(
    page: number = 1,
    limit: number = 10,
    category?: string,
    level?: string,
    isActive?: boolean
  ): Promise<{
    courses: FirestoreCourse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const searchConditions = [];

      if (category) {
        searchConditions.push({
          field: "categoryIndex",
          operator: "==" as const,
          value: category,
        });
      }

      if (level) {
        searchConditions.push({
          field: "levelIndex",
          operator: "==" as const,
          value: level,
        });
      }

      if (isActive !== undefined) {
        searchConditions.push({
          field: "isActive",
          operator: "==" as const,
          value: isActive,
        });
      }

      const courses = await this.search<FirestoreCourse>(
        searchConditions,
        limit,
        "createdAt",
        "desc"
      );

      // For total count, we need to count without limit
      let total = await this.count();
      if (searchConditions.length > 0) {
        const allCourses = await this.search<FirestoreCourse>(searchConditions);
        total = allCourses.length;
      }

      return {
        courses,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error getting all courses:", error);
      throw error;
    }
  }

  /**
   * Get courses by instructor
   */
  async findByInstructorId(instructorId: string): Promise<FirestoreCourse[]> {
    return this.findByField<FirestoreCourse>("instructorId", instructorId);
  }

  /**
   * Get active courses
   */
  async findActiveCourses(limit?: number): Promise<FirestoreCourse[]> {
    return this.findByField<FirestoreCourse>("isActive", true, limit);
  }

  /**
   * Get courses by category
   */
  async findByCategory(
    category: string,
    limit?: number
  ): Promise<FirestoreCourse[]> {
    return this.findByField<FirestoreCourse>("categoryIndex", category, limit);
  }

  /**
   * Toggle course active status
   */
  async toggleStatus(id: string): Promise<FirestoreCourse> {
    try {
      const course = await this.findById<FirestoreCourse>(id);
      if (!course) {
        throw new NotFoundError("Course not found");
      }

      return this.update(id, {
        isActive: !course.isActive,
      } as Partial<FirestoreCourse>);
    } catch (error) {
      console.error("Error toggling course status:", error);
      throw error;
    }
  }

  /**
   * Search courses
   */
  async searchCourses(
    searchTerm: string,
    limit: number = 10
  ): Promise<FirestoreCourse[]> {
    try {
      const searchTermLower = searchTerm.toLowerCase();

      // Search in searchKeywords array
      const courses = await FirestoreUtils.searchDocuments(
        this.collectionName,
        "searchKeywords",
        searchTermLower,
        limit
      );

      return courses;
    } catch (error) {
      console.error("Error searching courses:", error);
      return [];
    }
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses(limit: number = 5): Promise<FirestoreCourse[]> {
    try {
      const searchConditions = [
        {
          field: "isActive",
          operator: "==" as const,
          value: true,
        },
      ];

      return this.search<FirestoreCourse>(
        searchConditions,
        limit,
        "createdAt",
        "desc"
      );
    } catch (error) {
      console.error("Error getting featured courses:", error);
      return [];
    }
  }

  /**
   * Get course statistics
   */
  async getCourseStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    byLevel: Record<string, number>;
  }> {
    try {
      const total = await this.count();
      const active = await this.countByField("isActive", true);
      const courses = await this.findAll<FirestoreCourse>();

      const byCategory = courses.reduce((acc, course) => {
        acc[course.category] = (acc[course.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byLevel = courses.reduce((acc, course) => {
        acc[course.level || "beginner"] =
          (acc[course.level || "beginner"] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, active, byCategory, byLevel };
    } catch (error) {
      console.error("Error getting course stats:", error);
      return { total: 0, active: 0, byCategory: {}, byLevel: {} };
    }
  }

  /**
   * Get course materials
   */
  async getCourseMaterials(courseId: string): Promise<any[]> {
    try {
      const materialsSnapshot = await FirestoreUtils.getSubcollection(
        "courses",
        courseId,
        "materials"
      )
        .orderBy("orderIndex")
        .get();

      return materialsSnapshot.docs.map((doc) =>
        FirestoreUtils.docToObject(doc)
      );
    } catch (error) {
      console.error("Error getting course materials:", error);
      return [];
    }
  }

  /**
   * Get course assignments
   */
  async getCourseAssignments(courseId: string): Promise<any[]> {
    try {
      const assignmentsSnapshot = await FirestoreUtils.getSubcollection(
        "courses",
        courseId,
        "assignments"
      )
        .orderBy("dueDate")
        .get();

      return assignmentsSnapshot.docs.map((doc) =>
        FirestoreUtils.docToObject(doc)
      );
    } catch (error) {
      console.error("Error getting course assignments:", error);
      return [];
    }
  }

  /**
   * Generate search keywords for a course
   */
  private generateSearchKeywords(
    name: string,
    description: string,
    category: string
  ): string[] {
    const keywords = [];

    if (name) keywords.push(...name.toLowerCase().split(" "));
    if (description) keywords.push(...description.toLowerCase().split(" "));
    if (category) keywords.push(category.toLowerCase());

    // Remove duplicates and empty strings
    return [...new Set(keywords.filter((keyword) => keyword.length > 2))];
  }

  /**
   * Categorize price range
   */
  private categorizePrice(price: number): string {
    if (price < 500) return "low";
    if (price < 1000) return "medium";
    return "high";
  }
}

export const firestoreCourseRepository = new FirestoreCourseRepository();
