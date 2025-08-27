import { Router } from "express";
import { authController } from "../../controllers/AuthController";
import {
  createValidationMiddleware,
  validationChains,
} from "../../utils/validation";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

// Public routes
router.post(
  "/register",
  createValidationMiddleware(validationChains.register),
  authController.register.bind(authController)
);
router.post(
  "/login",
  createValidationMiddleware(validationChains.login),
  authController.login.bind(authController)
);

// Protected routes
router.get(
  "/profile",
  authenticateToken,
  authController.getProfile.bind(authController)
);
router.put(
  "/profile",
  authenticateToken,
  authController.updateProfile.bind(authController)
);

export default router;
