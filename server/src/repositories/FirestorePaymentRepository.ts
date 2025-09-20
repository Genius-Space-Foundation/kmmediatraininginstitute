/**
 * Firestore Payment Repository
 *
 * This repository handles all payment-related database operations using Firestore.
 */

import { FirestoreBaseRepository } from "./FirestoreBaseRepository";
import { FirestoreUtils } from "../database/firestore";
import { PaymentRecord } from "../types";
import { PaginationParams } from "../types/dtos";

export interface FirestorePaymentRecord extends PaymentRecord {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  reference?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
  // Additional fields for Firestore
  userEmail?: string;
  userName?: string;
  courseName?: string;
  coursePrice?: number;
}

export class FirestorePaymentRepository extends FirestoreBaseRepository {
  constructor() {
    super("payments");
  }

  /**
   * Find payment by ID with related data
   */
  async findByIdWithDetails(
    id: string
  ): Promise<FirestorePaymentRecord | null> {
    try {
      const payment = await this.findById<FirestorePaymentRecord>(id);
      if (!payment) return null;

      // Get user details
      try {
        const userDoc = await FirestoreUtils.getDocument(
          "users",
          payment.userId
        ).get();
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          payment.userEmail = userData.email;
          payment.userName = `${userData.firstName} ${userData.lastName}`;
        }
      } catch (error) {
        console.warn("Could not fetch user data:", error);
      }

      // Get course details
      try {
        const courseDoc = await FirestoreUtils.getDocument(
          "courses",
          payment.courseId
        ).get();
        if (courseDoc.exists) {
          const courseData = courseDoc.data()!;
          payment.courseName = courseData.name;
          payment.coursePrice = courseData.price;
        }
      } catch (error) {
        console.warn("Could not fetch course data:", error);
      }

      return payment;
    } catch (error) {
      console.error("Error finding payment by ID:", error);
      throw error;
    }
  }

  /**
   * Find payments by user ID
   */
  async findByUserId(
    userId: string,
    pagination?: PaginationParams
  ): Promise<FirestorePaymentRecord[]> {
    try {
      const searchConditions = [
        {
          field: "userId",
          operator: "==" as const,
          value: userId,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const payments = await this.search<FirestorePaymentRecord>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with course details
      for (const payment of payments) {
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            payment.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            payment.courseName = courseData.name;
            payment.coursePrice = courseData.price;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return payments;
    } catch (error) {
      console.error("Error finding payments by user ID:", error);
      throw error;
    }
  }

  /**
   * Find payments by course ID
   */
  async findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<FirestorePaymentRecord[]> {
    try {
      const searchConditions = [
        {
          field: "courseId",
          operator: "==" as const,
          value: courseId,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const payments = await this.search<FirestorePaymentRecord>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with user details
      for (const payment of payments) {
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            payment.userId
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            payment.userEmail = userData.email;
            payment.userName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }
      }

      return payments;
    } catch (error) {
      console.error("Error finding payments by course ID:", error);
      throw error;
    }
  }

  /**
   * Find payments by status
   */
  async findByStatus(
    status: string,
    pagination?: PaginationParams
  ): Promise<FirestorePaymentRecord[]> {
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

      const payments = await this.search<FirestorePaymentRecord>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with related data
      for (const payment of payments) {
        // Get user details
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            payment.userId
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            payment.userEmail = userData.email;
            payment.userName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            payment.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            payment.courseName = courseData.name;
            payment.coursePrice = courseData.price;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return payments;
    } catch (error) {
      console.error("Error finding payments by status:", error);
      throw error;
    }
  }

  /**
   * Find payment by transaction ID
   */
  async findByTransactionId(
    transactionId: string
  ): Promise<FirestorePaymentRecord | null> {
    try {
      const searchConditions = [
        {
          field: "transactionId",
          operator: "==" as const,
          value: transactionId,
        },
      ];

      const payments = await this.search<FirestorePaymentRecord>(
        searchConditions,
        1
      );
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      console.error("Error finding payment by transaction ID:", error);
      throw error;
    }
  }

  /**
   * Find payment by reference
   */
  async findByReference(
    reference: string
  ): Promise<FirestorePaymentRecord | null> {
    try {
      const searchConditions = [
        {
          field: "reference",
          operator: "==" as const,
          value: reference,
        },
      ];

      const payments = await this.search<FirestorePaymentRecord>(
        searchConditions,
        1
      );
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      console.error("Error finding payment by reference:", error);
      throw error;
    }
  }

  /**
   * Create a new payment record
   */
  async createPayment(paymentData: {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    transactionId?: string;
    reference?: string;
    gatewayResponse?: any;
  }): Promise<FirestorePaymentRecord> {
    return super.create(paymentData);
  }

  /**
   * Update payment record
   */
  async updatePayment(
    id: string,
    updates: Partial<FirestorePaymentRecord>
  ): Promise<FirestorePaymentRecord> {
    return super.update(id, updates);
  }

  /**
   * Update payment status
   */
  async updateStatus(
    paymentId: string,
    status: string
  ): Promise<FirestorePaymentRecord> {
    return super.update(paymentId, { status });
  }

  /**
   * Delete payment record
   */
  async deletePayment(id: string): Promise<boolean> {
    try {
      await super.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      return false;
    }
  }

  /**
   * Count payments by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.countByField("status", status);
  }

  /**
   * Get payment statistics
   */
  async getStats(): Promise<{
    total: number;
    successful: number;
    pending: number;
    failed: number;
    totalAmount: number;
    successfulAmount: number;
  }> {
    try {
      const total = await this.count();
      const successful = await this.countByField("status", "success");
      const pending = await this.countByField("status", "pending");
      const failed = await this.countByField("status", "failed");

      // Get all payments for amount calculations
      const allPayments = await this.findAll<FirestorePaymentRecord>();

      const totalAmount = allPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const successfulAmount = allPayments
        .filter((payment) => payment.status === "success")
        .reduce((sum, payment) => sum + payment.amount, 0);

      return {
        total,
        successful,
        pending,
        failed,
        totalAmount,
        successfulAmount,
      };
    } catch (error) {
      console.error("Error getting payment stats:", error);
      return {
        total: 0,
        successful: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0,
        successfulAmount: 0,
      };
    }
  }

  /**
   * Get payments by date range
   */
  async findByDateRange(
    startDate: string,
    endDate: string,
    pagination?: PaginationParams
  ): Promise<FirestorePaymentRecord[]> {
    try {
      const searchConditions = [
        {
          field: "createdAt",
          operator: ">=" as const,
          value: startDate,
        },
        {
          field: "createdAt",
          operator: "<=" as const,
          value: endDate,
        },
      ];

      const limit = pagination?.limit || 10;
      const orderBy = pagination?.sort || "createdAt";
      const orderDirection = (pagination?.order || "desc") as "asc" | "desc";

      const payments = await this.search<FirestorePaymentRecord>(
        searchConditions,
        limit,
        orderBy,
        orderDirection
      );

      // Enrich with related data
      for (const payment of payments) {
        // Get user details
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            payment.userId
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            payment.userEmail = userData.email;
            payment.userName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            payment.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            payment.courseName = courseData.name;
            payment.coursePrice = courseData.price;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return payments;
    } catch (error) {
      console.error("Error finding payments by date range:", error);
      throw error;
    }
  }

  /**
   * Get recent payments
   */
  async getRecentPayments(
    limit: number = 10
  ): Promise<FirestorePaymentRecord[]> {
    try {
      const payments = await this.getPaginated<FirestorePaymentRecord>(
        1,
        limit,
        "createdAt",
        "desc"
      );

      // Enrich with related data
      for (const payment of payments.data) {
        // Get user details
        try {
          const userDoc = await FirestoreUtils.getDocument(
            "users",
            payment.userId
          ).get();
          if (userDoc.exists) {
            const userData = userDoc.data()!;
            payment.userEmail = userData.email;
            payment.userName = `${userData.firstName} ${userData.lastName}`;
          }
        } catch (error) {
          console.warn("Could not fetch user data:", error);
        }

        // Get course details
        try {
          const courseDoc = await FirestoreUtils.getDocument(
            "courses",
            payment.courseId
          ).get();
          if (courseDoc.exists) {
            const courseData = courseDoc.data()!;
            payment.courseName = courseData.name;
            payment.coursePrice = courseData.price;
          }
        } catch (error) {
          console.warn("Could not fetch course data:", error);
        }
      }

      return payments.data;
    } catch (error) {
      console.error("Error getting recent payments:", error);
      return [];
    }
  }

  /**
   * Get user payment summary
   */
  async getUserPaymentSummary(userId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    successfulAmount: number;
    pendingPayments: number;
    failedPayments: number;
  }> {
    try {
      const userPayments = await this.findByUserId(userId);

      const totalPayments = userPayments.length;
      const totalAmount = userPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      const successfulPayments = userPayments.filter(
        (payment) => payment.status === "success"
      ).length;
      const successfulAmount = userPayments
        .filter((payment) => payment.status === "success")
        .reduce((sum, payment) => sum + payment.amount, 0);

      const pendingPayments = userPayments.filter(
        (payment) => payment.status === "pending"
      ).length;
      const failedPayments = userPayments.filter(
        (payment) => payment.status === "failed"
      ).length;

      return {
        totalPayments,
        totalAmount,
        successfulPayments,
        successfulAmount,
        pendingPayments,
        failedPayments,
      };
    } catch (error) {
      console.error("Error getting user payment summary:", error);
      return {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        successfulAmount: 0,
        pendingPayments: 0,
        failedPayments: 0,
      };
    }
  }
}

export const firestorePaymentRepository = new FirestorePaymentRepository();
