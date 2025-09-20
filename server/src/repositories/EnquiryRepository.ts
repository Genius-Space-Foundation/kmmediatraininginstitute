import { BaseRepository } from "./BaseRepository";
import { Enquiry } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export class EnquiryRepository extends BaseRepository {
  async findById(id: string): Promise<Enquiry | null> {
    const query = `
      SELECT e.*, u.first_name, u.last_name, u.email as assigned_user_email
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_to = u.id
      WHERE e.id = $1
    `;
    return this.queryOne<Enquiry>(query, [id]);
  }

  async findAll(pagination?: PaginationParams): Promise<Enquiry[]> {
    let query = `
      SELECT e.*, u.first_name, u.last_name, u.email as assigned_user_email
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_to = u.id
    `;

    const params: any[] = [];

    if (pagination?.sort) {
      query += ` ORDER BY e.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY e.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<Enquiry>(query, params);
  }

  async findByStatus(
    status: string,
    pagination?: PaginationParams
  ): Promise<Enquiry[]> {
    let query = `
      SELECT e.*, u.first_name, u.last_name, u.email as assigned_user_email
      FROM enquiries e
      LEFT JOIN users u ON e.assigned_to = u.id
      WHERE e.status = $1
    `;

    const params: any[] = [status];

    if (pagination?.sort) {
      query += ` ORDER BY e.${pagination.sort} ${pagination.order || "ASC"}`;
    } else {
      query += ` ORDER BY e.created_at DESC`;
    }

    if (pagination?.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(pagination.limit);
    }

    if (pagination?.page && pagination?.limit) {
      query += ` OFFSET $${params.length + 1}`;
      params.push((pagination.page - 1) * pagination.limit);
    }

    return this.query<Enquiry>(query, params);
  }

  async create(
    enquiry: Omit<Enquiry, "id" | "created_at" | "updated_at">
  ): Promise<Enquiry> {
    const query = `
      INSERT INTO enquiries (name, email, phone, course_interest, message, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      enquiry.name,
      enquiry.email,
      enquiry.phone,
      enquiry.course_interest,
      enquiry.message,
      enquiry.status,
    ];
    return this.queryOne<Enquiry>(query, params);
  }

  async update(id: string, updates: Partial<Enquiry>): Promise<Enquiry | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "created_at"
    );
    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");

    if (!setClause) return null;

    const query = `
      UPDATE enquiries 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const params = [
      id,
      ...fields.map((field) => updates[field as keyof Enquiry]),
    ];
    return this.queryOne<Enquiry>(query, params);
  }

  async delete(id: string): Promise<boolean> {
    const query = "DELETE FROM enquiries WHERE id = $1";
    const result = await this.query(query, [id]);
    return result.rowCount > 0;
  }

  async countByStatus(status: string): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM enquiries WHERE status = $1";
    const result = await this.queryOne<{ count: string }>(query, [status]);
    return parseInt(result.count);
  }

  async getStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    enrolled: number;
    closed: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
        COUNT(CASE WHEN status = 'enrolled' THEN 1 END) as enrolled,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM enquiries
    `;
    const result = await this.queryOne<{
      total: string;
      new: string;
      contacted: string;
      enrolled: string;
      closed: string;
    }>(query);

    return {
      total: parseInt(result.total),
      new: parseInt(result.new),
      contacted: parseInt(result.contacted),
      enrolled: parseInt(result.enrolled),
      closed: parseInt(result.closed),
    };
  }
}



