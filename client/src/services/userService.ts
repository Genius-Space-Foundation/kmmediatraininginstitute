/**
 * User Service
 *
 * This service handles user-related operations using Firestore.
 */

import { FirestoreService, FirestoreDocument } from "./firestoreService";

export interface User extends FirestoreDocument {
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "trainer";
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  experience?: string;
  profileImage?: string;
  fullName: string;
  displayName: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  experience?: string;
  profileImage?: string;
  fullName?: string;
  displayName?: string;
}

export class UserService {
  private static collectionName = "users";

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      // This would typically get the current user ID from auth context
      const currentUserId = localStorage.getItem("userId");
      if (!currentUserId) {
        return null;
      }

      return await FirestoreService.getDocument<User>(
        this.collectionName,
        currentUserId
      );
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      return await FirestoreService.getDocument<User>(
        this.collectionName,
        userId
      );
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        [{ field: "email", operator: "==", value: email }]
      );

      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: UserCreateRequest): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const userToCreate: any = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "user" as const,
        fullName: `${userData.firstName} ${userData.lastName}`,
        displayName: `${userData.firstName} ${userData.lastName}`,
      };

      // Only add optional fields if they have values (Firestore doesn't allow undefined)
      if (userData.phone) {
        userToCreate.phone = userData.phone;
      }
      if (userData.address) {
        userToCreate.address = userData.address;
      }

      return await FirestoreService.createDocument<User>(
        this.collectionName,
        userToCreate
      );
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(
    userId: string,
    updateData: UserUpdateRequest
  ): Promise<void> {
    try {
      // Update full name if firstName or lastName changes
      if (updateData.firstName || updateData.lastName) {
        const currentUser = await this.getUserById(userId);
        if (currentUser) {
          const firstName = updateData.firstName || currentUser.firstName;
          const lastName = updateData.lastName || currentUser.lastName;

          updateData.fullName = `${firstName} ${lastName}`;
          updateData.displayName = `${firstName} ${lastName}`;
        }
      }

      await FirestoreService.updateDocument<User>(
        this.collectionName,
        userId,
        updateData
      );
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      await FirestoreService.deleteDocument(this.collectionName, userId);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Get all users with pagination (admin only)
   */
  static async getAllUsers(
    page: number = 1,
    pageSize: number = 10,
    role?: string
  ): Promise<{ users: User[]; hasMore: boolean; total?: number }> {
    try {
      const conditions = role
        ? [{ field: "role", operator: "==" as const, value: role }]
        : [];

      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        conditions,
        {
          pageSize,
          orderByField: "createdAt",
          orderDirection: "desc",
        }
      );

      return {
        users: result.data,
        hasMore: result.hasMore,
      };
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string): Promise<User[]> {
    try {
      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        [{ field: "role", operator: "==", value: role }]
      );

      return result.data;
    } catch (error) {
      console.error("Error getting users by role:", error);
      return [];
    }
  }

  /**
   * Search users
   */
  static async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      // Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia for production
      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        [{ field: "fullName", operator: ">=", value: searchTerm }],
        { pageSize: 10 }
      );

      // Filter results client-side for better search
      return result.data.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, role: string): Promise<void> {
    try {
      await FirestoreService.updateDocument<User>(this.collectionName, userId, {
        role: role as "user" | "admin" | "trainer",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  /**
   * Get user statistics (admin only)
   */
  static async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
  }> {
    try {
      const result = await FirestoreService.getCollection<User>(
        this.collectionName
      );
      const users = result.data;

      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: users.length,
        byRole,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return { total: 0, byRole: {} };
    }
  }

  /**
   * Subscribe to user updates
   */
  static subscribeToUser(
    userId: string,
    callback: (user: User | null) => void
  ): () => void {
    return FirestoreService.subscribeToDocument<User>(
      this.collectionName,
      userId,
      callback
    );
  }

  /**
   * Subscribe to all users (admin only)
   */
  static subscribeToAllUsers(
    callback: (users: User[]) => void,
    role?: string
  ): () => void {
    const conditions = role
      ? [{ field: "role", operator: "==", value: role }]
      : [];

    return FirestoreService.subscribeToCollection<User>(
      this.collectionName,
      conditions as any,
      callback,
      {
        orderByField: "createdAt",
        orderDirection: "desc",
      }
    );
  }
}

export default UserService;
