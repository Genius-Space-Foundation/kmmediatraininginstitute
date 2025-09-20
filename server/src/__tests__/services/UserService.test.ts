import { UserService } from "../../services/UserService";
import { userRepository } from "../../repositories/UserRepository";
import { generateToken } from "../../middleware/auth";
import bcrypt from "bcryptjs";
import { AuthenticationError, ValidationError } from "../../utils/errors";

// Mock dependencies
jest.mock("../../repositories/UserRepository");
jest.mock("../../middleware/auth");
jest.mock("bcryptjs");

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockGenerateToken = generateToken as jest.MockedFunction<
  typeof generateToken
>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe("register", () => {
    const mockUserData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
      phone: "1234567890",
      address: "123 Main St",
    };

    const mockUser = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      role: "user" as const,
      phone: "1234567890",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should register a new user successfully", async () => {
      // Arrange
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue("hashedPassword" as never);

      // Act
      const result = await userService.register(mockUserData);

      // Assert
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        mockUserData.email
      );
      expect(mockBcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: "hashedPassword",
        firstName: mockUserData.firstName,
        lastName: mockUserData.lastName,
        role: "user",
        phone: mockUserData.phone,
        address: mockUserData.address,
      });
      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        phone: mockUser.phone,
        address: mockUser.address,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should throw ConflictError if user already exists", async () => {
      // Arrange
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.register(mockUserData)).rejects.toThrow(
        "User with this email already exists"
      );
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        mockUserData.email
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should handle repository errors during registration", async () => {
      // Arrange
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockBcrypt.hash.mockResolvedValue("hashedPassword" as never);
      mockUserRepository.create.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(userService.register(mockUserData)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("login", () => {
    const mockCredentials = {
      email: "john@example.com",
      password: "password123",
    };

    const mockUser = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      role: "user" as const,
      phone: "1234567890",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should login user successfully with valid credentials", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockGenerateToken.mockReturnValue("jwt-token");

      // Act
      const result = await userService.login(mockCredentials);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockCredentials.email
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        mockCredentials.password,
        mockUser.password
      );
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
          role: mockUser.role,
          phone: mockUser.phone,
          address: mockUser.address,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        token: "jwt-token",
      });
    });

    it("should throw AuthenticationError if user not found", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.login(mockCredentials)).rejects.toThrow(
        AuthenticationError
      );
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        mockCredentials.email
      );
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw AuthenticationError if password is invalid", async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(userService.login(mockCredentials)).rejects.toThrow(
        AuthenticationError
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        mockCredentials.password,
        mockUser.password
      );
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });
  });

  describe("getUserById", () => {
    const mockUser = {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashedPassword",
      role: "user" as const,
      phone: "1234567890",
      address: "123 Main St",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return user without password", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(1);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        phone: mockUser.phone,
        address: mockUser.address,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty("password");
    });

    it("should throw error if user not found", async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(1)).rejects.toThrow(
        "User not found"
      );
    });
  });
});
