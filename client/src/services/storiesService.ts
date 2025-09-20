/**
 * Stories Service
 *
 * This service handles story-related operations using Firestore.
 */

import { FirestoreService, FirestoreDocument } from "./firestoreService";

export interface User extends FirestoreDocument {
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export interface Story extends FirestoreDocument {
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
  // Additional fields for Firestore
  authorName?: string;
  authorEmail?: string;
  authorImage?: string;
}

export interface StoryCreateRequest {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  authorId: string;
  status?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  scheduledFor?: string;
}

export interface StoryUpdateRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  featuredImage?: string;
  status?: string;
  isPublished?: boolean;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  isFeatured?: boolean;
  scheduledFor?: string;
}

export class StoriesService {
  private static collectionName = "successStories";

  /**
   * Get all published stories with pagination
   */
  static async getStories(
    page: number = 1,
    pageSize: number = 10,
    category?: string,
    searchTerm?: string
  ): Promise<{ stories: Story[]; hasMore: boolean; total?: number }> {
    try {
      const conditions: Array<{
        field: string;
        operator:
          | "=="
          | "!="
          | "<"
          | "<="
          | ">"
          | ">="
          | "array-contains"
          | "array-contains-any"
          | "in"
          | "not-in";
        value: any;
      }> = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      if (category) {
        conditions.push({
          field: "category",
          operator: "==" as const,
          value: category,
        });
      }

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions,
        {
          pageSize,
          orderByField: "publishedAt",
          orderDirection: "desc",
        }
      );

      let stories = result.data;

      // Client-side search if searchTerm is provided
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        stories = stories.filter(
          (story) =>
            story.title.toLowerCase().includes(searchTermLower) ||
            story.content.toLowerCase().includes(searchTermLower) ||
            story.excerpt.toLowerCase().includes(searchTermLower) ||
            story.category.toLowerCase().includes(searchTermLower)
        );
      }

      return {
        stories,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Error getting stories:", error);
      throw error;
    }
  }

  /**
   * Get story by ID
   */
  static async getStoryById(storyId: string): Promise<Story | null> {
    try {
      const story = await FirestoreService.getDocument<Story>(
        this.collectionName,
        storyId
      );

      if (story) {
        // Get author details
        try {
          const author = await FirestoreService.getDocument(
            "users",
            story.authorId
          );
          if (author) {
            const userData = author as User;
            story.authorName = `${userData.firstName} ${userData.lastName}`;
            story.authorEmail = userData.email;
            story.authorImage = userData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return story;
    } catch (error) {
      console.error("Error getting story by ID:", error);
      return null;
    }
  }

  /**
   * Get featured stories
   */
  static async getFeaturedStories(limit: number = 5): Promise<Story[]> {
    try {
      const conditions = [
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

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions,
        {
          pageSize: limit,
          orderByField: "publishedAt",
          orderDirection: "desc",
        }
      );

      // Enrich with author details
      for (const story of result.data) {
        try {
          const author = await FirestoreService.getDocument(
            "users",
            story.authorId
          );
          if (author) {
            const userData = author as User;
            story.authorName = `${userData.firstName} ${userData.lastName}`;
            story.authorEmail = userData.email;
            story.authorImage = userData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return result.data;
    } catch (error) {
      console.error("Error getting featured stories:", error);
      return [];
    }
  }

  /**
   * Get stories by category
   */
  static async getStoriesByCategory(
    category: string,
    limit?: number
  ): Promise<Story[]> {
    try {
      const conditions = [
        {
          field: "category",
          operator: "==" as const,
          value: category as string,
        },
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions,
        {
          pageSize: limit,
          orderByField: "publishedAt",
          orderDirection: "desc",
        }
      );

      // Enrich with author details
      for (const story of result.data) {
        try {
          const author = await FirestoreService.getDocument(
            "users",
            story.authorId
          );
          if (author) {
            const userData = author as User;
            story.authorName = `${userData.firstName} ${userData.lastName}`;
            story.authorEmail = userData.email;
            story.authorImage = userData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return result.data;
    } catch (error) {
      console.error("Error getting stories by category:", error);
      return [];
    }
  }

  /**
   * Get stories by author
   */
  static async getStoriesByAuthor(
    authorId: string,
    limit?: number
  ): Promise<Story[]> {
    try {
      const conditions = [
        {
          field: "authorId",
          operator: "==" as const,
          value: authorId,
        },
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions,
        {
          pageSize: limit,
          orderByField: "publishedAt",
          orderDirection: "desc",
        }
      );

      // Enrich with author details
      for (const story of result.data) {
        try {
          const author = await FirestoreService.getDocument(
            "users",
            story.authorId
          );
          if (author) {
            const userData = author as User;
            story.authorName = `${userData.firstName} ${userData.lastName}`;
            story.authorEmail = userData.email;
            story.authorImage = userData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return result.data;
    } catch (error) {
      console.error("Error getting stories by author:", error);
      return [];
    }
  }

  /**
   * Create a new story
   */
  static async createStory(storyData: StoryCreateRequest): Promise<Story> {
    try {
      const storyToCreate = {
        ...storyData,
        status: storyData.status || "draft",
        isPublished:
          storyData.isPublished !== undefined ? storyData.isPublished : false,
        isFeatured:
          storyData.isFeatured !== undefined ? storyData.isFeatured : false,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      };

      return await FirestoreService.createDocument<Story>(
        this.collectionName,
        storyToCreate as any
      );
    } catch (error) {
      console.error("Error creating story:", error);
      throw error;
    }
  }

  /**
   * Update story
   */
  static async updateStory(
    storyId: string,
    updateData: StoryUpdateRequest
  ): Promise<void> {
    try {
      // If publishing for the first time, set publishedAt
      if (updateData.isPublished === true) {
        const currentStory = await this.getStoryById(storyId);
        if (currentStory && !currentStory.publishedAt) {
          updateData.publishedAt = new Date().toISOString();
        }
      }

      await FirestoreService.updateDocument<Story>(
        this.collectionName,
        storyId,
        updateData as any
      );
    } catch (error) {
      console.error("Error updating story:", error);
      throw error;
    }
  }

  /**
   * Delete story
   */
  static async deleteStory(storyId: string): Promise<void> {
    try {
      await FirestoreService.deleteDocument(this.collectionName, storyId);
    } catch (error) {
      console.error("Error deleting story:", error);
      throw error;
    }
  }

  /**
   * Publish story
   */
  static async publishStory(storyId: string): Promise<void> {
    try {
      const currentStory = await this.getStoryById(storyId);
      if (!currentStory) {
        throw new Error("Story not found");
      }

      const updateData: StoryUpdateRequest = {
        isPublished: true,
        status: "published",
      };

      if (!currentStory.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }

      await this.updateStory(storyId, updateData);
    } catch (error) {
      console.error("Error publishing story:", error);
      throw error;
    }
  }

  /**
   * Unpublish story
   */
  static async unpublishStory(storyId: string): Promise<void> {
    try {
      await this.updateStory(storyId, {
        isPublished: false,
        status: "draft",
      });
    } catch (error) {
      console.error("Error unpublishing story:", error);
      throw error;
    }
  }

  /**
   * Toggle featured status
   */
  static async toggleFeatured(storyId: string): Promise<void> {
    try {
      const currentStory = await this.getStoryById(storyId);
      if (!currentStory) {
        throw new Error("Story not found");
      }

      await this.updateStory(storyId, {
        isFeatured: !currentStory.isFeatured,
      });
    } catch (error) {
      console.error("Error toggling featured status:", error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(storyId: string): Promise<void> {
    try {
      const currentStory = await this.getStoryById(storyId);
      if (!currentStory) {
        throw new Error("Story not found");
      }

      await this.updateStory(storyId, {
        viewCount: (currentStory.viewCount || 0) + 1,
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      throw error;
    }
  }

  /**
   * Increment like count
   */
  static async incrementLikeCount(storyId: string): Promise<void> {
    try {
      const currentStory = await this.getStoryById(storyId);
      if (!currentStory) {
        throw new Error("Story not found");
      }

      await this.updateStory(storyId, {
        likeCount: (currentStory.likeCount || 0) + 1,
      });
    } catch (error) {
      console.error("Error incrementing like count:", error);
      throw error;
    }
  }

  /**
   * Decrement like count
   */
  static async decrementLikeCount(storyId: string): Promise<void> {
    try {
      const currentStory = await this.getStoryById(storyId);
      if (!currentStory) {
        throw new Error("Story not found");
      }

      const newLikeCount = Math.max(0, (currentStory.likeCount || 0) - 1);
      await this.updateStory(storyId, {
        likeCount: newLikeCount,
      });
    } catch (error) {
      console.error("Error decrementing like count:", error);
      throw error;
    }
  }

  /**
   * Search stories
   */
  static async searchStories(
    searchTerm: string,
    limit?: number
  ): Promise<Story[]> {
    try {
      const conditions = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions
      );

      const searchTermLower = searchTerm.toLowerCase();
      const filteredStories = result.data.filter(
        (story) =>
          story.title.toLowerCase().includes(searchTermLower) ||
          story.content.toLowerCase().includes(searchTermLower) ||
          story.excerpt.toLowerCase().includes(searchTermLower) ||
          story.category.toLowerCase().includes(searchTermLower)
      );

      return limit ? filteredStories.slice(0, limit) : filteredStories;
    } catch (error) {
      console.error("Error searching stories:", error);
      return [];
    }
  }

  /**
   * Get most popular stories
   */
  static async getMostPopularStories(limit: number = 5): Promise<Story[]> {
    try {
      const conditions = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions,
        {
          pageSize: limit,
          orderByField: "viewCount",
          orderDirection: "desc",
        }
      );

      // Enrich with author details
      for (const story of result.data) {
        try {
          const author = await FirestoreService.getDocument(
            "users",
            story.authorId
          );
          if (author) {
            const userData = author as User;
            story.authorName = `${userData.firstName} ${userData.lastName}`;
            story.authorEmail = userData.email;
            story.authorImage = userData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return result.data;
    } catch (error) {
      console.error("Error getting most popular stories:", error);
      return [];
    }
  }

  /**
   * Get recent stories
   */
  static async getRecentStories(limit: number = 5): Promise<Story[]> {
    try {
      const conditions = [
        {
          field: "isPublished",
          operator: "==" as const,
          value: true,
        },
      ];

      const result = await FirestoreService.queryDocuments<Story>(
        this.collectionName,
        conditions,
        {
          pageSize: limit,
          orderByField: "publishedAt",
          orderDirection: "desc",
        }
      );

      // Enrich with author details
      for (const story of result.data) {
        try {
          const author = await FirestoreService.getDocument(
            "users",
            story.authorId
          );
          if (author) {
            const userData = author as User;
            story.authorName = `${userData.firstName} ${userData.lastName}`;
            story.authorEmail = userData.email;
            story.authorImage = userData.profileImage;
          }
        } catch (error) {
          console.warn("Could not fetch author data:", error);
        }
      }

      return result.data;
    } catch (error) {
      console.error("Error getting recent stories:", error);
      return [];
    }
  }

  /**
   * Subscribe to story updates
   */
  static subscribeToStory(
    storyId: string,
    callback: (story: Story | null) => void
  ): () => void {
    return FirestoreService.subscribeToDocument<Story>(
      this.collectionName,
      storyId,
      callback
    );
  }

  /**
   * Subscribe to all published stories
   */
  static subscribeToPublishedStories(
    callback: (stories: Story[]) => void,
    category?: string
  ): () => void {
    const conditions: Array<{
      field: string;
      operator:
        | "=="
        | "!="
        | "<"
        | "<="
        | ">"
        | ">="
        | "array-contains"
        | "array-contains-any"
        | "in"
        | "not-in";
      value: any;
    }> = [
      {
        field: "isPublished",
        operator: "==" as const,
        value: true,
      },
    ];

    if (category) {
      conditions.push({
        field: "category",
        operator: "==" as const,
        value: category,
      });
    }

    return FirestoreService.subscribeToCollection<Story>(
      this.collectionName,
      conditions as any,
      callback,
      {
        orderByField: "publishedAt",
        orderDirection: "desc",
      }
    );
  }

  /**
   * Subscribe to featured stories
   */
  static subscribeToFeaturedStories(
    callback: (stories: Story[]) => void
  ): () => void {
    const conditions = [
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

    return FirestoreService.subscribeToCollection<Story>(
      this.collectionName,
      conditions as any,
      callback,
      {
        orderByField: "publishedAt",
        orderDirection: "desc",
      }
    );
  }
}

export default StoriesService;
