import { Request, Response, NextFunction } from "express";
import { BaseController } from "./BaseController";
import { userService } from "../services/UserService";
import { RegisterRequest, LoginRequest, AuthRequest } from "../types";

export class AuthController extends BaseController {
  async register(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const userData: RegisterRequest = req.body;
      return await userService.register(userData);
    });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const credentials: LoginRequest = req.body;
      return await userService.login(credentials);
    });
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const userId = this.getUserId(req);
      return await userService.getUserById(userId);
    });
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    await this.handleRequest(req, res, next, async () => {
      const userId = this.getUserId(req);
      const updateData = req.body;
      return await userService.updateUser(userId, updateData);
    });
  }
}

export const authController = new AuthController();
