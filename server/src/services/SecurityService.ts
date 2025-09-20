import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { logger } from "../utils/logger";
import { User } from "../types/entities";

export class SecurityService {
  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = config.bcrypt.saltRounds;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error("Error hashing password:", error);
      throw new Error("Password hashing failed");
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error("Error comparing password:", error);
      return false;
    }
  }

  generateToken(user: Omit<User, "password_hash">): string {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      };

      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
    } catch (error) {
      logger.error("Error generating token:", error);
      throw new Error("Token generation failed");
    }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
    } catch (error) {
      logger.error("Error verifying token:", error);
      throw new Error("Invalid token");
    }
  }

  generateRefreshToken(userId: string): string {
    try {
      const payload = {
        userId,
        type: "refresh",
      };

      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: "7d", // Refresh tokens last 7 days
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
    } catch (error) {
      logger.error("Error generating refresh token:", error);
      throw new Error("Refresh token generation failed");
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }) as any;

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      logger.error("Error verifying refresh token:", error);
      throw new Error("Invalid refresh token");
    }
  }

  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    // Check for common passwords
    const commonPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("Password is too common, please choose a stronger password");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes
      .replace(/[;]/g, "") // Remove semicolons
      .substring(0, 1000); // Limit length
  }

  generateSecureRandomString(length: number = 32): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  generateAPIKey(): string {
    const prefix = "km_";
    const randomPart = this.generateSecureRandomString(32);
    return `${prefix}${randomPart}`;
  }

  validateAPIKey(apiKey: string): boolean {
    const apiKeyRegex = /^km_[A-Za-z0-9]{32}$/;
    return apiKeyRegex.test(apiKey);
  }

  async logSecurityEvent(
    event: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: any
  ): Promise<void> {
    try {
      logger.warn("Security Event", {
        event,
        userId,
        ipAddress,
        userAgent,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Error logging security event:", error);
    }
  }

  detectSuspiciousActivity(
    ipAddress: string,
    userAgent: string,
    requestCount: number,
    timeWindow: number
  ): boolean {
    // Simple rate limiting detection
    const requestsPerMinute = requestCount / (timeWindow / 60000);

    if (requestsPerMinute > 100) {
      this.logSecurityEvent(
        "High request rate detected",
        undefined,
        ipAddress,
        userAgent,
        {
          requestsPerMinute,
          timeWindow,
        }
      );
      return true;
    }

    // Detect potential bot activity
    const suspiciousUserAgents = [
      "bot",
      "crawler",
      "spider",
      "scraper",
      "curl",
      "wget",
      "python-requests",
    ];

    const isSuspiciousUA = suspiciousUserAgents.some((ua) =>
      userAgent.toLowerCase().includes(ua)
    );

    if (isSuspiciousUA) {
      this.logSecurityEvent(
        "Suspicious user agent detected",
        undefined,
        ipAddress,
        userAgent
      );
      return true;
    }

    return false;
  }

  generateCSRFToken(): string {
    return this.generateSecureRandomString(32);
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  async encryptSensitiveData(data: string): Promise<string> {
    // In a real implementation, you would use a proper encryption library
    // For now, we'll use a simple base64 encoding (NOT secure for production)
    return Buffer.from(data).toString("base64");
  }

  async decryptSensitiveData(encryptedData: string): Promise<string> {
    // In a real implementation, you would use a proper decryption library
    // For now, we'll use a simple base64 decoding (NOT secure for production)
    return Buffer.from(encryptedData, "base64").toString("utf-8");
  }

  validateFileUpload(
    filename: string,
    mimetype: string,
    size: number
  ): { isValid: boolean; error?: string } {
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (size > maxSize) {
      return {
        isValid: false,
        error: "File size exceeds 10MB limit",
      };
    }

    // Check file extension
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".pdf",
      ".doc",
      ".docx",
    ];
    const fileExtension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: "File type not allowed",
      };
    }

    // Check MIME type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(mimetype)) {
      return {
        isValid: false,
        error: "File MIME type not allowed",
      };
    }

    return { isValid: true };
  }

  generatePasswordResetToken(): string {
    return this.generateSecureRandomString(32);
  }

  generateEmailVerificationToken(): string {
    return this.generateSecureRandomString(32);
  }

  validatePhoneNumber(phone: string): boolean {
    // Basic phone number validation (adjust regex for your region)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  sanitizeSQLInput(input: string): string {
    // Basic SQL injection prevention
    return input
      .replace(/[';]/g, "") // Remove single quotes and semicolons
      .replace(/--/g, "") // Remove SQL comments
      .replace(/\/\*/g, "") // Remove block comment starts
      .replace(/\*\//g, ""); // Remove block comment ends
  }
}



