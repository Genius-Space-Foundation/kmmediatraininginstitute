/**
 * Firestore Live Class Repository
 *
 * This repository handles all live class-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { LiveClass, CatchupSession } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export interface FirestoreLiveClass extends LiveClass {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes: number;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  createdByEmail?: string;
  createdByName?: string;
  courseTitle?: string;
  courseImage?: string;
  attendeesCount?: number;
}

export interface FirestoreCatchupSession extends CatchupSession {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  recordingUrl?: string;
  durationMinutes: number;
  originalClassId?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  originalClassTitle?: string;
  originalClassDate?: string;
  createdByEmail?: string;
  createdByName?: string;
}

export class FirestoreLiveClassRepository extends FirestoreBaseRepository {
  constructor() {
    super("liveClasses");
  }

  /**
   * Find live class by ID with related data
   */
  async findByIdWithDetails(id: string): Promise<FirestoreLiveClass | null> {
    try {
      const liveClass = await this.findById<FirestoreLiveClass>(id);
      if (!liveClass) return null;

      // Get created by user details
      if (liveClass.createdBy) {
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            liveClass.createdBy
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            liveClass.createdByEmail = userData.email;
            liveClass.createdByName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }
      }

      // Get course details
      try {
        const courseDoc = await FirestoreUtils.getDocument(
          "courses",
          liveClass.courseId
        ).get();
        if (courseDoc.exists) {
          const courseData = courseDoc.data()!;
          liveClass.courseTitle = courseData.name;
          liveClass.courseImage = courseData.featuredImage;
        }
      } catch (error) {
        console.warn("Could not fetch course data:", error);
      }

      // Get attendees count
      try {
        liveClass.attendeesCount = await this.getAttendeesCount(id);
      } catch (error) {
        console.warn("Could not fetch attendees count:", error);
      }

      return liveClass;
    } catch (error) {
      console.error("Error finding live class by ID:", error);
      throw error;
    }
  }

  /**
   * Find live classes by course ID
   */
  async findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreLiveClass[]> {
    try {
      const searchConditions = [
        {
          field: "courseId",
          operator: "==" as const,
          value: courseId,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "scheduledDate";
      const orderDirection = (pagination?.order || "asc") as "asc" | "desc";

      const liveClasses = await this.search<FirestoreLiveClass>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with additional data
      for (const liveClass of liveClasses) {
        // Get created by user details
        if (liveClass.createdBy) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              liveClass.createdBy
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              liveClass.createdByEmail = userData.email;
              liveClass.createdByName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            liveClass.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            liveClass.courseTitle = courseData.name;
            liveClass.courseImage = courseData.featuredImage;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return liveClasses;
    } catch (error) {
      console.error("Error finding live classes by course ID:", error);
      throw error;
    }
  }

  /**
   * Find upcoming live classes
   */
  async findUpcoming(
    studentId?: string,
    days: number = 7
  ): Promise<FirestoreLiveClass[]> {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const searchConditions = [
        {
          field: "scheduledDate",
          operator: ">=" as const,
          value: new Date().toISOString(),
        },
        {
          field: "scheduledDate",
          operator: "<=" as const,
          value: endDate.toISOString(),
        },
        {
          field: "status",
          operator: "in" as const,
          value: ["scheduled", "ongoing"],
        },
      ];

      let liveClasses = await this.search<FirestoreLiveClass>(
        searchConditions,
        undefined,
        "scheduledDate",
        "asc"
      );

      // If studentId is provided, filter by enrolled courses
      if (studentId) {
        try {
          const registrationsSnapshot = await FirestoreUtils.getCollection(
            "registrations"
          )
            .where("studentId", "==", studentId)
            .where("status", "==", "approved")
            .get();

          const enrolledCourseIds = registrationsSnapshot.docs.map(
            (doc) => doc.data().courseId
          );
          liveClasses = liveClasses.filter((liveClass) =>
            enrolledCourseIds.includes(liveClass.courseId)
          );
        } catch (error) {
          console.warn("Could not filter by enrolled courses:", error);
        }
      }

      // Enrich with additional data
      for (const liveClass of liveClasses) {
        // Get created by user details
        if (liveClass.createdBy) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              liveClass.createdBy
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              liveClass.createdByEmail = userData.email;
              liveClass.createdByName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            liveClass.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            liveClass.courseTitle = courseData.name;
            liveClass.courseImage = courseData.featuredImage;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return liveClasses;
    } catch (error) {
      console.error("Error finding upcoming live classes:", error);
      throw error;
    }
  }

  /**
   * Find ongoing live classes
   */
  async findOngoing(): Promise<FirestoreLiveClass[]> {
    try {
      const searchConditions = [
        {
          field: "status",
          operator: "==" as const,
          value: "ongoing",
        },
      ];

      const liveClasses = await this.search<FirestoreLiveClass>(
        searchConditions,
        undefined,
        "scheduledDate",
        "asc"
      );

      // Enrich with additional data
      for (const liveClass of liveClasses) {
        // Get created by user details
        if (liveClass.createdBy) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              liveClass.createdBy
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              liveClass.createdByEmail = userData.email;
              liveClass.createdByName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            liveClass.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            liveClass.courseTitle = courseData.name;
            liveClass.courseImage = courseData.featuredImage;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return liveClasses;
    } catch (error) {
      console.error("Error finding ongoing live classes:", error);
      throw error;
    }
  }

  /**
   * Find completed live classes
   */
  async findCompleted(
    courseId?: string,
    pagination?: PaginationParams
  ): Promise<FirestoreLiveClass[]> {
    try {
      const searchConditions = [
        {
          field: "status",
          operator: "==" as const,
          value: "completed",
        },
      ];

      if (courseId) {
        searchConditions.push({
          field: "courseId",
          operator: "==" as const,
          value: courseId,
        });
      }

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "scheduledDate";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const liveClasses = await this.search<FirestoreLiveClass>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with additional data
      for (const liveClass of liveClasses) {
        // Get created by user details
        if (liveClass.createdBy) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              liveClass.createdBy
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              liveClass.createdByEmail = userData.email;
              liveClass.createdByName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch user data:", error);
          }
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            liveClass.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            liveClass.courseTitle = courseData.name;
            liveClass.courseImage = courseData.featuredImage;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return liveClasses;
    } catch (error) {
      console.error("Error finding completed live classes:", error);
      throw error;
    }
  }

  /**
   * Create a new live class
   */
  async createLiveClass(liveClassData: {
    courseId: string;
    title: string;
    description?: string;
    scheduledDate: string;
    durationMinutes: number;
    meetingUrl?: string;
    meetingId?: string;
    meetingPassword?: string;
    status?: string;
    createdBy: string;
  }): Promise<FirestoreLiveClass> {
    const liveClassDataWithDefaults = {
      ...liveClassData,
      status: liveClassData.status || "scheduled",
    };

    return super.create(liveClassDataWithDefaults);
  }

  /**
   * Update live class
   */
  async updateLiveClass(
    id: string,
    updates: Partial<FirestoreLiveClass>
  ): Promise<FirestoreLiveClass> {
    return super.update(id, updates);
  }

  /**
   * Delete live class (soft delete by setting status to cancelled)
   */
  async deleteLiveClass(id: string): Promise<boolean> {
    try {
      await super.update(id, { status: "cancelled" });
      return true;
    } catch (error) {
      console.error("Error deleting live class:", error);
      return false;
    }
  }

  /**
   * Count live classes by course ID
   */
  async countByCourseId(courseId: string): Promise<number> {
    return this.countByField("courseId", courseId);
  }

  /**
   * Get attendees count for a live class
   */
  async getAttendeesCount(classId: string): Promise<number> {
    try {
      const liveClass = await this.findById<FirestoreLiveClass>(classId);
      if (!liveClass) return 0;

      const registrationsSnapshot = await FirestoreUtils.getCollection(
        "registrations"
      )
        .where("courseId", "==", liveClass.courseId)
        .where("status", "==", "approved")
        .get();

      return registrationsSnapshot.size;
    } catch (error) {
      console.error("Error getting attendees count:", error);
      return 0;
    }
  }

  /**
   * Update live class status
   */
  async updateStatus(
    classId: string,
    status: string
  ): Promise<FirestoreLiveClass> {
    return super.update(classId, { status });
  }

  // Catchup Session methods

  /**
   * Find catchup session by ID with details
   */
  async findCatchupSessionById(
    id: string
  ): Promise<FirestoreCatchupSession | null> {
    try {
      const catchupSession = await FirestoreUtils.getDocument(
        "catchupSessions",
        id
      ).get();
      if (!catchupSession.exists) return null;

      const session = FirestoreUtils.docToObject(catchupSession);

      // Get original class details
      if (session.originalClassId) {
        try {
          const originalClassDoc = await FirestoreUtils.getDocument(
            "liveClasses",
            session.originalClassId
          ).get();
          if (originalClassDoc.exists) {
            const originalClass = FirestoreUtils.docToObject(originalClassDoc);
            session.originalClassTitle = originalClass.title;
            session.originalClassDate = originalClass.scheduledDate;
          }
        } catch (error) {
          console.warn("Could not fetch original class data:", error);
        }
      }

      // Get created by user details
      if (session.createdBy) {
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            session.createdBy
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            session.createdByEmail = userData.email;
            session.createdByName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }
      }

      return session;
    } catch (error) {
      console.error("Error finding catchup session by ID:", error);
      throw error;
    }
  }

  /**
   * Find catchup sessions by course
   */
  async findCatchupSessionsByCourse(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreCatchupSession[]> {
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

      const sessions = await this.search<FirestoreCatchupSession>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with additional data
      for (const session of sessions) {
        // Get original class details
        if (session.originalClassId) {
          try {
            const originalClassDoc = await FirestoreUtils.getDocument(
              "liveClasses",
              session.originalClassId
            ).get();
            if (originalClassDoc.exists) {
              const originalClass =
                FirestoreUtils.docToObject(originalClassDoc);
              session.originalClassTitle = originalClass.title;
              session.originalClassDate = originalClass.scheduledDate;
            }
          } catch (error) {
            console.warn("Could not fetch original class data:", error);
          }
        }

        // Get created by user details
        if (session.createdBy) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              session.createdBy
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              session.createdByEmail = userData.email;
              session.createdByName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch user data:", error);
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error("Error finding catchup sessions by course:", error);
      throw error;
    }
  }

  /**
   * Create a new catchup session
   */
  async createCatchupSession(sessionData: {
    courseId: string;
    title: string;
    description?: string;
    recordingUrl?: string;
    durationMinutes: number;
    originalClassId?: string;
    isActive?: boolean;
    createdBy: string;
  }): Promise<FirestoreCatchupSession> {
    const sessionDataWithDefaults = {
      ...sessionData,
      isActive:
        sessionData.isActive !== undefined ? sessionData.isActive : true,
    };

    return FirestoreUtils.getCollection("catchupSessions")
      .add(sessionDataWithDefaults)
      .then(async (docRef) => {
        const createdDoc = await docRef.get();
        return FirestoreUtils.docToObject(createdDoc);
      });
  }

  /**
   * Update catchup session
   */
  async updateCatchupSession(
    id: string,
    updates: Partial<FirestoreCatchupSession>
  ): Promise<FirestoreCatchupSession> {
    try {
      const docRef = FirestoreUtils.getDocument("catchupSessions", id);
      await docRef.update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await docRef.get();
      return FirestoreUtils.docToObject(updatedDoc);
    } catch (error) {
      console.error("Error updating catchup session:", error);
      throw error;
    }
  }

  /**
   * Delete catchup session (soft delete by setting isActive to false)
   */
  async deleteCatchupSession(id: string): Promise<boolean> {
    try {
      const docRef = FirestoreUtils.getDocument("catchupSessions", id);
      await docRef.update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error("Error deleting catchup session:", error);
      return false;
    }
  }
}

export const firestoreLiveClassRepository = new FirestoreLiveClassRepository();
