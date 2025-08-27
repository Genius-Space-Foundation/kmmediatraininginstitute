import bcrypt from "bcryptjs";
import { User, RegisterRequest, LoginRequest } from "../types";
import { config } from "../config";
import { logger } from "../utils/logger";
import { userRepository } from "../repositories/UserRepository";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";

export class UserService {
  async register(userData: RegisterRequest): Promise<Omit<User, "password">> {
    // Check if user already exists
    const exists = await userRepository.existsByEmail(userData.email);
    if (exists) {
      throw new ConflictError("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      userData.password,
      config.bcrypt.saltRounds
    );

    // Create user
    const user = await userRepository.create({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "user",
      phone: userData.phone,
      address: userData.address,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    logger.info("User registered successfully", {
      userId: user.id,
      email: user.email,
    });
    return userWithoutPassword;
  }

  async login(
    credentials: LoginRequest
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    // Find user by email
    const user = await userRepository.findByEmail(credentials.email);
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
  }

  async getUserById(id: number): Promise<Omit<User, "password">> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    id: number,
    updateData: Partial<User>
  ): Promise<Omit<User, "password">> {
    // Remove password from update data for security
    const { password, ...safeUpdateData } = updateData;

    const user = await userRepository.update(id, safeUpdateData);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(id: number): Promise<void> {
    await userRepository.delete(id);
    logger.info("User deleted successfully", { userId: id });
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: Omit<User, "password">[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await userRepository.findAll(page, limit);
  }

  async getUsersByRole(role: string): Promise<Omit<User, "password">[]> {
    const users = await userRepository.findByRole(role);
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

export const userService = new UserService();
