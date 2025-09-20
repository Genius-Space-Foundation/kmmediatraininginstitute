/**
 * Firestore Service
 *
 * A comprehensive service for interacting with Google Cloud Firestore.
 * Provides CRUD operations, queries, real-time subscriptions, and pagination.
 */

import admin from "firebase-admin";
import { logger } from "../utils/logger";

// Initialize Firestore if not already initialized
let db: admin.firestore.Firestore;

try {
  if (!admin.apps.length) {
    // Service account configuration
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || "",
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
      private_key:
        process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",
      client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
      client_id: process.env.FIREBASE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
        process.env.FIREBASE_CLIENT_EMAIL || ""
      )}`,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  db = admin.firestore();
  logger.info("Firestore service initialized successfully");
} catch (error) {
  logger.error("Failed to initialize Firestore service:", error);
  throw error;
}

// Type definitions
export type FirestoreOperator =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "in"
  | "not-in"
  | "array-contains"
  | "array-contains-any";

export interface QueryOptions {
  field: string;
  operator: FirestoreOperator;
  value: any;
}

export interface PaginationOptions {
  limit?: number;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  startAfter?: any;
}

export interface FirestoreResult<T> {
  data: T[];
  lastDoc?: any;
  hasMore: boolean;
}

export interface FirestoreDocument<T> {
  id: string;
  data: T;
}

export class FirestoreService {
  /**
   * Create a new document
   */
  static async createDocument<T extends Record<string, any>>(
    collection: string,
    data: T,
    documentId?: string
  ): Promise<string> {
    try {
      const docRef = documentId
        ? db.collection(collection).doc(documentId)
        : db.collection(collection).doc();

      const docData = {
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.set(docData);

      logger.info(`Document created in ${collection}`, { id: docRef.id });
      return docRef.id;
    } catch (error) {
      logger.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   */
  static async getDocument<T>(
    collection: string,
    documentId: string
  ): Promise<FirestoreDocument<T> | null> {
    try {
      const docRef = db.collection(collection).doc(documentId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        data: doc.data() as T,
      };
    } catch (error) {
      logger.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  static async updateDocument<T extends Record<string, any>>(
    collection: string,
    documentId: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = db.collection(collection).doc(documentId);

      const updateData = {
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await docRef.update(updateData);

      logger.info(`Document updated in ${collection}`, { id: documentId });
    } catch (error) {
      logger.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(
    collection: string,
    documentId: string
  ): Promise<void> {
    try {
      await db.collection(collection).doc(documentId).delete();
      logger.info(`Document deleted from ${collection}`, { id: documentId });
    } catch (error) {
      logger.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Query documents with conditions and pagination
   */
  static async queryDocuments<T>(
    collection: string,
    conditions: QueryOptions[] = [],
    pagination: PaginationOptions = {}
  ): Promise<FirestoreResult<T>> {
    try {
      let query: admin.firestore.Query = db.collection(collection);

      // Apply conditions
      for (const condition of conditions) {
        query = query.where(
          condition.field,
          condition.operator,
          condition.value
        );
      }

      // Apply ordering
      if (pagination.orderByField) {
        query = query.orderBy(
          pagination.orderByField,
          pagination.orderDirection || "asc"
        );
      }

      // Apply pagination
      if (pagination.startAfter) {
        query = query.startAfter(pagination.startAfter);
      }

      if (pagination.limit) {
        query = query.limit(pagination.limit + 1); // Get one extra to check if there are more
      }

      const snapshot = await query.get();
      const documents: FirestoreDocument<T>[] = [];

      snapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          data: doc.data() as T,
        });
      });

      // Check if there are more documents
      const hasMore = pagination.limit
        ? documents.length > pagination.limit
        : false;
      const data = hasMore ? documents.slice(0, -1) : documents;
      const lastDoc = data.length > 0 ? data[data.length - 1] : null;

      return {
        data: data.map((doc) => doc.data),
        lastDoc,
        hasMore,
      };
    } catch (error) {
      logger.error(`Error querying documents from ${collection}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   */
  static async getAllDocuments<T>(
    collection: string,
    pagination: PaginationOptions = {}
  ): Promise<FirestoreResult<T>> {
    return this.queryDocuments<T>(collection, [], pagination);
  }

  /**
   * Subscribe to real-time updates
   */
  static subscribeToCollection<T>(
    collection: string,
    conditions: QueryOptions[] = [],
    callback: (docs: FirestoreDocument<T>[]) => void,
    pagination: PaginationOptions = {}
  ): () => void {
    try {
      let query: admin.firestore.Query = db.collection(collection);

      // Apply conditions
      for (const condition of conditions) {
        query = query.where(
          condition.field,
          condition.operator,
          condition.value
        );
      }

      // Apply ordering
      if (pagination.orderByField) {
        query = query.orderBy(
          pagination.orderByField,
          pagination.orderDirection || "asc"
        );
      }

      // Apply pagination
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }

      const unsubscribe = query.onSnapshot(
        (snapshot) => {
          const documents: FirestoreDocument<T>[] = [];
          snapshot.forEach((doc) => {
            documents.push({
              id: doc.id,
              data: doc.data() as T,
            });
          });
          callback(documents);
        },
        (error) => {
          logger.error(
            `Error in real-time subscription for ${collection}:`,
            error
          );
        }
      );

      return unsubscribe;
    } catch (error) {
      logger.error(
        `Error setting up real-time subscription for ${collection}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Batch operations
   */
  static async batchWrite(
    operations: Array<{
      type: "create" | "update" | "delete";
      collection: string;
      documentId: string;
      data?: any;
    }>
  ): Promise<void> {
    const batch = db.batch();

    for (const operation of operations) {
      const docRef = db
        .collection(operation.collection)
        .doc(operation.documentId);

      switch (operation.type) {
        case "create":
          batch.set(docRef, {
            ...operation.data,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          break;
        case "update":
          batch.update(docRef, {
            ...operation.data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          break;
        case "delete":
          batch.delete(docRef);
          break;
      }
    }

    await batch.commit();
    logger.info(`Batch operation completed: ${operations.length} operations`);
  }

  /**
   * Transaction operations
   */
  static async runTransaction<T>(
    updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>
  ): Promise<T> {
    return db.runTransaction(updateFunction);
  }

  /**
   * Get collection reference
   */
  static getCollection(
    collection: string
  ): admin.firestore.CollectionReference {
    return db.collection(collection);
  }

  /**
   * Get document reference
   */
  static getDocumentRef(
    collection: string,
    documentId: string
  ): admin.firestore.DocumentReference {
    return db.collection(collection).doc(documentId);
  }
}

export default FirestoreService;
