import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError, createErrorResponse } from "../utils/errors";
import { AuthRequest } from "../types";

export abstract class BaseController {
  protected async handleRequest(
    req: Request,
    res: Response,
    next: NextFunction,
    handler: () => Promise<any>
  ) {
    const startTime = Date.now();

    try {
      const result = await handler();

      // Log request
      const duration = Date.now() - startTime;
      logger.request(req.method, req.path, duration);

      // Send success response
      res.json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      // Log error
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error("Request failed", {
        method: req.method,
        path: req.path,
        duration,
        error: errorMessage,
      });

      // Handle different types of errors
      if (error instanceof AppError) {
        res.status(error.statusCode).json(createErrorResponse(error));
      } else {
        // Handle unexpected errors
        const internalError = new AppError("Internal server error", 500, false);
        res.status(500).json(createErrorResponse(internalError));
      }
    }
  }

  protected sendSuccessResponse(
    res: Response,
    data: any,
    statusCode: number = 200
  ) {
    res.status(statusCode).json({
      success: true,
      data,
    });
  }

  protected sendErrorResponse(res: Response, error: AppError) {
    res.status(error.statusCode).json(createErrorResponse(error));
  }

  protected getPaginationParams(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    return { page, limit };
  }

  protected getUserId(req: AuthRequest): number {
    if (!req.user?.id) {
      throw new AppError("User not authenticated", 401);
    }
    return req.user.id;
  }

  protected requireRole(req: AuthRequest, allowedRoles: string[]) {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }
  }
}
