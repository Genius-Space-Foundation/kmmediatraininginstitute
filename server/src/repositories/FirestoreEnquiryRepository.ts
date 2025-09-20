/**
 * Firestore Enquiry Repository
 *
 * This repository handles all enquiry-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { Enquiry } from "../types/entities";
import { PaginationParams } from "../types/dtos";

export interface FirestoreEnquiry extends Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  courseInterest?: string;
  message: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  assignedUserEmail?: string;
  assignedUserName?: string;
}

export class FirestoreEnquiryRepository extends FirestoreBaseRepository {
  constructor() {
    super("enquiries");
  }

  /**
   * Find enquiry by ID with related data
   */
  async findByIdWithDetails(id: string): Promise<FirestoreEnquiry | null> {
    try {
      const enquiry = await this.findById<FirestoreEnquiry>(id);
      if (!enquiry) return null;

      // Get assigned user details
      if (enquiry.assignedTo) {
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            enquiry.assignedTo
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            enquiry.assignedUserEmail = userData.email;
            enquiry.assignedUserName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch assigned user data:", error);
        }
      }

      return enquiry;
    } catch (error) {
      console.error("Error finding enquiry by ID:", error);
      throw error;
    }
  }

  /**
   * Find all enquiries with pagination
   */
  async findAllWithDetails(
    pagination?: PaginationParams
  ): Promise<FirestoreEnquiry[]> {
    try {
      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const enquiries = await this.getPaginated<FirestoreEnquiry>(
        pagination?.page || 1,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with assigned user details
      for (const enquiry of enquiries.data) {
        if (enquiry.assignedTo) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              enquiry.assignedTo
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              enquiry.assignedUserEmail = userData.email;
              enquiry.assignedUserName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch assigned user data:", error);
          }
        }
      }

      return enquiries.data;
    } catch (error) {
      console.error("Error finding all enquiries:", error);
      throw error;
    }
  }

  /**
   * Find enquiries by status
   */
  async findByStatus(
    status: string,
    pagination?: PaginationParams
  ): Promise<FirestoreEnquiry[]> {
    try {
      const searchConditions = [
        {
          field: "status",
          operator: "==" as const,
          value: status,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const enquiries = await this.search<FirestoreEnquiry>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with assigned user details
      for (const enquiry of enquiries) {
        if (enquiry.assignedTo) {
          try {
            const userDoc = await FirestoreUtils.getDocument(
              "users",
              enquiry.assignedTo
            ).get();
            if (userDoc.exists) {
              const userData = userDoc.data()!;
              enquiry.assignedUserEmail = userData.email;
              enquiry.assignedUserName = `${userData.firstName} ${userData.lastName}`;
            }
          } catch (error) {
            console.warn("Could not fetch assigned user data:", error);
          }
        }
      }

      return enquiries;
    } catch (error) {
      console.error("Error finding enquiries by status:", error);
      throw error;
    }
  }

  /**
   * Create a new enquiry
   */
  async createEnquiry(enquiryData: {
    name: string;
    email: string;
    phone?: string;
    courseInterest?: string;
    message: string;
    status?: string;
  }): Promise<FirestoreEnquiry> {
    const enquiryDataWithDefaults = {
      ...enquiryData,
      status: enquiryData.status || "new",
    };

    return super.create(enquiryDataWithDefaults);
  }

  /**
   * Update enquiry
   */
  async updateEnquiry(
    id: string,
    updates: Partial<FirestoreEnquiry>
  ): Promise<FirestoreEnquiry> {
    return super.update(id, updates);
  }

  /**
   * Delete enquiry
   */
  async deleteEnquiry(id: string): Promise<boolean> {
    try {
      await super.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      return false;
    }
  }

  /**
   * Count enquiries by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.countByField("status", status);
  }

  /**
   * Get enquiry statistics
   */
  async getStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    enrolled: number;
    closed: number;
  }> {
    try {
      const total = await this.count();
      const newCount = await this.countByField("status", "new");
      const contacted = await this.countByField("status", "contacted");
      const enrolled = await this.countByField("status", "enrolled");
      const closed = await this.countByField("status", "closed");

      return {
        total,
        new: newCount,
        contacted,
        enrolled,
        closed,
      };
    } catch (error) {
      console.error("Error getting enquiry stats:", error);
      return {
        total: 0,
        new: 0,
        contacted: 0,
        enrolled: 0,
        closed: 0,
      };
    }
  }

  /**
   * Search enquiries by text
   */
  async searchEnquiries(
    searchTerm: string,
    limit: number = 10
  ): Promise<FirestoreEnquiry[]> {
    try {
      // Get all enquiries and filter client-side (Firestore doesn't support full-text search)
      const enquiries = await this.findAll<FirestoreEnquiry>();

      const searchTermLower = searchTerm.toLowerCase();

      const filteredEnquiries = enquiries.filter(
        (enquiry) =>
          enquiry.name.toLowerCase().includes(searchTermLower) ||
          enquiry.email.toLowerCase().includes(searchTermLower) ||
          enquiry.message.toLowerCase().includes(searchTermLower) ||
          (enquiry.courseInterest &&
            enquiry.courseInterest.toLowerCase().includes(searchTermLower))
      );

      return filteredEnquiries.slice(0, limit);
    } catch (error) {
      console.error("Error searching enquiries:", error);
      return [];
    }
  }

  /**
   * Assign enquiry to user
   */
  async assignEnquiry(
    enquiryId: string,
    userId: string
  ): Promise<FirestoreEnquiry> {
    return super.update(enquiryId, { assignedTo: userId });
  }

  /**
   * Update enquiry status
   */
  async updateStatus(
    enquiryId: string,
    status: string
  ): Promise<FirestoreEnquiry> {
    return super.update(enquiryId, { status });
  }

  /**
   * Get enquiries by assigned user
   */
  async findByAssignedUser(
    userId: string,
    pagination?: PaginationParams
  ): Promise<FirestoreEnquiry[]> {
    try {
      const searchConditions = [
        {
          field: "assignedTo",
          operator: "==" as const,
          value: userId,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      return this.search<FirestoreEnquiry>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );
    } catch (error) {
      console.error("Error finding enquiries by assigned user:", error);
      throw error;
    }
  }

  /**
   * Get recent enquiries
   */
  async getRecentEnquiries(limit: number = 5): Promise<FirestoreEnquiry[]> {
    try {
      const enquiries = await this.getPaginated<FirestoreEnquiry>(
        1,
        limit,
        "createdAt",
        "desc"
      );

      return enquiries.data;
    } catch (error) {
      console.error("Error getting recent enquiries:", error);
      return [];
    }
  }

  /**
   * Get enquiries by course interest
   */
  async findByCourseInterest(
    courseInterest: string,
    pagination?: PaginationParams
  ): Promise<FirestoreEnquiry[]> {
    try {
      const searchConditions = [
        {
          field: "courseInterest",
          operator: "==" as const,
          value: courseInterest,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      return this.search<FirestoreEnquiry>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );
    } catch (error) {
      console.error("Error finding enquiries by course interest:", error);
      throw error;
    }
  }
}

export const firestoreEnquiryRepository = new FirestoreEnquiryRepository();
