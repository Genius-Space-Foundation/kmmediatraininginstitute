/**
 * Firestore User Repository
 *
 * This repository handles all user-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { User } from "../types";
import { NotFoundError, ConflictError } from "../utils/errors";

export interface FirestoreUser extends Omit<User, "id"> {
  id: string;
  fullName: string;
  displayName: string;
  roleIndex: string;
  emailIndex: string;
}

export class FirestoreUserRepository extends FirestoreBaseRepository {
  constructor() {
    super("users");
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<FirestoreUser | null> {
    return this.findById<FirestoreUser>(id);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<FirestoreUser | null> {
    try {
      const users = await this.findByField<FirestoreUser>("email", email, 1);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    address?: string;
    specialization?: string;
    bio?: string;
    experience?: string;
    profileImage?: string;
  }): Promise<FirestoreUser> {
    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const userDataWithIndexes = {
      ...userData,
      fullName: `${userData.firstName} ${userData.lastName}`,
      displayName: `${userData.firstName} ${userData.lastName}`,
      roleIndex: userData.role || "user",
      emailIndex: userData.email.toLowerCase(),
      role: userData.role || "user",
    };

    return this.create<FirestoreUser>(userDataWithIndexes);
  }

  /**
   * Update user
   */
  async update(
    id: string,
    updateData: Partial<FirestoreUser>
  ): Promise<FirestoreUser> {
    // Update indexed fields if name changes
    if (updateData.firstName || updateData.lastName) {
      const currentUser = await this.findById(id);
      if (currentUser) {
        const firstName = updateData.firstName || currentUser.firstName;
        const lastName = updateData.lastName || currentUser.lastName;

        updateData.fullName = `${firstName} ${lastName}`;
        updateData.displayName = `${firstName} ${lastName}`;
      }
    }

    // Update email index if email changes
    if (updateData.email) {
      updateData.emailIndex = updateData.email.toLowerCase();
    }

    return this.update<FirestoreUser>(id, updateData);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Check if email exists
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.countByField("email", email);
      return count > 0;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  }

  /**
   * Get all users with pagination
   */
  async findAllUsers(
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<{
    users: FirestoreUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const searchConditions = role
        ? [
            {
              field: "role",
              operator: "==" as const,
              value: role,
            },
          ]
        : [];

      const users = await this.search<FirestoreUser>(
        searchConditions,
        limit,
        "createdAt",
        "desc"
      );

      const total = role
        ? await this.countByField("role", role)
        : await this.count();

      return {
        users,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async findByRole(role: string): Promise<FirestoreUser[]> {
    return this.findByField<FirestoreUser>("role", role);
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: string): Promise<FirestoreUser> {
    return this.update(id, { role, roleIndex: role });
  }

  /**
   * Search users
   */
  async searchUsers(
    searchTerm: string,
    limit: number = 10
  ): Promise<FirestoreUser[]> {
    try {
      // Search in full name (case-insensitive)
      const users = await FirestoreUtils.searchDocuments(
        this.collectionName,
        "fullName",
        searchTerm,
        limit
      );

      return users;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<string, number>;
  }> {
    try {
      const total = await this.count();
      const users = await this.findAll<FirestoreUser>();

      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, byRole };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return { total: 0, byRole: {} };
    }
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<FirestoreUser> {
    // In Firestore, we might use a status field instead of soft delete
    return this.update(id, {
      /* status: 'active' */
    });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<FirestoreUser> {
    // In Firestore, we might use a status field instead of soft delete
    return this.update(id, {
      /* status: 'inactive' */
    });
  }

  /**
   * Get user with profile data
   */
  async getUserWithProfile(id: string): Promise<FirestoreUser | null> {
    try {
      const user = await this.findById(id);
      if (!user) {
        return null;
      }

      // In a real implementation, you might fetch additional profile data
      // from subcollections or related documents
      return user;
    } catch (error) {
      console.error("Error getting user with profile:", error);
      return null;
    }
  }
}

export const firestoreUserRepository = new FirestoreUserRepository();


