import { BaseRepository } from "./BaseRepository";
import { SuccessStory } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export class SuccessStoryRepository extends BaseRepository {
  async findById(id: string): Promise<SuccessStory | null> {
    const query = `
      SELECT s.*, u.first_name, u.last_name, u.email as student_email
      FROM success_stories s
      LEFT JOIN users u ON s.student_id = u.id
      WHERE s.id = $1
    `;
    return this.queryOne<SuccessStory>(query, [id]);
  }

  async findAll(pagination?: PaginationParams): Promise<SuccessStory[]> {
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email as student_email
      FROM success_stories s
      LEFT JOIN users u ON s.student_id = u.id
      WHERE s.is_active = true
    `;

    const params: any[] = [];

    if (pagination?.sort) {
      query += ` ORDER BY s.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<SuccessStory>(query, params);
  }

  async findFeatured(pagination?: PaginationParams): Promise<SuccessStory[]> {
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email as student_email
      FROM success_stories s
      LEFT JOIN users u ON s.student_id = u.id
      WHERE s.is_featured = true AND s.is_active = true
    `;

    const params: any[] = [];

    if (pagination?.sort) {
      query += ` ORDER BY s.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<SuccessStory>(query, params);
  }

  async findByStudentId(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<SuccessStory[]> {
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email as student_email
      FROM success_stories s
      LEFT JOIN users u ON s.student_id = u.id
      WHERE s.student_id = $1 AND s.is_active = true
    `;

    const params: any[] = [studentId];

    if (pagination?.sort) {
      query += ` ORDER BY s.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY s.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<SuccessStory>(query, params);
  }

  async create(
    story: Omit<SuccessStory, "id" | "created_at" | "updated_at">
  ): Promise<SuccessStory> {
    const query = `
      INSERT INTO success_stories (student_id, title, content, image_url, is_featured, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      story.student_id,
      story.title,
      story.content,
      story.image_url,
      story.is_featured,
      story.is_active,
    ];
    return this.queryOne<SuccessStory>(query, params);
  }

  async update(
    id: string,
    updates: Partial<SuccessStory>
  ): Promise<SuccessStory | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE success_stories 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof SuccessStory]),
    ];
    return this.queryOne<SuccessStory>(query, params);
  }

  async delete(id: string): Promise<boolean> {
    const query = "UPDATE success_stories SET is_active = false WHERE id = $1";
    const result = await this.query(query, [id]);
    return result.rowCount > 0;
  }

  async countFeatured(): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM success_stories WHERE is_featured = true AND is_active = true";
    const result = await this.queryOne<{ count: string }>(query);
    return parseInt(result.count);
  }

  async countByStudent(studentId: string): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM success_stories WHERE student_id = $1 AND is_active = true";
    const result = await this.queryOne<{ count: string }>(query, [studentId]);
    return parseInt(result.count);
  }
}



