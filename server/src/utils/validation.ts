import {
  body,
  param,
  query,
  ValidationChain,
  validationResult,
} from "express-validator";
import { ValidationError } from "./errors";
import { Request, Response, NextFunction } from "express";

// Common validation rules
export const commonValidations = {
  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),

  password: body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  firstName: body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  lastName: body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required"),

  phone: body("phone")
    .optional()
    .isMobilePhone("any")
    .withMessage("Valid phone number is required"),

  address: body("address")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Address must be at least 5 characters"),

  id: param("id").isInt({ min: 1 }).withMessage("Valid ID is required"),

  page: query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  limit: query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
};

// Validation chains for different operations
export const validationChains = {
  register: [
    commonValidations.email,
    commonValidations.password,
    commonValidations.firstName,
    commonValidations.lastName,
    commonValidations.phone,
    commonValidations.address,
  ],

  login: [
    commonValidations.email,
    body("password").notEmpty().withMessage("Password is required"),
  ],

  course: [
    body("name").trim().notEmpty().withMessage("Course name is required"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required"),
    body("duration").trim().notEmpty().withMessage("Duration is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("maxStudents")
      .isInt({ min: 1 })
      .withMessage("Valid max students is required"),
    body("category")
      .isIn(["IT", "Media", "Vocational"])
      .withMessage("Valid category is required"),
  ],

  story: [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("excerpt").trim().notEmpty().withMessage("Excerpt is required"),
    body("category")
      .isIn([
        "success_story",
        "event",
        "fun_fact",
        "tip",
        "behind_scenes",
        "industry_news",
        "activity",
      ])
      .withMessage("Valid category is required"),
  ],

  pagination: [commonValidations.page, commonValidations.limit],
};

// Middleware to handle validation results
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError("Validation failed", errors.array());
  }
  next();
};

// Helper to create validation middleware
export const createValidationMiddleware = (validations: ValidationChain[]) => {
  return [...validations, validate];
};
