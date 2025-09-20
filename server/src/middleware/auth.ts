import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { config } from "../config";

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, config.jwt.secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = (req.headers as any)["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
  next();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

export const requireTrainer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "trainer") {
    return res.status(403).json({
      success: false,
      message: "Trainer access required",
    });
  }

  next();
};

export const requireAdminOrTrainer = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "trainer") {
    return res.status(403).json({
      success: false,
      message: "Admin or trainer access required",
    });
  }

  next();
};

export const requireUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  next();
};
