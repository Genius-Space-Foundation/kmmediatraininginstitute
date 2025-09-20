/**
 * Firestore Assignment Repository
 *
 * This repository handles all assignment-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { Assignment, AssignmentSubmission } from "../types/entities";
import { PaginationParams } from "../types/dtos";
import { NotFoundError } from "../utils/errors";

export interface FirestoreAssignment extends Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: string;
  maxPoints: number;
  assignmentType: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  createdByEmail?: string;
  courseTitle?: string;
  submissionsCount?: number;
}

export interface FirestoreAssignmentSubmission extends AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionText?: string;
  fileUrl?: string;
  fileName?: string;
  submittedAt?: string;
  status: string;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  studentEmail?: string;
  studentName?: string;
  assignmentTitle?: string;
  maxPoints?: number;
}

export class FirestoreAssignmentRepository extends FirestoreBaseRepository {
  constructor() {
    super("assignments");
  }

  /**
   * Find assignment by ID with related data
   */
  async findByIdWithDetails(id: string): Promise<FirestoreAssignment | null> {
    try {
      const assignment = await this.findById<FirestoreAssignment>(id);
      if (!assignment) return null;

      // Get created by user details
      if (assignment.createdBy) {
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            assignment.createdBy
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            assignment.createdByEmail = userData.email;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }
      }

      // Get course details
      try {
        const courseDoc = await FirestoreUtils.getDocument(
          "courses",
          assignment.courseId
        ).get();
        if (courseDoc.exists) {
          const courseData = courseDoc.data()!;
          assignment.courseTitle = courseData.name;
        }
      } catch (error) {
        console.warn("Could not fetch course data:", error);
      }

      // Get submissions count
      try {
        const submissionsSnapshot = await FirestoreUtils.getSubcollection(
          "assignments",
          id,
          "submissions"
        ).get();
        assignment.submissionsCount = submissionsSnapshot.size;
      } catch (error) {
        console.warn("Could not fetch submissions count:", error);
      }

      return assignment;
    } catch (error) {
      console.error("Error finding assignment by ID:", error);
      throw error;
    }
  }

  /**
   * Find assignments by course ID
   */
  async findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreAssignment[]> {
    try {
      const searchConditions = [
        {
          field: "courseId",
          operator: "==" as const,
          value: courseId,
        },
        {
          field: "isActive",
          operator: "==" as const,
          value: true,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const assignments = await this.search<FirestoreAssignment>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with additional data
      for (const assignment of assignments) {
        // Get created by user details
        if (assignment.createdBy) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              assignment.createdBy
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              assignment.createdByEmail = userData.email;
            }
          } catch (error) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Get submissions count
        try {
          const submissionsSnapshot = await FirestoreUtils.getSubcollection(
            "assignments",
            assignment.id,
            "submissions"
          ).get();
          assignment.submissionsCount = submissionsSnapshot.size;
        } catch (error) {
          console.warn("Could not fetch submissions count:", error);
        }
      }

      return assignments;
    } catch (error) {
      console.error("Error finding assignments by course ID:", error);
      throw error;
    }
  }

  /**
   * Find assignments by student ID (courses they're enrolled in)
   */
  async findByStudentId(
    studentId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreAssignment[]> {
    try {
      // First, get student's enrolled courses
      const registrationsSnapshot = await FirestoreUtils.getCollection(
        "registrations"
      )
        .where("studentId", "==", studentId)
        .where("status", "==", "approved")
        .get();

      const courseIds = registrationsSnapshot.docs.map(
        (doc) => doc.data().courseId
      );

      if (courseIds.length === 0) {
        return [];
      }

      // Get assignments for these courses
      const searchConditions = [
        {
          field: "courseId",
          operator: "in" as const,
          value: courseIds,
        },
        {
          field: "isActive",
          operator: "==" as const,
          value: true,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "dueDate";
      const orderDirection = (pagination?.order || "asc") as "asc" | "desc";

      const assignments = await this.search<FirestoreAssignment>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with additional data
      for (const assignment of assignments) {
        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            assignment.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            assignment.courseTitle = courseData.name;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }

        // Get student's submission for this assignment
        try {
          const submissionSnapshot = await FirestoreUtils.getSubcollection(
            "assignments",
            assignment.id,
            "submissions"
          )
            .where("studentId", "==", studentId)
            .limit(1)
            .get();

          if (!submissionSnapshot.empty) {
            const submission = FirestoreUtils.docToObject(
              submissionSnapshot.docs[0]
            );
            assignment.submissionId = submission.id;
            assignment.submissionStatus = submission.status;
            assignment.grade = submission.grade;
            assignment.submittedAt = submission.submittedAt;
            assignment.feedback = submission.feedback;
          }
        } catch (error) {
          console.warn("Could not fetch submission data:", error);
        }
      }

      return assignments;
    } catch (error) {
      console.error("Error finding assignments by student ID:", error);
      throw error;
    }
  }

  /**
   * Find upcoming assignments for a student
   */
  async findUpcoming(
    studentId: string,
    days: number = 7
  ): Promise<FirestoreAssignment[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      // First, get student's enrolled courses
      const registrationsSnapshot = await FirestoreUtils.getCollection(
        "registrations"
      )
        .where("studentId", "==", studentId)
        .where("status", "==", "approved")
        .get();

      const courseIds = registrationsSnapshot.docs.map(
        (doc) => doc.data().courseId
      );

      if (courseIds.length === 0) {
        return [];
      }

      // Get upcoming assignments for these courses
      const searchConditions = [
        {
          field: "courseId",
          operator: "in" as const,
          value: courseIds,
        },
        {
          field: "isActive",
          operator: "==" as const,
          value: true,
        },
        {
          field: "dueDate",
          operator: ">=" as const,
          value: new Date().toISOString(),
        },
        {
          field: "dueDate",
          operator: "<=" as const,
          value: endDate.toISOString(),
        },
      ];

      const assignments = await this.search<FirestoreAssignment>(
        searchConditions,
        undefined,
        "dueDate",
        "asc"
      );

      // Filter out assignments that are already submitted
      const filteredAssignments = [];
      for (const assignment of assignments) {
        try {
          const submissionSnapshot = await FirestoreUtils.getSubcollection(
            "assignments",
            assignment.id,
            "submissions"
          )
            .where("studentId", "==", studentId)
            .where("status", "in", ["submitted", "graded"])
            .limit(1)
            .get();

          // Only include if no submission exists or status is not submitted/graded
          if (submissionSnapshot.empty) {
            filteredAssignments.push(assignment);
          }
        } catch (error) {
          console.warn("Could not check submission status:", error);
          filteredAssignments.push(assignment);
        }
      }

      return filteredAssignments;
    } catch (error) {
      console.error("Error finding upcoming assignments:", error);
      throw error;
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(assignmentData: {
    courseId: string;
    title: string;
    description: string;
    instructions?: string;
    dueDate?: string;
    maxPoints: number;
    assignmentType: string;
    isActive?: boolean;
    createdBy: string;
  }): Promise<FirestoreAssignment> {
    const assignmentDataWithDefaults = {
      ...assignmentData,
      isActive:
        assignmentData.isActive !== undefined ? assignmentData.isActive : true,
    };

    return super.create(assignmentDataWithDefaults);
  }

  /**
   * Update assignment
   */
  async updateAssignment(
    id: string,
    updates: Partial<FirestoreAssignment>
  ): Promise<FirestoreAssignment> {
    return super.update(id, updates);
  }

  /**
   * Delete assignment (soft delete by setting isActive to false)
   */
  async deleteAssignment(id: string): Promise<boolean> {
    try {
      await super.update(id, { isActive: false });
      return true;
    } catch (error) {
      console.error("Error deleting assignment:", error);
      return false;
    }
  }

  /**
   * Count assignments by course ID
   */
  async countByCourseId(courseId: string): Promise<number> {
    return this.countByField("courseId", courseId);
  }

  // Assignment Submission methods

  /**
   * Find submission by ID with details
   */
  async findSubmissionById(
    id: string
  ): Promise<FirestoreAssignmentSubmission | null> {
    try {
      // Find submission across all assignments
      const assignmentsSnapshot = await FirestoreUtils.getCollection(
        "assignments"
      ).get();

      for (const assignmentDoc of assignmentsSnapshot.docs) {
        const submissionSnapshot = await FirestoreUtils.getSubcollection(
          "assignments",
          assignmentDoc.id,
          "submissions"
        )
          .where("id", "==", id)
          .limit(1)
          .get();

        if (!submissionSnapshot.empty) {
          const submission = FirestoreUtils.docToObject(
            submissionSnapshot.docs[0]
          );

          // Get assignment details
          const assignment = FirestoreUtils.docToObject(assignmentDoc);
          submission.assignmentTitle = assignment.title;
          submission.maxPoints = assignment.maxPoints;

          // Get student details
          try {
            const studentDoc = await FirestoreUtils.getDocument(
              "users",
              submission.studentId
            ).get();
            if (studentDoc.exists) {
              const studentData = studentDoc.data()!;
              submission.studentEmail = studentData.email;
              submission.studentName = `${studentData.firstName} ${studentData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch student data:", error);
          }

          return submission;
        }
      }

      return null;
    } catch (error) {
      console.error("Error finding submission by ID:", error);
      throw error;
    }
  }

  /**
   * Find submissions by assignment ID
   */
  async findSubmissionsByAssignment(
    assignmentId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreAssignmentSubmission[]> {
    try {
      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "submittedAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      let query = FirestoreUtils.getSubcollection(
        "assignments",
        assignmentId,
        "submissions"
      );

      if (orderBy) {
        query = query.orderBy(orderBy, orderDirection);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const submissions = snapshot.docs.map((doc) =>
        FirestoreUtils.docToObject(doc)
      );

      // Get assignment details
      try {
        const assignmentDoc = await FirestoreUtils.getDocument(
          "assignments",
          assignmentId
        ).get();
        if (assignmentDoc.exists) {
          const assignment = FirestoreUtils.docToObject(assignmentDoc);
          submissions.forEach((submission) => {
            submission.assignmentTitle = assignment.title;
            submission.maxPoints = assignment.maxPoints;
          });
        }
      } catch (error) {
        console.warn("Could not fetch assignment data:", error);
      }

      // Get student details
      for (const submission of submissions) {
        try {
          const studentDoc = await FirestoreUtils.getDocument(
            "users",
            submission.studentId
          ).get();
          if (studentDoc.exists) {
            const studentData = studentDoc.data()!;
            submission.studentEmail = studentData.email;
            submission.studentName = `${studentData.firstName} ${studentData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch student data:", error);
        }
      }

      return submissions;
    } catch (error) {
      console.error("Error finding submissions by assignment:", error);
      throw error;
    }
  }

  /**
   * Find submission by student and assignment
   */
  async findSubmissionByStudentAndAssignment(
    studentId: string,
    assignmentId: string
  ): Promise<FirestoreAssignmentSubmission | null> {
    try {
      const submissionSnapshot = await FirestoreUtils.getSubcollection(
        "assignments",
        assignmentId,
        "submissions"
      )
        .where("studentId", "==", studentId)
        .limit(1)
        .get();

      if (submissionSnapshot.empty) {
        return null;
      }

      const submission = FirestoreUtils.docToObject(submissionSnapshot.docs[0]);

      // Get assignment details
      try {
        const assignmentDoc = await FirestoreUtils.getDocument(
          "assignments",
          assignmentId
        ).get();
        if (assignmentDoc.exists) {
          const assignment = FirestoreUtils.docToObject(assignmentDoc);
          submission.assignmentTitle = assignment.title;
          submission.maxPoints = assignment.maxPoints;
        }
      } catch (error) {
        console.warn("Could not fetch assignment data:", error);
      }

      return submission;
    } catch (error) {
      console.error(
        "Error finding submission by student and assignment:",
        error
      );
      throw error;
    }
  }

  /**
   * Create a new submission
   */
  async createSubmission(
    assignmentId: string,
    submissionData: {
      studentId: string;
      submissionText?: string;
      fileUrl?: string;
      fileName?: string;
      status: string;
    }
  ): Promise<FirestoreAssignmentSubmission> {
    try {
      const submissionRef = FirestoreUtils.getSubcollection(
        "assignments",
        assignmentId,
        "submissions"
      ).doc();

      const submissionWithDefaults = {
        ...submissionData,
        assignmentId,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await submissionRef.set(submissionWithDefaults);

      const createdDoc = await submissionRef.get();
      return FirestoreUtils.docToObject(createdDoc);
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  }

  /**
   * Update submission
   */
  async updateSubmission(
    assignmentId: string,
    submissionId: string,
    updates: Partial<FirestoreAssignmentSubmission>
  ): Promise<FirestoreAssignmentSubmission> {
    try {
      const submissionRef = FirestoreUtils.getSubcollection(
        "assignments",
        assignmentId,
        "submissions"
      ).doc(submissionId);

      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await submissionRef.update(updateData);

      const updatedDoc = await submissionRef.get();
      return FirestoreUtils.docToObject(updatedDoc);
    } catch (error) {
      console.error("Error updating submission:", error);
      throw error;
    }
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    assignmentId: string,
    submissionId: string,
    grade: number,
    feedback: string,
    gradedBy: string
  ): Promise<FirestoreAssignmentSubmission> {
    const updates = {
      grade,
      feedback,
      gradedBy,
      gradedAt: new Date().toISOString(),
      status: "graded",
    };

    return this.updateSubmission(assignmentId, submissionId, updates);
  }
}

export const firestoreAssignmentRepository =
  new FirestoreAssignmentRepository();
