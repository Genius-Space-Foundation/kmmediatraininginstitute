/**
 * Firestore Success Story Repository
 *
 * This repository handles all success story-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { PaginationParams } from "../types/dtos";

export interface FirestoreSuccessStory {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  authorId: string;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  authorName?: string;
  authorEmail?: string;
  authorImage?: string;
}

export class FirestoreSuccessStoryRepository extends FirestoreBaseRepository {
  constructor() {
    super("successStories");
  }

  /**
   * Find success story by ID with related data
   */
  async findByIdWithDetails(id: string): Promise<FirestoreSuccessStory | null> {
    try {
      const story = await this.findById<FirestoreSuccessStory>(id);
      if (!story) return null;

      // Get author details
      try {
        const authorDoc = await FirestoreUtils.getDocument(
          "users",
          story.authorId
        ).get();
        if (authorDoc.exists) {
          const authorData = authorDoc.data()!;
          story.authorName = `${authorData.firstName} ${authorData.lastName}`;
          story.authorEmail = authorData.email;
          story.authorImage = authorData.profileImage;
        }
      } catch (error) {
        console.warn("Could not fetch author data:", error);
      }

      return story;
    } catch (error) {
      console.error("Error finding success story by ID:", error);
      throw error;
    }
  }

  /**
   * Find all success stories with pagination
   */
  async findAllWithDetails(
    pagination?: PaginationParams
  ): Promise<FirestoreSuccessStory[]> {
    try {
      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const stories = await this.getPaginated<FirestoreSuccessStory>(
        pagination?.page || 1,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with author details
      for (const story of stories.data) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories.data;
    } catch (error) {
      console.error("Error finding all success stories:", error);
      throw error;
    }
  }

  /**
   * Find published success stories
   */
  async findPublished(
    pagination?: PaginationParams
  ): Promise<FirestoreSuccessStory[]> {
    try {
      const searchConditions = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "publishedAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const stories = await this.search<FirestoreSuccessStory>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with author details
      for (const story of stories) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories;
    } catch (error) {
      console.error("Error finding published success stories:", error);
      throw error;
    }
  }

  /**
   * Find featured success stories
   */
  async findFeatured(limit: number = 5): Promise<FirestoreSuccessStory[]> {
    try {
      const searchConditions = [
        {
          field: "isFeatured",
          operator: "==" as const,
          value: true,
        },
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const stories = await this.search<FirestoreSuccessStory>(
        searchConditions,
        limit,
        "publishedAt",
        "desc"
      );

      // Enrich with author details
      for (const story of stories) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories;
    } catch (error) {
      console.error("Error finding featured success stories:", error);
      throw error;
    }
  }

  /**
   * Find success stories by category
   */
  async findByCategory(
    category: string,
    pagination?: PaginationParams
  ): Promise<FirestoreSuccessStory[]> {
    try {
      const searchConditions = [
        {
          field: "category",
          operator: "==" as const,
          value: category,
        },
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "publishedAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const stories = await this.search<FirestoreSuccessStory>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with author details
      for (const story of stories) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories;
    } catch (error) {
      console.error("Error finding success stories by category:", error);
      throw error;
    }
  }

  /**
   * Find success stories by author
   */
  async findByAuthor(
    authorId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreSuccessStory[]> {
    try {
      const searchConditions = [
        {
          field: "authorId",
          operator: "==" as const,
          value: authorId,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const stories = await this.search<FirestoreSuccessStory>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with author details
      for (const story of stories) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories;
    } catch (error) {
      console.error("Error finding success stories by author:", error);
      throw error;
    }
  }

  /**
   * Create a new success story
   */
  async createSuccessStory(storyData: {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    featuredImage?: string;
    authorId: string;
    status?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    scheduledFor?: string;
  }): Promise<FirestoreSuccessStory> {
    const storyDataWithDefaults = {
      ...storyData,
      status: storyData.status || "draft",
      isPublished:
        storyData.isPublished !== undefined ? storyData.isPublished : false,
      isFeatured:
        storyData.isFeatured !== undefined ? storyData.isFeatured : false,
      viewCount: storyData.viewCount || 0,
      likeCount: storyData.likeCount || 0,
      commentCount: storyData.commentCount || 0,
    };

    return super.create(storyDataWithDefaults);
  }

  /**
   * Update success story
   */
  async updateSuccessStory(
    id: string,
    updates: Partial<FirestoreSuccessStory>
  ): Promise<FirestoreSuccessStory> {
    // If publishing for the first time, set publishedAt
    if (updates.isPublished === true) {
      const currentStory = await this.findById<FirestoreSuccessStory>(id);
      if (currentStory && !currentStory.publishedAt) {
        updates.publishedAt = new Date().toISOString();
      }
    }

    return super.update(id, updates);
  }

  /**
   * Delete success story
   */
  async deleteSuccessStory(id: string): Promise<boolean> {
    try {
      await super.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting success story:", error);
      return false;
    }
  }

  /**
   * Publish success story
   */
  async publishStory(id: string): Promise<FirestoreSuccessStory> {
    const updates = {
      isPublished: true,
      status: "published",
      publishedAt: new Date().toISOString(),
    };

    return super.update(id, updates);
  }

  /**
   * Unpublish success story
   */
  async unpublishStory(id: string): Promise<FirestoreSuccessStory> {
    const updates = {
      isPublished: false,
      status: "draft",
    };

    return super.update(id, updates);
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string): Promise<FirestoreSuccessStory> {
    const currentStory = await this.findById<FirestoreSuccessStory>(id);
    if (!currentStory) {
      throw new Error("Success story not found");
    }

    return super.update(id, { isFeatured: !currentStory.isFeatured });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<FirestoreSuccessStory> {
    const currentStory = await this.findById<FirestoreSuccessStory>(id);
    if (!currentStory) {
      throw new Error("Success story not found");
    }

    return super.update(id, { viewCount: (currentStory.viewCount || 0) + 1 });
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(id: string): Promise<FirestoreSuccessStory> {
    const currentStory = await this.findById<FirestoreSuccessStory>(id);
    if (!currentStory) {
      throw new Error("Success story not found");
    }

    return super.update(id, { likeCount: (currentStory.likeCount || 0) + 1 });
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(id: string): Promise<FirestoreSuccessStory> {
    const currentStory = await this.findById<FirestoreSuccessStory>(id);
    if (!currentStory) {
      throw new Error("Success story not found");
    }

    const newLikeCount = Math.max(0, (currentStory.likeCount || 0) - 1);
    return super.update(id, { likeCount: newLikeCount });
  }

  /**
   * Search success stories
   */
  async searchStories(
    searchTerm: string,
    limit: number = 10
  ): Promise<FirestoreSuccessStory[]> {
    try {
      // Get all published stories and filter client-side (Firestore doesn't support full-text search)
      const searchConditions = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const stories = await this.search<FirestoreSuccessStory>(
        searchConditions
      );

      const searchTermLower = searchTerm.toLowerCase();

      const filteredStories = stories.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTermLower) ||
          story.content.toLowerCase().includes(searchTermLower) ||
          story.excerpt.toLowerCase().includes(searchTermLower) ||
          story.category.toLowerCase().includes(searchTermLower)
      );

      return filteredStories.slice(0, limit);
    } catch (error) {
      console.error("Error searching success stories:", error);
      return [];
    }
  }

  /**
   * Get success story statistics
   */
  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    featured: number;
    byCategory: Record<string, number>;
    totalViews: number;
    totalLikes: number;
  }> {
    try {
      const total = await this.count();
      const published = await this.countByField("isPublished", true);
      const draft = await this.countByField("status", "draft");
      const featured = await this.countByField("isFeatured", true);

      const stories = await this.findAll<FirestoreSuccessStory>();

      const byCategory = stories.reduce((acc, story) => {
        acc[story.category] = (acc[story.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalViews = stories.reduce(
        (sum, story) => sum + (story.viewCount || 0),
        0
      );
      const totalLikes = stories.reduce(
        (sum, story) => sum + (story.likeCount || 0),
        0
      );

      return {
        total,
        published,
        draft,
        featured,
        byCategory,
        totalViews,
        totalLikes,
      };
    } catch (error) {
      console.error("Error getting success story stats:", error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        featured: 0,
        byCategory: {},
        totalViews: 0,
        totalLikes: 0,
      };
    }
  }

  /**
   * Get most popular success stories
   */
  async getMostPopular(limit: number = 5): Promise<FirestoreSuccessStory[]> {
    try {
      const searchConditions = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const stories = await this.search<FirestoreSuccessStory>(
        searchConditions,
        undefined,
        "viewCount",
        "desc"
      );

      // Enrich with author details
      for (const story of stories.slice(0, limit)) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories.slice(0, limit);
    } catch (error) {
      console.error("Error getting most popular success stories:", error);
      return [];
    }
  }

  /**
   * Get recent success stories
   */
  async getRecent(limit: number = 5): Promise<FirestoreSuccessStory[]> {
    try {
      const stories = await this.getPaginated<FirestoreSuccessStory>(
        1,
        limit,
        "createdAt",
        "desc"
      );

      // Enrich with author details
      for (const story of stories.data) {
        try {
          const authorDoc = await FirestoreUtils.getDocument(
            "users",
            story.authorId
          ).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data()!;
            story.authorName = `${authorData.firstName} ${authorData.lastName}`;
            story.authorEmail = authorData.email;
            story.authorImage = authorData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return stories.data;
    } catch (error) {
      console.error("Error getting recent success stories:", error);
      return [];
    }
  }
}

export const firestoreSuccessStoryRepository =
  new FirestoreSuccessStoryRepository();
