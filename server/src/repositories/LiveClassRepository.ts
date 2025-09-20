import { BaseRepository } from "./BaseRepository";
import { LiveClass, CatchupSession } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export class LiveClassRepository extends BaseRepository {
  async findById(id: string): Promise<LiveClass | null> {
    const query = `
      SELECT l.*, u.first_name, u.last_name, u.email as created_by_email,
             c.title as course_title, c.image_url as course_image
      FROM live_classes l
      LEFT JOIN users u ON l.created_by = u.id
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = $1
    `;
    return this.queryOne<LiveClass>(query, [id]);
  }

  async findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<LiveClass[]> {
    let query = `
      SELECT l.*, u.first_name, u.last_name, u.email as created_by_email,
             c.title as course_title, c.image_url as course_image
      FROM live_classes l
      LEFT JOIN users u ON l.created_by = u.id
      JOIN courses c ON l.course_id = c.id
      WHERE l.course_id = $1
    `;

    const params: any[] = [courseId];

    if (pagination?.sort) {
      query += ` ORDER BY l.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY l.scheduled_date ASC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<LiveClass>(query, params);
  }

  async findUpcoming(
    studentId?: string,
    days: number = 7
  ): Promise<LiveClass[]> {
    let query = `
      SELECT l.*, c.title as course_title, c.image_url as course_image,
             u.first_name, u.last_name, u.email as created_by_email
      FROM live_classes l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE l.scheduled_date > CURRENT_TIMESTAMP 
        AND l.scheduled_date <= CURRENT_TIMESTAMP + INTERVAL '${days} days'
        AND l.status IN ('scheduled', 'ongoing')
    `;

    const params: any[] = [];

    if (studentId) {
      query += ` AND EXISTS (
        SELECT 1 FROM course_registrations cr 
        WHERE cr.course_id = l.course_id 
        AND cr.student_id = $1 
        AND cr.status = 'approved'
      )`;
      params.push(studentId);
    }

    query += ` ORDER BY l.scheduled_date ASC`;

    return this.query<LiveClass>(query, params);
  }

  async findOngoing(): Promise<LiveClass[]> {
    const query = `
      SELECT l.*, c.title as course_title, c.image_url as course_image,
             u.first_name, u.last_name, u.email as created_by_email
      FROM live_classes l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE l.status = 'ongoing'
      ORDER BY l.scheduled_date ASC
    `;
    return this.query<LiveClass>(query);
  }

  async findCompleted(
    courseId?: string,
    pagination?: PaginationParams
  ): Promise<LiveClass[]> {
    let query = `
      SELECT l.*, c.title as course_title, c.image_url as course_image,
             u.first_name, u.last_name, u.email as created_by_email
      FROM live_classes l
      JOIN courses c ON l.course_id = c.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE l.status = 'completed'
    `;

    const params: any[] = [];

    if (courseId) {
      query += ` AND l.course_id = $1`;
      params.push(courseId);
    }

    query += ` ORDER BY l.scheduled_date DESC`;

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<LiveClass>(query, params);
  }

  async create(
    liveClass: Omit<LiveClass, "id" | "created_at" | "updated_at">
  ): Promise<LiveClass> {
    const query = `
      INSERT INTO live_classes (course_id, title, description, scheduled_date, 
                              duration_minutes, meeting_url, meeting_id, meeting_password, 
                              status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const params = [
      liveClass.course_id,
      liveClass.title,
      liveClass.description,
      liveClass.scheduled_date,
      liveClass.duration_minutes,
      liveClass.meeting_url,
      liveClass.meeting_id,
      liveClass.meeting_password,
      liveClass.status,
      liveClass.created_by,
    ];
    return this.queryOne<LiveClass>(query, params);
  }

  async update(
    id: string,
    updates: Partial<LiveClass>
  ): Promise<LiveClass | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE live_classes 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof LiveClass]),
    ];
    return this.queryOne<LiveClass>(query, params);
  }

  async delete(id: string): Promise<boolean> {
    const query = "UPDATE live_classes SET status = $1 WHERE id = $2";
    const result = await this.query(query, ["cancelled", id]);
    return result.rowCount > 0;
  }

  async countByCourseId(courseId: string): Promise<number> {
    const query =
      "SELECT COUNT(*) as count FROM live_classes WHERE course_id = $1";
    const result = await this.queryOne<{ count: string }>(query, [courseId]);
    return parseInt(result.count);
  }

  async getAttendeesCount(classId: string): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT cr.student_id) as count
      FROM live_classes l
      JOIN courses c ON l.course_id = c.id
      JOIN course_registrations cr ON c.id = cr.course_id
      WHERE l.id = $1 AND cr.status = 'approved'
    `;
    const result = await this.queryOne<{ count: string }>(query, [classId]);
    return parseInt(result.count);
  }

  // Catchup Session methods
  async findCatchupSessionById(id: string): Promise<CatchupSession | null> {
    const query = `
      SELECT c.*, l.title as original_class_title, l.scheduled_date as original_class_date,
             u.first_name, u.last_name, u.email as created_by_email
      FROM catchup_sessions c
      LEFT JOIN live_classes l ON c.original_class_id = l.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = $1
    `;
    return this.queryOne<CatchupSession>(query, [id]);
  }

  async findCatchupSessionsByCourse(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<CatchupSession[]> {
    let query = `
      SELECT c.*, l.title as original_class_title, l.scheduled_date as original_class_date,
             u.first_name, u.last_name, u.email as created_by_email
      FROM catchup_sessions c
      LEFT JOIN live_classes l ON c.original_class_id = l.id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.course_id = $1 AND c.is_active = true
    `;

    const params: any[] = [courseId];

    if (pagination?.sort) {
      query += ` ORDER BY c.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<CatchupSession>(query, params);
  }

  async createCatchupSession(
    session: Omit<CatchupSession, "id" | "created_at" | "updated_at">
  ): Promise<CatchupSession> {
    const query = `
      INSERT INTO catchup_sessions (course_id, title, description, recording_url, 
                                  duration_minutes, original_class_id, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [
      session.course_id,
      session.title,
      session.description,
      session.recording_url,
      session.duration_minutes,
      session.original_class_id,
      session.is_active,
      session.created_by,
    ];
    return this.queryOne<CatchupSession>(query, params);
  }

  async updateCatchupSession(
    id: string,
    updates: Partial<CatchupSession>
  ): Promise<CatchupSession | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE catchup_sessions 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof CatchupSession]),
    ];
    return this.queryOne<CatchupSession>(query, params);
  }

  async deleteCatchupSession(id: string): Promise<boolean> {
    const query = "UPDATE catchup_sessions SET is_active = false WHERE id = $1";
    const result = await this.query(query, [id]);
    return result.rowCount > 0;
  }
}



