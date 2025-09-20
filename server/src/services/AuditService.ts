import { pool } from "../database/database";
import { logger } from "../utils/logger";

export interface AuditLog {
  id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

export class AuditService {
  async logEvent(auditLog: Omit<AuditLog, "id" | "timestamp">): Promise<void> {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      const params = [
        auditLog.user_id,
        auditLog.action,
        auditLog.resource_type,
        auditLog.resource_id,
        JSON.stringify(auditLog.details),
        auditLog.ip_address,
        auditLog.user_agent,
      ];

      await pool.query(query, params);

      // Also log to application logger
      logger.info("Audit Event", {
        action: auditLog.action,
        resourceType: auditLog.resource_type,
        resourceId: auditLog.resource_id,
        userId: auditLog.user_id,
        ipAddress: auditLog.ip_address,
        details: auditLog.details,
      });
    } catch (error) {
      logger.error("Error logging audit event:", error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async getUserActivity(
    userId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE user_id = $1 
        ORDER BY timestamp DESC 
        LIMIT $2
      `;

      const result = await pool.query(query, [userId, limit]);
      return result.rows.map(this.mapRowToAuditLog);
    } catch (error) {
      logger.error("Error getting user activity:", error);
      throw error;
    }
  }

  async getResourceActivity(
    resourceType: string,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE resource_type = $1 AND resource_id = $2 
        ORDER BY timestamp DESC 
        LIMIT $3
      `;

      const result = await pool.query(query, [resourceType, resourceId, limit]);
      return result.rows.map(this.mapRowToAuditLog);
    } catch (error) {
      logger.error("Error getting resource activity:", error);
      throw error;
    }
  }

  async getSecurityEvents(limit: number = 100): Promise<AuditLog[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE action IN ('login_failed', 'password_changed', 'account_locked', 'suspicious_activity', 'unauthorized_access')
        ORDER BY timestamp DESC 
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows.map(this.mapRowToAuditLog);
    } catch (error) {
      logger.error("Error getting security events:", error);
      throw error;
    }
  }

  async getAuditStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalEvents: number;
    eventsByAction: { action: string; count: number }[];
    eventsByUser: { user_id: string; count: number }[];
    eventsByResource: { resource_type: string; count: number }[];
  }> {
    try {
      let whereClause = "";
      const params: any[] = [];
      let paramCount = 0;

      if (startDate) {
        paramCount++;
        whereClause += ` AND timestamp >= $${paramCount}`;
        params.push(startDate);
      }

      if (endDate) {
        paramCount++;
        whereClause += ` AND timestamp <= $${paramCount}`;
        params.push(endDate);
      }

      const [totalResult, actionResult, userResult, resourceResult] =
        await Promise.all([
          pool.query(
            `SELECT COUNT(*) as count FROM audit_logs WHERE 1=1 ${whereClause}`,
            params
          ),
          pool.query(
            `
          SELECT action, COUNT(*) as count 
          FROM audit_logs 
          WHERE 1=1 ${whereClause}
          GROUP BY action 
          ORDER BY count DESC
        `,
            params
          ),
          pool.query(
            `
          SELECT user_id, COUNT(*) as count 
          FROM audit_logs 
          WHERE 1=1 ${whereClause} AND user_id IS NOT NULL
          GROUP BY user_id 
          ORDER BY count DESC 
          LIMIT 10
        `,
            params
          ),
          pool.query(
            `
          SELECT resource_type, COUNT(*) as count 
          FROM audit_logs 
          WHERE 1=1 ${whereClause}
          GROUP BY resource_type 
          ORDER BY count DESC
        `,
            params
          ),
        ]);

      return {
        totalEvents: parseInt(totalResult.rows[0].count),
        eventsByAction: actionResult.rows.map((row) => ({
          action: row.action,
          count: parseInt(row.count),
        })),
        eventsByUser: userResult.rows.map((row) => ({
          user_id: row.user_id,
          count: parseInt(row.count),
        })),
        eventsByResource: resourceResult.rows.map((row) => ({
          resource_type: row.resource_type,
          count: parseInt(row.count),
        })),
      };
    } catch (error) {
      logger.error("Error getting audit stats:", error);
      throw error;
    }
  }

  // Helper methods for common audit events
  async logUserLogin(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: "login",
      resource_type: "user",
      resource_id: userId,
      details: { event: "user_login" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logUserLogout(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: "logout",
      resource_type: "user",
      resource_id: userId,
      details: { event: "user_logout" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logLoginFailed(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      action: "login_failed",
      resource_type: "user",
      details: { email, event: "login_failed" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logPasswordChange(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: "password_changed",
      resource_type: "user",
      resource_id: userId,
      details: { event: "password_changed" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logResourceCreate(
    userId: string,
    resourceType: string,
    resourceId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: "create",
      resource_type: resourceType,
      resource_id: resourceId,
      details: { ...details, event: "resource_created" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logResourceUpdate(
    userId: string,
    resourceType: string,
    resourceId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: "update",
      resource_type: resourceType,
      resource_id: resourceId,
      details: { ...details, event: "resource_updated" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logResourceDelete(
    userId: string,
    resourceType: string,
    resourceId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: "delete",
      resource_type: resourceType,
      resource_id: resourceId,
      details: { ...details, event: "resource_deleted" },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logPaymentEvent(
    userId: string,
    paymentId: string,
    action: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: `payment_${action}`,
      resource_type: "payment",
      resource_id: paymentId,
      details: { ...details, event: `payment_${action}` },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logSecurityEvent(
    event: string,
    details: any,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      action: event,
      resource_type: "security",
      details: { ...details, event },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  private mapRowToAuditLog(row: any): AuditLog {
    return {
      id: row.id,
      user_id: row.user_id,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      details:
        typeof row.details === "string" ? JSON.parse(row.details) : row.details,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      timestamp: row.timestamp,
    };
  }
}



