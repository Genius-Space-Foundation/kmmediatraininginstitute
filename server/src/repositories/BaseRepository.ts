import { pool } from "../database/database";
import { logger } from "../utils/logger";
import { DatabaseError } from "../utils/errors";

export abstract class BaseRepository {
  protected async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows as T[];
    } catch (err) {
      logger.error("Database query error", {
        error: err instanceof Error ? err.message : String(err),
        sql,
        params,
      });
      throw new DatabaseError("Database operation failed");
    } finally {
      client.release();
    }
  }

  protected async queryOne<T>(
    sql: string,
    params: any[] = []
  ): Promise<T | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return (result.rows[0] as T) || null;
    } catch (err) {
      logger.error("Database query error", {
        error: err instanceof Error ? err.message : String(err),
        sql,
        params,
      });
      throw new DatabaseError("Database operation failed");
    } finally {
      client.release();
    }
  }

  protected async execute(
    sql: string,
    params: any[] = []
  ): Promise<{ lastID: number; changes: number }> {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return {
        lastID: result.rows[0]?.id || 0,
        changes: result.rowCount || 0,
      };
    } catch (err) {
      logger.error("Database execute error", {
        error: err instanceof Error ? err.message : String(err),
        sql,
        params,
      });
      throw new DatabaseError("Database operation failed");
    } finally {
      client.release();
    }
  }

  protected async count(sql: string, params: any[] = []): Promise<number> {
    const result = await this.queryOne<{ count: string }>(sql, params);
    return parseInt(result?.count || "0", 10);
  }

  protected buildWhereClause(conditions: Record<string, any>): {
    clause: string;
    params: any[];
  } {
    const clauses: string[] = [];
    const params: any[] = [];

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        clauses.push(`"${key}" = $${params.length + 1}`);
        params.push(value);
      }
    });

    return {
      clause: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
      params,
    };
  }

  protected buildUpdateClause(updates: Record<string, any>): {
    clause: string;
    params: any[];
  } {
    const clauses: string[] = [];
    const params: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        clauses.push(`"${key}" = $${params.length + 1}`);
        params.push(value);
      }
    });

    return {
      clause: clauses.join(", "),
      params,
    };
  }
}
