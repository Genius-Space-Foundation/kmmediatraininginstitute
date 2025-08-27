import express from "express";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest, StoryRequest, StoryCommentRequest } from "../types";

const router = express.Router();

// Get all published stories (public)
router.get("/", (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT s.*, u.firstName, u.lastName 
    FROM stories s 
    JOIN users u ON s.authorId = u.id 
    WHERE s.isPublished = 1 AND (s.scheduledFor IS NULL OR s.scheduledFor <= datetime('now'))
  `;
  const params: any[] = [];

  if (category) {
    query += " AND s.category = ?";
    params.push(category);
  }

  if (search) {
    query += " AND (s.title LIKE ? OR s.content LIKE ? OR s.excerpt LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY s.isFeatured DESC, s.publishedAt DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), offset);

  db.all(query, params, (err, stories) => {
    if (err) {
      console.error("Error fetching stories:", err);
      return res.status(500).json({ error: "Failed to fetch stories" });
    }

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM stories s 
      WHERE s.isPublished = 1 AND (s.scheduledFor IS NULL OR s.scheduledFor <= datetime('now'))
    `;
    const countParams: any[] = [];

    if (category) {
      countQuery += " AND s.category = ?";
      countParams.push(category);
    }

    if (search) {
      countQuery +=
        " AND (s.title LIKE ? OR s.content LIKE ? OR s.excerpt LIKE ?)";
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    db.get(countQuery, countParams, (err, result: any) => {
      if (err) {
        console.error("Error counting stories:", err);
        return res.status(500).json({ error: "Failed to count stories" });
      }

      res.json({
        stories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result?.total || 0,
          totalPages: Math.ceil((result?.total || 0) / Number(limit)),
        },
      });
    });
  });
});

// Get featured stories (public)
router.get("/featured", (req, res) => {
  const query = `
    SELECT s.*, u.firstName, u.lastName 
    FROM stories s 
    JOIN users u ON s.authorId = u.id 
    WHERE s.isPublished = 1 AND s.isFeatured = 1 
    AND (s.scheduledFor IS NULL OR s.scheduledFor <= datetime('now'))
    ORDER BY s.publishedAt DESC 
    LIMIT 6
  `;

  db.all(query, (err, stories) => {
    if (err) {
      console.error("Error fetching featured stories:", err);
      return res
        .status(500)
        .json({ error: "Failed to fetch featured stories" });
    }
    res.json(stories);
  });
});

// Get single story by ID (public)
router.get("/:id", (req, res) => {
  const { id } = req.params;

  // Increment view count
  db.run("UPDATE stories SET viewCount = viewCount + 1 WHERE id = ?", [id]);

  const query = `
    SELECT s.*, u.firstName, u.lastName 
    FROM stories s 
    JOIN users u ON s.authorId = u.id 
    WHERE s.id = ? AND s.isPublished = 1 
    AND (s.scheduledFor IS NULL OR s.scheduledFor <= datetime('now'))
  `;

  db.get(query, [id], (err, story) => {
    if (err) {
      console.error("Error fetching story:", err);
      return res.status(500).json({ error: "Failed to fetch story" });
    }

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json(story);
  });
});

// Get story comments (public)
router.get("/:id/comments", (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const query = `
    SELECT c.*, u.firstName, u.lastName 
    FROM story_comments c 
    JOIN users u ON c.userId = u.id 
    WHERE c.storyId = ? 
    ORDER BY c.createdAt DESC 
    LIMIT ? OFFSET ?
  `;

  db.all(query, [id, Number(limit), offset], (err, comments) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }

    // Get total count
    db.get(
      "SELECT COUNT(*) as total FROM story_comments WHERE storyId = ?",
      [id],
      (err, result: any) => {
        if (err) {
          console.error("Error counting comments:", err);
          return res.status(500).json({ error: "Failed to count comments" });
        }

        res.json({
          comments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: result?.total || 0,
            totalPages: Math.ceil((result?.total || 0) / Number(limit)),
          },
        });
      }
    );
  });
});

// Check if user liked a story (authenticated)
router.get("/:id/like", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const query = "SELECT id FROM story_likes WHERE storyId = ? AND userId = ?";
  db.get(query, [id, userId], (err, like) => {
    if (err) {
      console.error("Error checking like:", err);
      return res.status(500).json({ error: "Failed to check like status" });
    }

    res.json({ liked: !!like });
  });
});

// Admin routes
// Get all stories (admin only)
router.get("/admin/all", authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { page = 1, limit = 20, status } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = `
    SELECT s.*, u.firstName, u.lastName 
    FROM stories s 
    JOIN users u ON s.authorId = u.id 
  `;
  const params: any[] = [];

  if (status === "published") {
    query += " WHERE s.isPublished = 1";
  } else if (status === "draft") {
    query += " WHERE s.isPublished = 0";
  } else if (status === "scheduled") {
    query +=
      " WHERE s.scheduledFor IS NOT NULL AND s.scheduledFor > datetime('now')";
  }

  query += " ORDER BY s.createdAt DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), offset);

  db.all(query, params, (err, stories) => {
    if (err) {
      console.error("Error fetching all stories:", err);
      return res.status(500).json({ error: "Failed to fetch stories" });
    }

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM stories s";
    const countParams: any[] = [];

    if (status === "published") {
      countQuery += " WHERE s.isPublished = 1";
    } else if (status === "draft") {
      countQuery += " WHERE s.isPublished = 0";
    } else if (status === "scheduled") {
      countQuery +=
        " WHERE s.scheduledFor IS NOT NULL AND s.scheduledFor > datetime('now')";
    }

    db.get(countQuery, countParams, (err, result: any) => {
      if (err) {
        console.error("Error counting stories:", err);
        return res.status(500).json({ error: "Failed to count stories" });
      }

      res.json({
        stories,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result?.total || 0,
          totalPages: Math.ceil((result?.total || 0) / Number(limit)),
        },
      });
    });
  });
});

// Create new story (admin only)
router.post("/", authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const storyData: StoryRequest = req.body;
  const authorId = req.user!.id;

  const query = `
    INSERT INTO stories (title, content, excerpt, category, featuredImage, authorId, isPublished, isFeatured, scheduledFor, publishedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const publishedAt = storyData.isPublished ? new Date().toISOString() : null;

  db.run(
    query,
    [
      storyData.title,
      storyData.content,
      storyData.excerpt,
      storyData.category,
      storyData.featuredImage || null,
      authorId,
      storyData.isPublished ? 1 : 0,
      storyData.isFeatured ? 1 : 0,
      storyData.scheduledFor || null,
      publishedAt,
    ],
    function (err) {
      if (err) {
        console.error("Error creating story:", err);
        return res.status(500).json({ error: "Failed to create story" });
      }

      res.status(201).json({
        id: this.lastID,
        message: "Story created successfully",
      });
    }
  );
});

// Update story (admin only)
router.put("/:id", authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const storyData: StoryRequest = req.body;

  const query = `
    UPDATE stories 
    SET title = ?, content = ?, excerpt = ?, category = ?, featuredImage = ?, 
        isPublished = ?, isFeatured = ?, scheduledFor = ?, publishedAt = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const publishedAt = storyData.isPublished ? new Date().toISOString() : null;

  db.run(
    query,
    [
      storyData.title,
      storyData.content,
      storyData.excerpt,
      storyData.category,
      storyData.featuredImage || null,
      storyData.isPublished ? 1 : 0,
      storyData.isFeatured ? 1 : 0,
      storyData.scheduledFor || null,
      publishedAt,
      id,
    ],
    function (err) {
      if (err) {
        console.error("Error updating story:", err);
        return res.status(500).json({ error: "Failed to update story" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Story not found" });
      }

      res.json({ message: "Story updated successfully" });
    }
  );
});

// Delete story (admin only)
router.delete("/:id", authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;

  db.run("DELETE FROM stories WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting story:", err);
      return res.status(500).json({ error: "Failed to delete story" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.json({ message: "Story deleted successfully" });
  });
});

// Add comment to story (authenticated users)
router.post("/:id/comments", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const commentData: StoryCommentRequest = req.body;
  const userId = req.user!.id;

  // Check if story exists and is published
  db.get(
    "SELECT id FROM stories WHERE id = ? AND isPublished = 1",
    [id],
    (err, story) => {
      if (err) {
        console.error("Error checking story:", err);
        return res.status(500).json({ error: "Failed to verify story" });
      }

      if (!story) {
        return res
          .status(404)
          .json({ error: "Story not found or not published" });
      }

      const query =
        "INSERT INTO story_comments (storyId, userId, content) VALUES (?, ?, ?)";

      db.run(query, [id, userId, commentData.content], function (err) {
        if (err) {
          console.error("Error adding comment:", err);
          return res.status(500).json({ error: "Failed to add comment" });
        }

        res.status(201).json({
          id: this.lastID,
          message: "Comment added successfully",
        });
      });
    }
  );
});

// Like/unlike story (authenticated users)
router.post("/:id/like", authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  // Check if already liked
  db.get(
    "SELECT id FROM story_likes WHERE storyId = ? AND userId = ?",
    [id, userId],
    (err, existingLike) => {
      if (err) {
        console.error("Error checking existing like:", err);
        return res.status(500).json({ error: "Failed to check like status" });
      }

      if (existingLike) {
        // Unlike
        db.run(
          "DELETE FROM story_likes WHERE storyId = ? AND userId = ?",
          [id, userId],
          (err) => {
            if (err) {
              console.error("Error removing like:", err);
              return res.status(500).json({ error: "Failed to remove like" });
            }

            // Update like count
            db.run(
              "UPDATE stories SET likeCount = likeCount - 1 WHERE id = ?",
              [id]
            );
            res.json({ liked: false, message: "Story unliked" });
          }
        );
      } else {
        // Like
        db.run(
          "INSERT INTO story_likes (storyId, userId) VALUES (?, ?)",
          [id, userId],
          (err) => {
            if (err) {
              console.error("Error adding like:", err);
              return res.status(500).json({ error: "Failed to add like" });
            }

            // Update like count
            db.run(
              "UPDATE stories SET likeCount = likeCount + 1 WHERE id = ?",
              [id]
            );
            res.json({ liked: true, message: "Story liked" });
          }
        );
      }
    }
  );
});

// Get story analytics (admin only)
router.get("/admin/analytics", authenticateToken, (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const queries = {
    totalStories: "SELECT COUNT(*) as count FROM stories",
    publishedStories:
      "SELECT COUNT(*) as count FROM stories WHERE isPublished = 1",
    totalViews: "SELECT SUM(viewCount) as count FROM stories",
    totalLikes: "SELECT SUM(likeCount) as count FROM stories",
    totalComments: "SELECT COUNT(*) as count FROM story_comments",
    categoryStats:
      "SELECT category, COUNT(*) as count FROM stories GROUP BY category",
    topStories: `
      SELECT s.title, s.viewCount, s.likeCount 
      FROM stories s 
      WHERE s.isPublished = 1 
      ORDER BY s.viewCount DESC 
      LIMIT 5
    `,
  };

  const results: any = {};

  Promise.all([
    new Promise<{ count: number } | undefined>((resolve) =>
      db.get(queries.totalStories, (err, result: any) => resolve(result))
    ),
    new Promise<{ count: number } | undefined>((resolve) =>
      db.get(queries.publishedStories, (err, result: any) => resolve(result))
    ),
    new Promise<{ count: number } | undefined>((resolve) =>
      db.get(queries.totalViews, (err, result: any) => resolve(result))
    ),
    new Promise<{ count: number } | undefined>((resolve) =>
      db.get(queries.totalLikes, (err, result: any) => resolve(result))
    ),
    new Promise<{ count: number } | undefined>((resolve) =>
      db.get(queries.totalComments, (err, result: any) => resolve(result))
    ),
    new Promise<any[]>((resolve) =>
      db.all(queries.categoryStats, (err, result: any) => resolve(result))
    ),
    new Promise<any[]>((resolve) =>
      db.all(queries.topStories, (err, result: any) => resolve(result))
    ),
  ])
    .then(
      ([total, published, views, likes, comments, categories, topStories]) => {
        res.json({
          totalStories: total?.count || 0,
          publishedStories: published?.count || 0,
          totalViews: views?.count || 0,
          totalLikes: likes?.count || 0,
          totalComments: comments?.count || 0,
          categories: categories || [],
          topStories: topStories || [],
        });
      }
    )
    .catch((err) => {
      console.error("Error fetching analytics:", err);
      res.status(500).json({ error: "Failed to fetch analytics" });
    });
});

export default router;
