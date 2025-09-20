import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { logger } from "../utils/logger";

// General rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      retryAfter: "15 minutes",
    });
  },
});

// Authentication rate limiting (stricter)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Auth rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      message: "Too many authentication attempts, please try again later",
      retryAfter: "15 minutes",
    });
  },
});

// Payment rate limiting (very strict)
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: "Too many payment requests, please try again later",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Payment rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      message: "Too many payment requests, please try again later",
      retryAfter: "1 minute",
    });
  },
});

// File upload rate limiting
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 uploads per minute
  message: {
    success: false,
    message: "Too many file uploads, please try again later",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Upload rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      message: "Too many file uploads, please try again later",
      retryAfter: "1 minute",
    });
  },
});

// API key rate limiting (for external API access)
export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req: Request) => {
    // Use API key from header or user ID
    return (req.headers["x-api-key"] as string) || req.user?.id || req.ip;
  },
  message: {
    success: false,
    message: "API rate limit exceeded",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("API key rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
      apiKey: req.headers["x-api-key"],
    });

    res.status(429).json({
      success: false,
      message: "API rate limit exceeded",
      retryAfter: "1 minute",
    });
  },
});

// Per-user rate limiting
export const userRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per user per window
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    message: "Too many requests from this user, please try again later",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("User rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    });

    res.status(429).json({
      success: false,
      message: "Too many requests from this user, please try again later",
      retryAfter: "15 minutes",
    });
  },
});

// Admin rate limiting (more lenient)
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window
  message: {
    success: false,
    message: "Too many admin requests, please try again later",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Admin rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
      userId: req.user?.id,
    });

    res.status(429).json({
      success: false,
      message: "Too many admin requests, please try again later",
      retryAfter: "15 minutes",
    });
  },
});

// Webhook rate limiting (very lenient for external services)
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute
  message: {
    success: false,
    message: "Webhook rate limit exceeded",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn("Webhook rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
    });

    res.status(429).json({
      success: false,
      message: "Webhook rate limit exceeded",
      retryAfter: "1 minute",
    });
  },
});

// Dynamic rate limiting based on user role
export const dynamicRateLimit = (
  req: Request,
  res: Response,
  next: Function
) => {
  const userRole = req.user?.role;

  let maxRequests: number;
  let windowMs: number;

  switch (userRole) {
    case "admin":
      maxRequests = 500;
      windowMs = 15 * 60 * 1000; // 15 minutes
      break;
    case "trainer":
      maxRequests = 200;
      windowMs = 15 * 60 * 1000; // 15 minutes
      break;
    case "student":
      maxRequests = 100;
      windowMs = 15 * 60 * 1000; // 15 minutes
      break;
    default:
      maxRequests = 50;
      windowMs = 15 * 60 * 1000; // 15 minutes
  }

  const limiter = rateLimit({
    windowMs,
    max: maxRequests,
    keyGenerator: (req: Request) => req.user?.id || req.ip,
    message: {
      success: false,
      message: `Rate limit exceeded for ${userRole || "guest"} users`,
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  limiter(req, res, next);
};

// IP-based rate limiting for suspicious activity
export const suspiciousActivityRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 requests per 5 minutes
  keyGenerator: (req: Request) => req.ip,
  message: {
    success: false,
    message: "Suspicious activity detected, access temporarily restricted",
    retryAfter: "5 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.error("Suspicious activity rate limit exceeded", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });

    res.status(429).json({
      success: false,
      message: "Suspicious activity detected, access temporarily restricted",
      retryAfter: "5 minutes",
    });
  },
});



