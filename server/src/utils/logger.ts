import { config } from "../config";

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel =
      config.server.nodeEnv === "production" ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("ERROR", message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("WARN", message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("INFO", message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("DEBUG", message, meta));
    }
  }

  // Request logging helper
  request(method: string, path: string, duration?: number): void {
    const meta = duration ? { duration: `${duration}ms` } : undefined;
    this.info(`${method} ${path}`, meta);
  }
}

export const logger = new Logger();
