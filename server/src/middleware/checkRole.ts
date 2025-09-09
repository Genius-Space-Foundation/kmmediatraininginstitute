import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AppError } from '../utils/errors';

/**
 * Middleware to check if the authenticated user has one of the required roles
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 */
export const checkRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            // Check if user is authenticated (should be handled by authenticateToken middleware first)
            if (!req.user) {
                throw new AppError('User not authenticated', 401);
            }

            // Check if user's role is in the allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                throw new AppError('Insufficient permissions', 403);
            }

            // User has required role, proceed to next middleware/route handler
            next();
        } catch (error) {
            next(error);
        }
    };
};
