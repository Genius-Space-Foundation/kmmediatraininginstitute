/**
 * Firestore Database Configuration and Utilities
 *
 * This module provides the Firestore database connection and utility functions
 * for the migrated application.
 */

import admin from "firebase-admin";
import { config } from "../config";
import { logger } from "../utils/logger";

// Initialize Firebase Admin SDK
let app: admin.app.App;
let db: admin.firestore.Firestore;

export const initializeFirestore = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      // Initialize with service account or default credentials
      if (config.firebase.serviceAccountPath) {
        const serviceAccount = require(config.firebase.serviceAccountPath);
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: config.firebase.projectId,
        });
      } else {
        // Use default credentials (for Google Cloud environments)
        app = admin.initializeApp({
          projectId: config.firebase.projectId,
        });
      }
    } else {
      app = admin.app();
    }

    db = admin.firestore();

    // Configure Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });

    logger.info("Firestore initialized successfully");
    return db;
  } catch (error) {
    logger.error("Failed to initialize Firestore:", error);
    throw error;
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error(
      "Firestore not initialized. Call initializeFirestore() first."
    );
  }
  return db;
};

export const getAuth = (): admin.auth.Auth => {
  if (!app) {
    throw new Error(
      "Firebase app not initialized. Call initializeFirestore() first."
    );
  }
  return admin.auth();
};

// Utility functions for Firestore operations
export class FirestoreUtils {
  static get db() {
    return getFirestore();
  }

  /**
   * Convert Firestore document to plain object with proper timestamp handling
   */
  static docToObject(doc: admin.firestore.DocumentSnapshot): any {
    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    const result: any = { id: doc.id };

    // Convert Firestore Timestamps to ISO strings
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof admin.firestore.Timestamp) {
        result[key] = value.toDate().toISOString();
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        // Handle nested objects with timestamps
        result[key] = this.convertTimestampsInObject(value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * Convert all Firestore Timestamps in an object to ISO strings
   */
  static convertTimestampsInObject(obj: any): any {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertTimestampsInObject(item));
    }

    const result: any = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value instanceof admin.firestore.Timestamp) {
        result[key] = value.toDate().toISOString();
      } else if (value && typeof value === "object") {
        result[key] = this.convertTimestampsInObject(value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  /**
   * Convert ISO date strings to Firestore Timestamps
   */
  static convertToTimestamp(dateString: string): admin.firestore.Timestamp {
    return admin.firestore.Timestamp.fromDate(new Date(dateString));
  }

  /**
   * Create a batch write operation
   */
  static createBatch() {
    return this.db.batch();
  }

  /**
   * Execute batch write with error handling
   */
  static async executeBatch(batch: admin.firestore.WriteBatch) {
    try {
      await batch.commit();
      logger.info("Batch write completed successfully");
    } catch (error) {
      logger.error("Batch write failed:", error);
      throw error;
    }
  }

  /**
   * Get a collection reference
   */
  static getCollection(
    collectionName: string
  ): admin.firestore.CollectionReference {
    return this.db.collection(collectionName);
  }

  /**
   * Get a document reference
   */
  static getDocument(
    collectionName: string,
    docId: string
  ): admin.firestore.DocumentReference {
    return this.db.collection(collectionName).doc(docId);
  }

  /**
   * Get a subcollection reference
   */
  static getSubcollection(
    parentCollection: string,
    parentId: string,
    subcollectionName: string
  ): admin.firestore.CollectionReference {
    return this.db
      .collection(parentCollection)
      .doc(parentId)
      .collection(subcollectionName);
  }

  /**
   * Create a query with pagination
   */
  static createPaginatedQuery(
    collection: admin.firestore.CollectionReference,
    limit: number = 10,
    startAfter?: admin.firestore.DocumentSnapshot
  ): admin.firestore.Query {
    let query = collection.limit(limit);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    return query;
  }

  /**
   * Execute a paginated query
   */
  static async executePaginatedQuery(
    query: admin.firestore.Query,
    limit?: number
  ): Promise<{
    docs: any[];
    lastDoc: admin.firestore.DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    try {
      const snapshot = await query.get();
      const docs = snapshot.docs.map((doc) => this.docToObject(doc));
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      const hasMore = limit ? snapshot.docs.length === limit : false;

      return { docs, lastDoc, hasMore };
    } catch (error) {
      logger.error("Paginated query failed:", error);
      throw error;
    }
  }

  /**
   * Generate a new document ID
   */
  static generateId(): string {
    return this.db.collection("_temp").doc().id;
  }

  /**
   * Check if a document exists
   */
  static async documentExists(
    collectionName: string,
    docId: string
  ): Promise<boolean> {
    try {
      const doc = await this.getDocument(collectionName, docId).get();
      return doc.exists;
    } catch (error) {
      logger.error(
        `Error checking document existence: ${collectionName}/${docId}`,
        error
      );
      return false;
    }
  }

  /**
   * Get document count for a collection
   */
  static async getCollectionCount(collectionName: string): Promise<number> {
    try {
      const snapshot = await this.getCollection(collectionName).get();
      return snapshot.size;
    } catch (error) {
      logger.error(`Error getting collection count: ${collectionName}`, error);
      return 0;
    }
  }

  /**
   * Search documents with text matching
   */
  static async searchDocuments(
    collectionName: string,
    searchField: string,
    searchTerm: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      const collection = this.getCollection(collectionName);

      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia or similar for production
      const query = collection
        .where(searchField, ">=", searchTerm)
        .where(searchField, "<=", searchTerm + "\uf8ff")
        .limit(limit);

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => this.docToObject(doc));
    } catch (error) {
      logger.error(`Search failed for ${collectionName}:`, error);
      return [];
    }
  }

  /**
   * Update multiple documents in a collection
   */
  static async updateMultipleDocuments(
    collectionName: string,
    updates: Array<{ id: string; data: any }>
  ): Promise<void> {
    const batch = this.createBatch();

    updates.forEach(({ id, data }) => {
      const docRef = this.getDocument(collectionName, id);
      batch.update(docRef, {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await this.executeBatch(batch);
  }

  /**
   * Delete multiple documents
   */
  static async deleteMultipleDocuments(
    collectionName: string,
    docIds: string[]
  ): Promise<void> {
    const batch = this.createBatch();

    docIds.forEach((id) => {
      const docRef = this.getDocument(collectionName, id);
      batch.delete(docRef);
    });

    await this.executeBatch(batch);
  }

  /**
   * Create a transaction
   */
  static async runTransaction<T>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
  ): Promise<T> {
    try {
      return await this.db.runTransaction(updateFunction);
    } catch (error) {
      logger.error("Transaction failed:", error);
      throw error;
    }
  }
}

export { admin };
export default db!;
