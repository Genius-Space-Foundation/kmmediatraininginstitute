/**
 * Course Service
 *
 * This service handles course-related operations using Firestore.
 */

import { FirestoreService, FirestoreDocument } from "./firestoreService";

export interface Course extends FirestoreDocument {
  name: string;
  description: string;
  excerpt?: string;
  duration: string;
  price: number;
  maxStudents: number;
  level: "beginner" | "intermediate" | "advanced";
  category: "Tech" | "Media" | "Vocational";
  instructorId?: string;
  isActive?: boolean; // Made optional to handle both isActive and status fields
  status?: string; // Added status field for backward compatibility
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
  instructor?: {
    id: string;
    name: string;
    specialization: string;
  };
  categoryIndex?: string;
  levelIndex?: string;
  searchKeywords?: string[];
  priceRange?: string;
}

export interface CourseCreateRequest {
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
}

export interface CourseUpdateRequest {
  name?: string;
  description?: string;
  excerpt?: string;
  duration?: string;
  price?: number;
  maxStudents?: number;
  level?: string;
  category?: string;
  instructorId?: string;
  isActive?: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
  searchKeywords?: string[];
  categoryIndex?: string;
  levelIndex?: string;
  priceRange?: string;
}

export interface CourseMaterial extends FirestoreDocument {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  fileName: string;
  module?: string;
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  orderIndex: number;
}

export interface Assignment extends FirestoreDocument {
  title: string;
  description: string;
  dueDate?: string;
  maxScore: number;
  assignmentType: "individual" | "group";
  instructions?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isActive: boolean;
  allowLateSubmission: boolean;
  latePenalty: number;
}

export class CourseService {
  private static collectionName = "courses";

  /**
   * Get all courses with pagination and filtering
   */
  static async getAllCourses(
    page: number = 1,
    pageSize: number = 10,
    category?: string,
    level?: string,
    isActive?: boolean
  ): Promise<{ courses: Course[]; hasMore: boolean; total?: number }> {
    try {
      const conditions = [];

      if (category) {
        conditions.push({
          field: "categoryIndex",
          operator: "==" as const,
          value: category,
        });
      }

      if (level) {
        conditions.push({
          field: "levelIndex",
          operator: "==" as const,
          value: level,
        });
      }

      if (isActive !== undefined) {
        conditions.push({
          field: "isActive",
          operator: "==" as const,
          value: isActive,
        });
      }

      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        conditions,
        {
          pageSize,
          orderByField: "createdAt",
          orderDirection: "desc",
        }
      );

      return {
        courses: result.data,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Error getting all courses:", error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(courseId: string): Promise<Course | null> {
    try {
      return await FirestoreService.getDocument<Course>(
        this.collectionName,
        courseId
      );
    } catch (error) {
      console.error("Error getting course by ID:", error);
      return null;
    }
  }

  /**
   * Create a new course
   */
  static async createCourse(courseData: CourseCreateRequest): Promise<Course> {
    try {
      const courseToCreate = {
        ...courseData,
        level: courseData.level || "beginner",
        isActive:
          courseData.isActive !== undefined ? courseData.isActive : true,
        categoryIndex: courseData.category,
        levelIndex: courseData.level || "beginner",
        searchKeywords: this.generateSearchKeywords(
          courseData.name,
          courseData.description,
          courseData.category
        ),
        priceRange: this.categorizePrice(courseData.price),
      };

      return await FirestoreService.createDocument<Course>(
        this.collectionName,
        courseToCreate as any
      );
    } catch (error) {
      console.error("Error creating course:", error);
      throw error;
    }
  }

  /**
   * Update course
   */
  static async updateCourse(
    courseId: string,
    updateData: CourseUpdateRequest
  ): Promise<void> {
    try {
      // Update search keywords if name, description, or category changes
      if (updateData.name || updateData.description || updateData.category) {
        const currentCourse = await this.getCourseById(courseId);
        if (currentCourse) {
          const name = updateData.name || currentCourse.name;
          const description =
            updateData.description || currentCourse.description;
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

      await FirestoreService.updateDocument<Course>(
        this.collectionName,
        courseId,
        updateData as any
      );
    } catch (error) {
      console.error("Error updating course:", error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: string): Promise<void> {
    try {
      await FirestoreService.deleteDocument(this.collectionName, courseId);
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error;
    }
  }

  /**
   * Toggle course active status
   */
  static async toggleCourseStatus(courseId: string): Promise<void> {
    try {
      const course = await this.getCourseById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      await FirestoreService.updateDocument<Course>(
        this.collectionName,
        courseId,
        {
          isActive: !course.isActive,
        }
      );
    } catch (error) {
      console.error("Error toggling course status:", error);
      throw error;
    }
  }

  /**
   * Get courses by instructor
   */
  static async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    try {
      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        [{ field: "instructorId", operator: "==", value: instructorId }]
      );

      return result.data;
    } catch (error) {
      console.error("Error getting courses by instructor:", error);
      return [];
    }
  }

  /**
   * Get active courses
   */
  static async getActiveCourses(limit?: number): Promise<Course[]> {
    try {
      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        [{ field: "isActive", operator: "==", value: true }],
        { pageSize: limit }
      );

      return result.data;
    } catch (error) {
      console.error("Error getting active courses:", error);
      return [];
    }
  }

  /**
   * Get courses by category
   */
  static async getCoursesByCategory(
    category: string,
    limit?: number
  ): Promise<Course[]> {
    try {
      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        [{ field: "categoryIndex", operator: "==", value: category }],
        { pageSize: limit }
      );

      return result.data;
    } catch (error) {
      console.error("Error getting courses by category:", error);
      return [];
    }
  }

  /**
   * Search courses
   */
  static async searchCourses(
    searchTerm: string,
    limit?: number
  ): Promise<Course[]> {
    try {
      // This is a basic search implementation
      // For production, consider using Algolia or similar service
      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        [
          {
            field: "searchKeywords",
            operator: "array-contains",
            value: searchTerm.toLowerCase(),
          },
        ],
        { pageSize: limit }
      );

      return result.data;
    } catch (error) {
      console.error("Error searching courses:", error);
      return [];
    }
  }

  /**
   * Get featured courses
   */
  static async getFeaturedCourses(limit: number = 5): Promise<Course[]> {
    try {
      const result = await FirestoreService.queryDocuments<Course>(
        this.collectionName,
        [{ field: "isActive", operator: "==", value: true }],
        {
          pageSize: limit,
          orderByField: "createdAt",
          orderDirection: "desc",
        }
      );

      return result.data;
    } catch (error) {
      console.error("Error getting featured courses:", error);
      return [];
    }
  }

  /**
   * Get course materials
   */
  static async getCourseMaterials(
    courseId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ materials: CourseMaterial[]; hasMore: boolean }> {
    try {
      const result = await FirestoreService.getSubcollection<CourseMaterial>(
        this.collectionName,
        courseId,
        "materials",
        {
          pageSize,
          orderByField: "orderIndex",
          orderDirection: "asc",
        }
      );

      return {
        materials: result.data,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Error getting course materials:", error);
      return { materials: [], hasMore: false };
    }
  }

  /**
   * Get course assignments
   */
  static async getCourseAssignments(
    courseId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ assignments: Assignment[]; hasMore: boolean }> {
    try {
      const result = await FirestoreService.getSubcollection<Assignment>(
        this.collectionName,
        courseId,
        "assignments",
        {
          pageSize,
          orderByField: "dueDate",
          orderDirection: "asc",
        }
      );

      return {
        assignments: result.data,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Error getting course assignments:", error);
      return { assignments: [], hasMore: false };
    }
  }

  /**
   * Add course material
   */
  static async addCourseMaterial(
    courseId: string,
    materialData: Omit<CourseMaterial, "id" | "createdAt" | "updatedAt">
  ): Promise<CourseMaterial> {
    try {
      return await FirestoreService.createDocument<CourseMaterial>(
        `${this.collectionName}/${courseId}/materials`,
        materialData
      );
    } catch (error) {
      console.error("Error adding course material:", error);
      throw error;
    }
  }

  /**
   * Add course assignment
   */
  static async addCourseAssignment(
    courseId: string,
    assignmentData: Omit<Assignment, "id" | "createdAt" | "updatedAt">
  ): Promise<Assignment> {
    try {
      return await FirestoreService.createDocument<Assignment>(
        `${this.collectionName}/${courseId}/assignments`,
        assignmentData
      );
    } catch (error) {
      console.error("Error adding course assignment:", error);
      throw error;
    }
  }

  /**
   * Subscribe to course updates
   */
  static subscribeToCourse(
    courseId: string,
    callback: (course: Course | null) => void
  ): () => void {
    return FirestoreService.subscribeToDocument<Course>(
      this.collectionName,
      courseId,
      callback
    );
  }

  /**
   * Subscribe to all courses
   */
  static subscribeToAllCourses(
    callback: (courses: Course[]) => void,
    category?: string,
    isActive?: boolean
  ): () => void {
    const conditions = [];

    if (category) {
      conditions.push({
        field: "categoryIndex",
        operator: "==",
        value: category,
      });
    }

    if (isActive !== undefined) {
      conditions.push({ field: "isActive", operator: "==", value: isActive });
    }

    return FirestoreService.subscribeToCollection<Course>(
      this.collectionName,
      conditions as any,
      callback,
      {
        orderByField: "createdAt",
        orderDirection: "desc",
      }
    );
  }

  /**
   * Subscribe to course materials
   */
  static subscribeToCourseMaterials(
    courseId: string,
    callback: (materials: CourseMaterial[]) => void
  ): () => void {
    return FirestoreService.subscribeToSubcollection<CourseMaterial>(
      this.collectionName,
      courseId,
      "materials",
      callback,
      {
        orderByField: "orderIndex",
        orderDirection: "asc",
      }
    );
  }

  /**
   * Subscribe to course assignments
   */
  static subscribeToCourseAssignments(
    courseId: string,
    callback: (assignments: Assignment[]) => void
  ): () => void {
    return FirestoreService.subscribeToSubcollection<Assignment>(
      this.collectionName,
      courseId,
      "assignments",
      callback,
      {
        orderByField: "dueDate",
        orderDirection: "asc",
      }
    );
  }

  /**
   * Generate search keywords for a course
   */
  private static generateSearchKeywords(
    name: string,
    description: string,
    category: string
  ): string[] {
    const keywords = [];

    if (name) keywords.push(...name.toLowerCase().split(" "));
    if (description) keywords.push(...description.toLowerCase().split(" "));
    if (category) keywords.push(category.toLowerCase());

    // Remove duplicates and empty strings
    return Array.from(
      new Set(keywords.filter((keyword) => keyword.length > 2))
    );
  }

  /**
   * Categorize price range
   */
  private static categorizePrice(price: number): string {
    if (price < 500) return "low";
    if (price < 1000) return "medium";
    return "high";
  }
}

export default CourseService;
