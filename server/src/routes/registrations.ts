import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  requireAdmin,
  requireUser,
} from "../middleware/auth";
import { AuthRequest, RegistrationRequest } from "../types";
import { db } from "../database/database";

const router = Router();

// Registration validation
const registrationValidation = [
  body("courseId").isInt({ min: 1 }).withMessage("Valid course ID is required"),

  // Personal Information validation
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("dateOfBirth")
    .trim()
    .notEmpty()
    .withMessage("Date of birth is required"),
  body("residentialAddress")
    .trim()
    .notEmpty()
    .withMessage("Residential address is required"),
  body("nationality").trim().notEmpty().withMessage("Nationality is required"),
  body("maritalStatus")
    .trim()
    .notEmpty()
    .withMessage("Marital status is required"),
  body("occupation").trim().notEmpty().withMessage("Occupation is required"),

  // Educational Background validation
  body("levelOfEducation")
    .trim()
    .notEmpty()
    .withMessage("Level of education is required"),
  body("nameOfSchool")
    .trim()
    .notEmpty()
    .withMessage("Name of school is required"),
  body("yearAttendedFrom")
    .trim()
    .notEmpty()
    .withMessage("Year attended from is required"),
  body("yearAttendedTo")
    .trim()
    .notEmpty()
    .withMessage("Year attended to is required"),
];

// Check if user has applied for a specific course
router.get(
  "/check/:courseId",
  authenticateToken,
  requireUser,
  (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const courseId = req.params.courseId;

    db.get(
      `SELECT id FROM registrations WHERE userId = ? AND courseId = ?`,
      [userId, courseId],
      (err, registration) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        res.json({
          success: true,
          data: { hasApplied: !!registration },
        });
      }
    );
  }
);

// Get user's registrations
router.get(
  "/my",
  authenticateToken,
  requireUser,
  (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    db.all(
      `
    SELECT r.*, c.name as courseName, c.description as courseDescription, c.duration, c.price
    FROM registrations r
    JOIN courses c ON r.courseId = c.id
    WHERE r.userId = ?
    ORDER BY r.createdAt DESC
  `,
      [userId],
      (err, registrations) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        res.json({
          success: true,
          data: { registrations },
        });
      }
    );
  }
);

// Register for a course
router.post(
  "/",
  authenticateToken,
  requireUser,
  registrationValidation,
  (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const userId = req.user!.id;
      const {
        courseId,
        firstName,
        lastName,
        email,
        phone,
        fullName,
        dateOfBirth,
        residentialAddress,
        nationality,
        religion,
        maritalStatus,
        occupation,
        telephone,
        levelOfEducation,
        nameOfSchool,
        yearAttendedFrom,
        yearAttendedTo,
        certificateObtained,
        notes,
      }: RegistrationRequest = req.body;

      // Check if course exists and is active
      db.get(
        "SELECT * FROM courses WHERE id = ? AND isActive = 1",
        [courseId],
        (err, course: any) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Database error",
            });
          }

          if (!course) {
            return res.status(404).json({
              success: false,
              message: "Course not found or inactive",
            });
          }

          // Check if user is already registered for this course
          db.get(
            "SELECT id FROM registrations WHERE userId = ? AND courseId = ?",
            [userId, courseId],
            (err, existing) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: "Database error",
                });
              }

              if (existing) {
                return res.status(400).json({
                  success: false,
                  message: "You are already registered for this course",
                });
              }

              // Check if course is full
              db.get(
                `
          SELECT COUNT(*) as count 
          FROM registrations 
          WHERE courseId = ? AND status IN ('pending', 'approved')
        `,
                [courseId],
                (err, result: any) => {
                  if (err) {
                    return res.status(500).json({
                      success: false,
                      message: "Database error",
                    });
                  }

                  if (result.count >= course.maxStudents) {
                    return res.status(400).json({
                      success: false,
                      message: "Course is full",
                    });
                  }

                  // Create registration
                  db.run(
                    `
            INSERT INTO registrations (
              "userId", "courseId", "firstName", "lastName", email, phone, "fullName", 
              "dateOfBirth", "residentialAddress", nationality, religion, "maritalStatus", 
              occupation, telephone, "levelOfEducation", "nameOfSchool", "yearAttendedFrom", 
              "yearAttendedTo", "certificateObtained", notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
                    [
                      userId,
                      courseId,
                      firstName,
                      lastName,
                      email,
                      phone,
                      fullName,
                      dateOfBirth,
                      residentialAddress,
                      nationality,
                      religion || null,
                      maritalStatus,
                      occupation,
                      telephone || null,
                      levelOfEducation,
                      nameOfSchool,
                      yearAttendedFrom,
                      yearAttendedTo,
                      certificateObtained || null,
                      notes || null,
                    ],
                    function (err) {
                      if (err) {
                        return res.status(500).json({
                          success: false,
                          message: "Error creating registration",
                        });
                      }

                      res.status(201).json({
                        success: true,
                        message: "Registration successful",
                        data: {
                          registration: {
                            id: this.lastID,
                            userId,
                            courseId,
                            status: "pending",
                            firstName,
                            lastName,
                            email,
                            fullName,
                            notes: notes || null,
                          },
                        },
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Cancel registration (user can only cancel their own pending registrations)
router.delete(
  "/:id",
  authenticateToken,
  requireUser,
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    db.get(
      "SELECT * FROM registrations WHERE id = ? AND userId = ?",
      [id, userId],
      (err, registration: any) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        if (!registration) {
          return res.status(404).json({
            success: false,
            message: "Registration not found",
          });
        }

        if (registration.status !== "pending") {
          return res.status(400).json({
            success: false,
            message: "Can only cancel pending registrations",
          });
        }

        db.run("DELETE FROM registrations WHERE id = ?", [id], function (err) {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error canceling registration",
            });
          }

          res.json({
            success: true,
            message: "Registration canceled successfully",
          });
        });
      }
    );
  }
);

// Get all registrations (admin only)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  (req: Request, res: Response) => {
    db.all(
      `
    SELECT r.*, 
           u.firstName, u.lastName, u.email,
           c.name as courseName, c.description as courseDescription
    FROM registrations r
    JOIN users u ON r.userId = u.id
    JOIN courses c ON r.courseId = c.id
    ORDER BY r.createdAt DESC
  `,
      (err, registrations) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        res.json({
          success: true,
          data: { registrations },
        });
      }
    );
  }
);

// Update registration status (admin only)
router.patch(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    db.run(
      `
    UPDATE registrations 
    SET status = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
      [status, id],
      function (err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error updating registration status",
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({
            success: false,
            message: "Registration not found",
          });
        }

        res.json({
          success: true,
          message: "Registration status updated successfully",
        });
      }
    );
  }
);

// Get registrations by status (admin only)
router.get(
  "/admin/status/:status",
  authenticateToken,
  requireAdmin,
  (req: Request, res: Response) => {
    const { status } = req.params;
    const validStatuses = ["pending", "approved", "rejected", "completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    db.all(
      `
    SELECT r.*, 
           u.firstName, u.lastName, u.email,
           c.name as courseName, c.description as courseDescription
    FROM registrations r
    JOIN users u ON r.userId = u.id
    JOIN courses c ON r.courseId = c.id
    WHERE r.status = ?
    ORDER BY r.createdAt DESC
  `,
      [status],
      (err, registrations) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        }

        res.json({
          success: true,
          data: { registrations },
        });
      }
    );
  }
);

export default router;
