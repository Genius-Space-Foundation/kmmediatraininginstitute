import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
// import nodemailer from "nodemailer"; // Uncomment and configure for real email

const router = Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { name, email, message } = req.body;

    try {
      // Log the enquiry (replace with DB save if needed)
      console.log("New enquiry received:", { name, email, message });

      // TODO: Send email using nodemailer or another service
      // Example (uncomment and configure):
      // const transporter = nodemailer.createTransport({ /* SMTP config */ });
      // await transporter.sendMail({
      //   from: process.env.EMAIL_FROM,
      //   to: process.env.EMAIL_TO,
      //   subject: `New Enquiry from ${name}`,
      //   text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      // });

      return res.json({
        success: true,
        message: "Enquiry received. We'll be in touch soon!",
      });
    } catch (error) {
      console.error("Enquiry error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process enquiry. Please try again later.",
      });
    }
  }
);

export default router;
