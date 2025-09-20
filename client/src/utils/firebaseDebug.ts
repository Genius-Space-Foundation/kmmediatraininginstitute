/**
 * Firebase Debug Utilities
 * Helper functions to debug Firebase/Firestore connection and data
 */

import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export const firebaseDebug = {
  /**
   * Test basic Firestore connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to write a test document
      const testRef = await addDoc(collection(db, "connection-test"), {
        timestamp: new Date(),
        message: "Connection test successful",
      });

      // Clean up the test document
      await deleteDoc(doc(db, "connection-test", testRef.id));

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * List all collections and their document counts
   */
  async listCollections(): Promise<{ [collectionName: string]: number }> {
    const collections = [
      "users",
      "courses",
      "registrations",
      "payments",
      "assignments",
      "stories",
      "test",
    ];

    const result: { [collectionName: string]: number } = {};

    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        result[collectionName] = snapshot.size;
      } catch (error) {
        result[collectionName] = 0;
      }
    }

    return result;
  },

  /**
   * Get sample documents from a collection
   */
  async getSampleDocuments(
    collectionName: string,
    limit: number = 3
  ): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const docs = snapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      return docs;
    } catch (error) {
      console.error(
        `Error getting sample documents from ${collectionName}:`,
        error
      );
      return [];
    }
  },

  /**
   * Create sample data for testing
   */
  async createSampleData(): Promise<{ success: boolean; error?: string }> {
    try {
      // Create sample user
      await addDoc(collection(db, "users"), {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create sample course
      await addDoc(collection(db, "courses"), {
        title: "Sample Course",
        description: "This is a test course for debugging",
        instructor: "Test Instructor",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

export default firebaseDebug;

