import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth";
import { AuthRequest } from "../types";
import { pool } from "../database/database";

const router = Router();

// Story validation
const storyValidation = [
  body("title").trim().notEmpty().withMessage("Story title is required"),
  body("content")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters"),
  body("category").trim().notEmpty().withMessage("Category is required"),
];

// Create new story (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  storyValidation,
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        title,
        content,
        excerpt,
        category,
        featuredImage,
        isPublished = false,
        isFeatured = false,
        scheduledFor,
        tags,
        metaDescription,
        seoTitle,
      } = req.body;

      const client = await pool.connect();
      try {
        const query = `
          INSERT INTO stories (
            title, content, excerpt, category, "featuredImage", "authorId", 
            "isPublished", "isFeatured", "scheduledFor", tags, "metaDescription", "seoTitle",
            "publishedAt", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          RETURNING *
        `;

        const publishedAt = isPublished ? new Date() : null;
        const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

        const result = await client.query(query, [
          title,
          content,
          excerpt || "",
          category,
          featuredImage || null,
          req.user?.id,
          isPublished,
          isFeatured,
          scheduledDate,
          tags || "",
          metaDescription || "",
          seoTitle || "",
          publishedAt,
        ]);

        const story = result.rows[0];

        res.status(201).json({
          success: true,
          message: "Story created successfully",
          data: { story },
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Create story error:", error);
      res.status(500).json({
        success: false,
        message: "Database error",
      });
    }
  }
);

// Get all published stories (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT s.*, u."firstName", u."lastName" 
      FROM stories s 
      JOIN users u ON s."authorId" = u.id 
      WHERE s."isPublished" = true AND (s."scheduledFor" IS NULL OR s."scheduledFor" <= NOW())
    `;
    const params: any[] = [];

    if (category) {
      query += " AND s.category = $1";
      params.push(category);
    }

    if (search) {
      const searchParam = params.length + 1;
      query += ` AND (s.title ILIKE $${searchParam} OR s.content ILIKE $${searchParam} OR s.excerpt ILIKE $${searchParam})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY s."isFeatured" DESC, s."publishedAt" DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      const stories = result.rows;

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM stories s 
        WHERE s."isPublished" = true AND (s."scheduledFor" IS NULL OR s."scheduledFor" <= NOW())
      `;
      const countParams: any[] = [];

      if (category) {
        countQuery += " AND s.category = $1";
        countParams.push(category);
      }

      if (search) {
        const searchParam = countParams.length + 1;
        countQuery += ` AND (s.title ILIKE $${searchParam} OR s.content ILIKE $${searchParam} OR s.excerpt ILIKE $${searchParam})`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0]?.total || "0");

      res.json({
        stories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

// Get featured stories (public)
router.get("/featured", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT s.*, u."firstName", u."lastName" 
      FROM stories s 
      JOIN users u ON s."authorId" = u.id 
      WHERE s."isPublished" = true AND s."isFeatured" = true 
      AND (s."scheduledFor" IS NULL OR s."scheduledFor" <= NOW())
      ORDER BY s."publishedAt" DESC 
      LIMIT 6
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(query);
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching featured stories:", error);
    res.status(500).json({ error: "Failed to fetch featured stories" });
  }
});

// Get single story by ID (public)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();
    try {
      // Increment view count
      await client.query(
        'UPDATE stories SET "viewCount" = "viewCount" + 1 WHERE id = $1',
        [id]
      );

      // Get story details
      const storyQuery = `
        SELECT s.*, u."firstName", u."lastName" 
        FROM stories s 
        JOIN users u ON s."authorId" = u.id 
        WHERE s.id = $1 AND s."isPublished" = true 
        AND (s."scheduledFor" IS NULL OR s."scheduledFor" <= NOW())
      `;

      const storyResult = await client.query(storyQuery, [id]);
      const story = storyResult.rows[0];

      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      // Get comments for the story
      const commentsQuery = `
        SELECT c.*, u."firstName", u."lastName" 
        FROM story_comments c 
        JOIN users u ON c."userId" = u.id 
        WHERE c."storyId" = $1 
        ORDER BY c."createdAt" DESC 
        LIMIT 10
      `;

      const commentsResult = await client.query(commentsQuery, [id]);
      const comments = commentsResult.rows;

      // For now, we'll set liked to false since we don't have authentication in this simple route
      // In a full implementation, you'd check if the current user has liked this story
      const liked = false;

      res.json({
        story,
        comments,
        pagination: {
          page: 1,
          limit: 10,
          total: comments.length,
          totalPages: 1,
        },
        liked,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({ error: "Failed to fetch story" });
  }
});

// Get story comments (public)
router.get("/:id/comments", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const client = await pool.connect();
    try {
      const query = `
        SELECT c.*, u."firstName", u."lastName" 
        FROM story_comments c 
        JOIN users u ON c."userId" = u.id 
        WHERE c."storyId" = $1 
        ORDER BY c."createdAt" DESC 
        LIMIT $2 OFFSET $3
      `;

      const result = await client.query(query, [id, Number(limit), offset]);
      const comments = result.rows;

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM story_comments 
        WHERE "storyId" = $1
      `;

      const countResult = await client.query(countQuery, [id]);
      const total = parseInt(countResult.rows[0]?.total || "0");

      res.json({
        comments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching story comments:", error);
    res.status(500).json({ error: "Failed to fetch story comments" });
  }
});

export default router;
