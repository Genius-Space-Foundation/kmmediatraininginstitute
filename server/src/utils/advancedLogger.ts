import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { config } from "../config";

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (stack) {
      log += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport for development
if (config.server.nodeEnv !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// File transports for production
if (config.server.nodeEnv === "production") {
  // Error logs
  transports.push(
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
      format: logFormat,
    })
  );

  // Combined logs
  transports.push(
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      format: logFormat,
    })
  );

  // Access logs
  transports.push(
    new DailyRotateFile({
      filename: "logs/access-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "info",
      maxSize: "20m",
      maxFiles: "7d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.server.nodeEnv === "production" ? "info" : "debug",
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create access logger for HTTP requests
export const accessLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports:
    config.server.nodeEnv === "production"
      ? [
          new DailyRotateFile({
            filename: "logs/access-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "7d",
          }),
        ]
      : [new winston.transports.Console()],
});

// Performance monitoring
export const performanceLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports:
    config.server.nodeEnv === "production"
      ? [
          new DailyRotateFile({
            filename: "logs/performance-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
          }),
        ]
      : [new winston.transports.Console()],
});

// Error tracking with context
export const trackError = (error: Error, context?: any) => {
  logger.error("Application Error", {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Performance tracking
export const trackPerformance = (
  operation: string,
  duration: number,
  metadata?: any
) => {
  performanceLogger.info("Performance Metric", {
    operation,
    duration,
    metadata,
    timestamp: new Date().toISOString(),
  });
};

// Request tracking
export const trackRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userAgent?: string
) => {
  accessLogger.info("HTTP Request", {
    method,
    url,
    statusCode,
    duration,
    userAgent,
    timestamp: new Date().toISOString(),
  });
};

// Business event tracking
export const trackEvent = (event: string, userId?: number, metadata?: any) => {
  logger.info("Business Event", {
    event,
    userId,
    metadata,
    timestamp: new Date().toISOString(),
  });
};
