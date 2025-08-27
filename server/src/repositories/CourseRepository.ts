import { BaseRepository } from "./BaseRepository";
import { Course, CourseWithTrainer } from "../types";
import { NotFoundError } from "../utils/errors";

export class CourseRepository extends BaseRepository {
  async findById(id: number): Promise<CourseWithTrainer | null> {
    const sql = `
      SELECT c.*, u.id as instructorId, u."firstName" as instructorFirstName, u."lastName" as instructorLastName, u.specialization as instructorSpecialization
      FROM courses c
      LEFT JOIN users u ON c."instructorId" = u.id
      WHERE c.id = $1
    `;
    const result = await this.queryOne<any>(sql, [id]);

    if (!result) return null;

    return this.transformToCourseWithInstructor(result);
  }

  async create(
    courseData: Omit<Course, "id" | "createdAt" | "updatedAt"> & {
      instructorId?: number | undefined;
    }
  ): Promise<CourseWithTrainer> {
    const sql = `
      INSERT INTO courses (name, description, excerpt, duration, price, "maxStudents", level, category, "instructorId", "isActive", "featuredImage", syllabus, requirements, "learningOutcomes")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `;

    const result = await this.query<{ id: number }>(sql, [
      courseData.name,
      courseData.description,
      courseData.excerpt || "",
      courseData.duration,
      courseData.price,
      courseData.maxStudents,
      courseData.level || "beginner",
      courseData.category,
      courseData.instructorId || null,
      courseData.isActive !== undefined ? courseData.isActive : true,
      courseData.featuredImage || null,
      courseData.syllabus || "",
      courseData.requirements || "",
      courseData.learningOutcomes || "",
    ]);

    const lastID = result[0]?.id;
    if (!lastID) {
      throw new NotFoundError("Failed to create course");
    }

    const course = await this.findById(lastID);
    if (!course) {
      throw new NotFoundError("Failed to create course");
    }

    return course;
  }

  async update(
    id: number,
    updateData: Partial<Course>
  ): Promise<CourseWithTrainer> {
    const { clause, params } = this.buildUpdateClause(updateData);

    if (!clause) {
      throw new Error("No valid fields to update");
    }

    const sql = `UPDATE courses SET ${clause}, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $${
      params.length + 1
    }`;
    const { changes } = await this.execute(sql, [...params, id]);

    if (changes === 0) {
      throw new NotFoundError("Course not found");
    }

    const course = await this.findById(id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return course;
  }

  async delete(id: number): Promise<void> {
    const sql = "DELETE FROM courses WHERE id = $1";
    const { changes } = await this.execute(sql, [id]);

    if (changes === 0) {
      throw new NotFoundError("Course not found");
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    category?: string
  ): Promise<{
    courses: CourseWithTrainer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const whereClause = category ? "WHERE c.category = $1" : "";
    const params = category ? [category, limit, offset] : [limit, offset];

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM courses c ${whereClause}`;
    const total = await this.count(countQuery, category ? [category] : []);

    // Get courses for current page
    const query = `
      SELECT c.*, u.id as instructorId, u."firstName" as instructorFirstName, u."lastName" as instructorLastName, u.specialization as instructorSpecialization
      FROM courses c
      LEFT JOIN users u ON c."instructorId" = u.id
      ${whereClause}
      ORDER BY c."createdAt" DESC
      LIMIT $${category ? 2 : 1} OFFSET $${category ? 3 : 2}
    `;

    const results = await this.query<any>(query, params);
    const courses = results.map((result) =>
      this.transformToCourseWithInstructor(result)
    );

    return {
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByInstructorId(instructorId: number): Promise<CourseWithTrainer[]> {
    const sql = `
      SELECT c.*, u.id as instructorId, u."firstName" as instructorFirstName, u."lastName" as instructorLastName, u.specialization as instructorSpecialization
      FROM courses c
      LEFT JOIN users u ON c."instructorId" = u.id
      WHERE c."instructorId" = $1
      ORDER BY c."createdAt" DESC
    `;

    const results = await this.query<any>(sql, [instructorId]);
    return results.map((result) =>
      this.transformToCourseWithInstructor(result)
    );
  }

  async toggleStatus(id: number): Promise<CourseWithTrainer> {
    const sql =
      'UPDATE courses SET "isActive" = NOT "isActive", "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1';
    const { changes } = await this.execute(sql, [id]);

    if (changes === 0) {
      throw new NotFoundError("Course not found");
    }

    const course = await this.findById(id);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return course;
  }

  private transformToCourseWithInstructor(result: any): CourseWithTrainer {
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      duration: result.duration,
      price: result.price,
      maxStudents: result.maxStudents,
      category: result.category,
      isActive: Boolean(result.isActive),
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      instructorId: result.instructorId,
      instructor: result.instructorId
        ? {
            id: result.instructorId,
            firstName: result.instructorFirstName,
            lastName: result.instructorLastName,
            specialization: result.instructorSpecialization,
          }
        : undefined,
    };
  }
}

export const courseRepository = new CourseRepository();
