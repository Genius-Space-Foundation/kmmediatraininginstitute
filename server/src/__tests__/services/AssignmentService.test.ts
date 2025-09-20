import { AssignmentService } from "../../services/AssignmentService";
import { AssignmentRepository } from "../../repositories/AssignmentRepository";
import { CourseRepository } from "../../repositories/CourseRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { testPool } from "../setup";
import { CreateAssignmentRequest } from "../../types";

describe("AssignmentService", () => {
  let assignmentService: AssignmentService;
  let assignmentRepository: AssignmentRepository;
  let courseRepository: CourseRepository;
  let userRepository: UserRepository;

  beforeAll(() => {
    assignmentRepository = new AssignmentRepository(testPool);
    courseRepository = new CourseRepository(testPool);
    userRepository = new UserRepository(testPool);
    assignmentService = new AssignmentService(
      assignmentRepository,
      courseRepository,
      userRepository
    );
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await testPool.query("DELETE FROM assignment_submissions");
    await testPool.query("DELETE FROM assignments");
    await testPool.query("DELETE FROM courses");
    await testPool.query("DELETE FROM users");
  });

  describe("createAssignment", () => {
    it("should create an assignment successfully", async () => {
      // Create a test course first
      const course = await courseRepository.create({
        title: "Test Course",
        description: "Test Description",
        price: 100,
        level: "beginner",
        is_active: true,
        trainer_id: "test-trainer-id",
      });

      // Create a test trainer
      const trainer = await userRepository.create({
        email: "trainer@test.com",
        password_hash: "hashed-password",
        first_name: "Test",
        last_name: "Trainer",
        role: "trainer",
        is_active: true,
        email_verified: true,
      });

      const assignmentData: CreateAssignmentRequest = {
        course_id: course.id,
        title: "Test Assignment",
        description: "Test Assignment Description",
        max_points: 100,
        assignment_type: "homework",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      };

      const assignment = await assignmentService.createAssignment(
        assignmentData,
        trainer.id
      );

      expect(assignment).toBeDefined();
      expect(assignment.title).toBe(assignmentData.title);
      expect(assignment.description).toBe(assignmentData.description);
      expect(assignment.max_points).toBe(assignmentData.max_points);
      expect(assignment.assignment_type).toBe(assignmentData.assignment_type);
      expect(assignment.is_active).toBe(true);
    });

    it("should throw error when course does not exist", async () => {
      const assignmentData: CreateAssignmentRequest = {
        course_id: "non-existent-course-id",
        title: "Test Assignment",
        description: "Test Assignment Description",
        max_points: 100,
        assignment_type: "homework",
      };

      await expect(
        assignmentService.createAssignment(assignmentData, "test-trainer-id")
      ).rejects.toThrow("Course not found");
    });

    it("should throw error when user does not have permission", async () => {
      // Create a test course
      const course = await courseRepository.create({
        title: "Test Course",
        description: "Test Description",
        price: 100,
        level: "beginner",
        is_active: true,
        trainer_id: "different-trainer-id",
      });

      const assignmentData: CreateAssignmentRequest = {
        course_id: course.id,
        title: "Test Assignment",
        description: "Test Assignment Description",
        max_points: 100,
        assignment_type: "homework",
      };

      await expect(
        assignmentService.createAssignment(
          assignmentData,
          "unauthorized-user-id"
        )
      ).rejects.toThrow(
        "You don't have permission to create assignments for this course"
      );
    });

    it("should throw error when due date is in the past", async () => {
      // Create a test course
      const course = await courseRepository.create({
        title: "Test Course",
        description: "Test Description",
        price: 100,
        level: "beginner",
        is_active: true,
        trainer_id: "test-trainer-id",
      });

      // Create a test trainer
      const trainer = await userRepository.create({
        email: "trainer@test.com",
        password_hash: "hashed-password",
        first_name: "Test",
        last_name: "Trainer",
        role: "trainer",
        is_active: true,
        email_verified: true,
      });

      const assignmentData: CreateAssignmentRequest = {
        course_id: course.id,
        title: "Test Assignment",
        description: "Test Assignment Description",
        max_points: 100,
        assignment_type: "homework",
        due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      };

      await expect(
        assignmentService.createAssignment(assignmentData, trainer.id)
      ).rejects.toThrow("Due date must be in the future");
    });

    it("should throw error when max points is invalid", async () => {
      // Create a test course
      const course = await courseRepository.create({
        title: "Test Course",
        description: "Test Description",
        price: 100,
        level: "beginner",
        is_active: true,
        trainer_id: "test-trainer-id",
      });

      // Create a test trainer
      const trainer = await userRepository.create({
        email: "trainer@test.com",
        password_hash: "hashed-password",
        first_name: "Test",
        last_name: "Trainer",
        role: "trainer",
        is_active: true,
        email_verified: true,
      });

      const assignmentData: CreateAssignmentRequest = {
        course_id: course.id,
        title: "Test Assignment",
        description: "Test Assignment Description",
        max_points: 0, // Invalid max points
        assignment_type: "homework",
      };

      await expect(
        assignmentService.createAssignment(assignmentData, trainer.id)
      ).rejects.toThrow("Max points must be between 1 and 1000");
    });
  });

  describe("getAssignmentById", () => {
    it("should return assignment when it exists", async () => {
      // Create a test course
      const course = await courseRepository.create({
        title: "Test Course",
        description: "Test Description",
        price: 100,
        level: "beginner",
        is_active: true,
        trainer_id: "test-trainer-id",
      });

      // Create a test assignment
      const assignment = await assignmentRepository.create({
        course_id: course.id,
        title: "Test Assignment",
        description: "Test Assignment Description",
        max_points: 100,
        assignment_type: "homework",
        is_active: true,
        created_by: "test-trainer-id",
      });

      const result = await assignmentService.getAssignmentById(assignment.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(assignment.id);
      expect(result.title).toBe(assignment.title);
    });

    it("should throw error when assignment does not exist", async () => {
      await expect(
        assignmentService.getAssignmentById("non-existent-id")
      ).rejects.toThrow("Assignment not found");
    });
  });

  describe("getAssignmentsByCourse", () => {
    it("should return assignments for a course", async () => {
      // Create a test course
      const course = await courseRepository.create({
        title: "Test Course",
        description: "Test Description",
        price: 100,
        level: "beginner",
        is_active: true,
        trainer_id: "test-trainer-id",
      });

      // Create test assignments
      await assignmentRepository.create({
        course_id: course.id,
        title: "Assignment 1",
        description: "Description 1",
        max_points: 100,
        assignment_type: "homework",
        is_active: true,
        created_by: "test-trainer-id",
      });

      await assignmentRepository.create({
        course_id: course.id,
        title: "Assignment 2",
        description: "Description 2",
        max_points: 50,
        assignment_type: "quiz",
        is_active: true,
        created_by: "test-trainer-id",
      });

      const assignments = await assignmentService.getAssignmentsByCourse(
        course.id
      );

      expect(assignments).toHaveLength(2);
      expect(assignments[0].title).toBe("Assignment 1");
      expect(assignments[1].title).toBe("Assignment 2");
    });

    it("should throw error when course does not exist", async () => {
      await expect(
        assignmentService.getAssignmentsByCourse("non-existent-course-id")
      ).rejects.toThrow("Course not found");
    });
  });
});



