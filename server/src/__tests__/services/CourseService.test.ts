import { CourseService } from "../../services/CourseService";
import { courseRepository } from "../../repositories/CourseRepository";
import { NotFoundError } from "../../utils/errors";

// Mock dependencies
jest.mock("../../repositories/CourseRepository");

const mockCourseRepository = courseRepository as jest.Mocked<
  typeof courseRepository
>;

describe("CourseService", () => {
  let courseService: CourseService;

  beforeEach(() => {
    courseService = new CourseService();
    jest.clearAllMocks();
  });

  describe("createCourse", () => {
    const mockCourseData = {
      name: "Test Course",
      description: "A test course",
      duration: "4 weeks",
      price: 100,
      maxStudents: 20,
      category: "Tech" as const,
      isActive: true,
    };

    const mockCourse = {
      id: 1,
      ...mockCourseData,
      instructorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      instructor: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    };

    it("should create a course successfully", async () => {
      // Arrange
      mockCourseRepository.create.mockResolvedValue(mockCourse);

      // Act
      const result = await courseService.createCourse(mockCourseData);

      // Assert
      expect(mockCourseRepository.create).toHaveBeenCalledWith({
        ...mockCourseData,
        isActive: true,
        instructorId: undefined,
      });
      expect(result).toEqual(mockCourse);
    });

    it("should create a course with instructor ID", async () => {
      // Arrange
      const instructorId = 2;
      mockCourseRepository.create.mockResolvedValue({
        ...mockCourse,
        instructorId,
      });

      // Act
      const result = await courseService.createCourse(
        mockCourseData,
        instructorId
      );

      // Assert
      expect(mockCourseRepository.create).toHaveBeenCalledWith({
        ...mockCourseData,
        isActive: true,
        instructorId,
      });
      expect(result.instructorId).toBe(instructorId);
    });
  });

  describe("getCourseById", () => {
    const mockCourse = {
      id: 1,
      name: "Test Course",
      description: "A test course",
      duration: "4 weeks",
      price: 100,
      maxStudents: 20,
      category: "Tech" as const,
      isActive: true,
      instructorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      instructor: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    };

    it("should return course when found", async () => {
      // Arrange
      mockCourseRepository.findById.mockResolvedValue(mockCourse);

      // Act
      const result = await courseService.getCourseById(1);

      // Assert
      expect(mockCourseRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCourse);
    });

    it("should throw NotFoundError when course not found", async () => {
      // Arrange
      mockCourseRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(courseService.getCourseById(1)).rejects.toThrow(
        NotFoundError
      );
      expect(mockCourseRepository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe("getAllCourses", () => {
    const mockCourses = [
      {
        id: 1,
        name: "Course 1",
        description: "Description 1",
        duration: "4 weeks",
        price: 100,
        maxStudents: 20,
        category: "Tech" as const,
        isActive: true,
        instructorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        instructor: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      },
    ];

    const mockResponse = {
      courses: mockCourses,
      total: 1,
      page: 1,
      totalPages: 1,
    };

    it("should return paginated courses", async () => {
      // Arrange
      mockCourseRepository.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await courseService.getAllCourses(1, 10);

      // Assert
      expect(mockCourseRepository.findAll).toHaveBeenCalledWith(
        1,
        10,
        undefined
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return courses with category filter", async () => {
      // Arrange
      mockCourseRepository.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await courseService.getAllCourses(1, 10, "Tech");

      // Assert
      expect(mockCourseRepository.findAll).toHaveBeenCalledWith(1, 10, "Tech");
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateCourse", () => {
    const mockUpdateData = {
      name: "Updated Course",
      price: 150,
    };

    const mockUpdatedCourse = {
      id: 1,
      name: "Updated Course",
      description: "A test course",
      duration: "4 weeks",
      price: 150,
      maxStudents: 20,
      category: "Tech" as const,
      isActive: true,
      instructorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      instructor: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    };

    it("should update course successfully", async () => {
      // Arrange
      mockCourseRepository.update.mockResolvedValue(mockUpdatedCourse);

      // Act
      const result = await courseService.updateCourse(1, mockUpdateData);

      // Assert
      expect(mockCourseRepository.update).toHaveBeenCalledWith(
        1,
        mockUpdateData
      );
      expect(result).toEqual(mockUpdatedCourse);
    });
  });

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      // Arrange
      mockCourseRepository.delete.mockResolvedValue(undefined);

      // Act
      await courseService.deleteCourse(1);

      // Assert
      expect(mockCourseRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("getCoursesByInstructor", () => {
    const mockCourses = [
      {
        id: 1,
        name: "Course 1",
        description: "Description 1",
        duration: "4 weeks",
        price: 100,
        maxStudents: 20,
        category: "Tech" as const,
        isActive: true,
        instructorId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        instructor: {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        },
      },
    ];

    it("should return courses for instructor", async () => {
      // Arrange
      mockCourseRepository.findByInstructorId.mockResolvedValue(mockCourses);

      // Act
      const result = await courseService.getCoursesByInstructor(1);

      // Assert
      expect(mockCourseRepository.findByInstructorId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCourses);
    });
  });

  describe("toggleCourseStatus", () => {
    const mockToggledCourse = {
      id: 1,
      name: "Test Course",
      description: "A test course",
      duration: "4 weeks",
      price: 100,
      maxStudents: 20,
      category: "Tech" as const,
      isActive: false,
      instructorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      instructor: {
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    };

    it("should toggle course status successfully", async () => {
      // Arrange
      mockCourseRepository.toggleStatus.mockResolvedValue(mockToggledCourse);

      // Act
      const result = await courseService.toggleCourseStatus(1);

      // Assert
      expect(mockCourseRepository.toggleStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockToggledCourse);
    });
  });
});
