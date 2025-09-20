/**
 * User Service
 *
 * Service layer for user-related operations using Firestore.
 */

import bcrypt from "bcryptjs";
import {
  User,
  RegisterRequest,
  LoginRequest,
  UserUpdateRequest,
} from "../types";
import { config } from "../config";
import { logger } from "../utils/logger";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import FirestoreService, {
  QueryOptions,
  PaginationOptions,
} from "./FirestoreService";

export class UserService {
  private collectionName = "users";

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<Omit<User, "password">> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        userData.password,
        config.bcrypt.saltRounds
      );

      // Create user document
      const userDoc = {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: `${userData.firstName} ${userData.lastName}`,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: "user" as const,
        phone: userData.phone || undefined,
        address: userData.address || undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userId = await FirestoreService.createDocument(
        this.collectionName,
        userDoc
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = {
        id: userId,
        ...userDoc,
      };

      logger.info("User registered successfully", {
        userId,
        email: userData.email,
      });

      return userWithoutPassword;
    } catch (error) {
      logger.error("Error registering user:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(
    credentials: LoginRequest
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    try {
      // Find user by email
      const user = await this.getUserByEmail(credentials.email);
      if (!user) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!isValidPassword) {
        throw new AuthenticationError("Invalid email or password");
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = user;

      // Generate JWT token
      const { generateToken } = await import("../middleware/auth");
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info("User logged in successfully", {
        userId: user.id,
        email: user.email,
      });

      return { user: userWithoutPassword, token };
    } catch (error) {
      logger.error("Error during login:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<Omit<User, "password">> {
    try {
      const userDoc = await FirestoreService.getDocument<User>(
        this.collectionName,
        id
      );

      if (!userDoc) {
        throw new NotFoundError("User not found");
      }

      const { password, ...userWithoutPassword } = {
        ...userDoc.data,
        id: userDoc.id,
      };

      return userWithoutPassword;
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        [{ field: "email", operator: "==", value: email.toLowerCase() }],
        { limit: 1 }
      );

      if (result.data.length === 0) {
        return null;
      }

      const userData = result.data[0];
      return {
        ...userData,
        id: userData.id || "",
      };
    } catch (error) {
      logger.error("Error getting user by email:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    updateData: UserUpdateRequest
  ): Promise<Omit<User, "password">> {
    try {
      // Get current user to preserve fullName/displayName logic
      const currentUser = await this.getUserById(id);

      // Update fullName and displayName if firstName or lastName changed
      if (updateData.firstName || updateData.lastName) {
        const firstName = updateData.firstName || currentUser.firstName;
        const lastName = updateData.lastName || currentUser.lastName;

        updateData.fullName = `${firstName} ${lastName}`;
        updateData.displayName = `${firstName} ${lastName}`;
      }

      await FirestoreService.updateDocument(
        this.collectionName,
        id,
        updateData
      );

      logger.info("User updated successfully", { userId: id });

      const updatedUser = await this.getUserById(id);
      return updatedUser;
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await FirestoreService.updateDocument(this.collectionName, id, {
        isActive: false,
      });

      logger.info("User deleted successfully", { userId: id });
    } catch (error) {
      logger.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: Omit<User, "password">[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;

      const pagination: PaginationOptions = {
        limit,
        orderByField: "createdAt",
        orderDirection: "desc",
      };

      const result = await FirestoreService.getAllDocuments<User>(
        this.collectionName,
        pagination
      );

      const users = result.data.map((user) => {
        const { password, ...userWithoutPassword } = {
          ...user,
          id: user.id || "",
        };
        return userWithoutPassword;
      });

      // For total count, we need to get all documents (this is expensive in Firestore)
      const allUsersResult = await FirestoreService.getAllDocuments<User>(
        this.collectionName
      );
      const total = allUsersResult.data.length;
      const totalPages = Math.ceil(total / limit);

      return {
        users,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      logger.error("Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<Omit<User, "password">[]> {
    try {
      const conditions: QueryOptions[] = [
        {
          field: "role",
          operator: "==",
          value: role as "user" | "admin" | "trainer",
        },
      ];

      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        conditions
      );

      return result.data.map((user) => {
        const { password, ...userWithoutPassword } = {
          ...user,
          id: user.id || "",
        };
        return userWithoutPassword;
      });
    } catch (error) {
      logger.error("Error getting users by role:", error);
      throw error;
    }
  }

  /**
   * Search users by name
   */
  async searchUsers(searchTerm: string): Promise<Omit<User, "password">[]> {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      // Firestore doesn't support full-text search, so we'll do a prefix search
      const conditions: QueryOptions[] = [
        { field: "fullName", operator: ">=", value: searchTerm },
      ];

      const result = await FirestoreService.queryDocuments<User>(
        this.collectionName,
        conditions,
        { limit: 10 }
      );

      // Filter results client-side for better search
      const filteredResults = result.data.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filteredResults.map((user) => {
        const { password, ...userWithoutPassword } = {
          ...user,
          id: user.id || "",
        };
        return userWithoutPassword;
      });
    } catch (error) {
      logger.error("Error searching users:", error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    role: "user" | "admin" | "trainer"
  ): Promise<void> {
    try {
      await FirestoreService.updateDocument<User>(this.collectionName, userId, {
        role,
      });

      logger.info("User role updated successfully", { userId, role });
    } catch (error) {
      logger.error("Error updating user role:", error);
      throw error;
    }
  }

  /**
   * Subscribe to user updates
   */
  subscribeToUsers(
    callback: (users: User[]) => void,
    conditions: QueryOptions[] = [],
    pagination: PaginationOptions = { limit: 50 }
  ): () => void {
    return FirestoreService.subscribeToCollection<User>(
      this.collectionName,
      conditions,
      (docs) => {
        const users = docs.map((doc) => ({
          ...doc.data,
          id: doc.id,
        }));
        callback(users);
      },
      pagination
    );
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    users: number;
    admins: number;
    trainers: number;
  }> {
    try {
      const [
        totalResult,
        activeResult,
        usersResult,
        adminsResult,
        trainersResult,
      ] = await Promise.all([
        FirestoreService.getAllDocuments(this.collectionName),
        FirestoreService.queryDocuments(this.collectionName, [
          { field: "isActive", operator: "==", value: true },
        ]),
        FirestoreService.queryDocuments(this.collectionName, [
          { field: "role", operator: "==", value: "user" },
        ]),
        FirestoreService.queryDocuments(this.collectionName, [
          { field: "role", operator: "==", value: "admin" },
        ]),
        FirestoreService.queryDocuments(this.collectionName, [
          { field: "role", operator: "==", value: "trainer" },
        ]),
      ]);

      return {
        total: totalResult.data.length,
        active: activeResult.data.length,
        users: usersResult.data.length,
        admins: adminsResult.data.length,
        trainers: trainersResult.data.length,
      };
    } catch (error) {
      logger.error("Error getting user statistics:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
