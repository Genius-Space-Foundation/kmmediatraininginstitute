/**
 * Firestore Service
 *
 * This service provides a clean interface for Firestore operations
 * in the React frontend application.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface FirestoreDocument {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
}

export interface QueryOptions {
  field: string;
  operator:
    | "=="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">="
    | "array-contains"
    | "array-contains-any"
    | "in"
    | "not-in";
  value: any;
}

export class FirestoreService {
  /**
   * Get a single document by ID
   */
  static async getDocument<T extends FirestoreDocument>(
    collectionName: string,
    docId: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertDocument<T>(docSnap);
      }

      return null;
    } catch (error) {
      console.error(
        `Error getting document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all documents in a collection
   */
  static async getCollection<T extends FirestoreDocument>(
    collectionName: string,
    options?: PaginationOptions
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    try {
      let q = query(collection(db, collectionName));

      if (options?.orderByField) {
        q = query(
          q,
          orderBy(options.orderByField, options.orderDirection || "desc")
        );
      }

      if (options?.pageSize) {
        q = query(q, limit(options.pageSize + 1)); // Get one extra to check if there are more
      }

      if (options?.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => this.convertDocument<T>(doc));

      // Check if there are more documents
      const hasMore = options?.pageSize
        ? docs.length > options.pageSize
        : false;
      const data = hasMore ? docs.slice(0, -1) : docs; // Remove the extra document
      const lastDoc =
        data.length > 0 ? snapshot.docs[data.length - 1] : undefined;

      return { data, lastDoc, hasMore };
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Query documents with conditions
   */
  static async queryDocuments<T extends FirestoreDocument>(
    collectionName: string,
    conditions: QueryOptions[],
    options?: PaginationOptions
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    try {
      let q = query(collection(db, collectionName));

      // Apply conditions
      conditions.forEach((condition) => {
        q = query(
          q,
          where(condition.field, condition.operator, condition.value)
        );
      });

      if (options?.orderByField) {
        q = query(
          q,
          orderBy(options.orderByField, options.orderDirection || "desc")
        );
      }

      if (options?.pageSize) {
        q = query(q, limit(options.pageSize + 1));
      }

      if (options?.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => this.convertDocument<T>(doc));

      const hasMore = options?.pageSize
        ? docs.length > options.pageSize
        : false;
      const data = hasMore ? docs.slice(0, -1) : docs;
      const lastDoc =
        data.length > 0 ? snapshot.docs[data.length - 1] : undefined;

      return { data, lastDoc, hasMore };
    } catch (error) {
      console.error(`Error querying collection ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  static async createDocument<T extends FirestoreDocument>(
    collectionName: string,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const createdDoc = await getDoc(docRef);
      return this.convertDocument<T>(createdDoc);
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  static async updateDocument<T extends FirestoreDocument>(
    collectionName: string,
    docId: string,
    data: Partial<Omit<T, "id" | "createdAt">>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(
        `Error updating document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(
    collectionName: string,
    docId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(
        `Error deleting document ${collectionName}/${docId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for a single document
   */
  static subscribeToDocument<T extends FirestoreDocument>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
  ): Unsubscribe {
    const docRef = doc(db, collectionName, docId);

    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback(this.convertDocument<T>(doc));
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(
          `Error in document subscription ${collectionName}/${docId}:`,
          error
        );
        callback(null);
      }
    );
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  static subscribeToCollection<T extends FirestoreDocument>(
    collectionName: string,
    conditions: QueryOptions[],
    callback: (data: T[]) => void,
    options?: {
      orderByField?: string;
      orderDirection?: "asc" | "desc";
      limitCount?: number;
    }
  ): Unsubscribe {
    try {
      let q = query(collection(db, collectionName));

      // Apply conditions
      conditions.forEach((condition) => {
        q = query(
          q,
          where(condition.field, condition.operator, condition.value)
        );
      });

      if (options?.orderByField) {
        q = query(
          q,
          orderBy(options.orderByField, options.orderDirection || "desc")
        );
      }

      if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      return onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => this.convertDocument<T>(doc));
          callback(docs);
        },
        (error) => {
          console.error(
            `Error in collection subscription ${collectionName}:`,
            error
          );
          callback([]);
        }
      );
    } catch (error) {
      console.error(
        `Error setting up collection subscription ${collectionName}:`,
        error
      );
      return () => {}; // Return empty unsubscribe function
    }
  }

  /**
   * Get a subcollection
   */
  static async getSubcollection<T extends FirestoreDocument>(
    parentCollection: string,
    parentId: string,
    subcollectionName: string,
    options?: PaginationOptions
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot; hasMore: boolean }> {
    try {
      let q = query(
        collection(db, parentCollection, parentId, subcollectionName)
      );

      if (options?.orderByField) {
        q = query(
          q,
          orderBy(options.orderByField, options.orderDirection || "desc")
        );
      }

      if (options?.pageSize) {
        q = query(q, limit(options.pageSize + 1));
      }

      if (options?.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => this.convertDocument<T>(doc));

      const hasMore = options?.pageSize
        ? docs.length > options.pageSize
        : false;
      const data = hasMore ? docs.slice(0, -1) : docs;
      const lastDoc =
        data.length > 0 ? snapshot.docs[data.length - 1] : undefined;

      return { data, lastDoc, hasMore };
    } catch (error) {
      console.error(
        `Error getting subcollection ${parentCollection}/${parentId}/${subcollectionName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to subcollection updates
   */
  static subscribeToSubcollection<T extends FirestoreDocument>(
    parentCollection: string,
    parentId: string,
    subcollectionName: string,
    callback: (data: T[]) => void,
    options?: {
      orderByField?: string;
      orderDirection?: "asc" | "desc";
      limitCount?: number;
    }
  ): Unsubscribe {
    try {
      let q = query(
        collection(db, parentCollection, parentId, subcollectionName)
      );

      if (options?.orderByField) {
        q = query(
          q,
          orderBy(options.orderByField, options.orderDirection || "desc")
        );
      }

      if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      return onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => this.convertDocument<T>(doc));
          callback(docs);
        },
        (error) => {
          console.error(
            `Error in subcollection subscription ${parentCollection}/${parentId}/${subcollectionName}:`,
            error
          );
          callback([]);
        }
      );
    } catch (error) {
      console.error(
        `Error setting up subcollection subscription ${parentCollection}/${parentId}/${subcollectionName}:`,
        error
      );
      return () => {};
    }
  }

  /**
   * Batch write operations
   */
  static async batchWrite(
    operations: Array<{
      type: "create" | "update" | "delete";
      collection: string;
      docId?: string;
      data?: any;
    }>
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      operations.forEach((op) => {
        if (op.type === "create") {
          const docRef = doc(collection(db, op.collection));
          batch.set(docRef, {
            ...op.data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else if (op.type === "update" && op.docId) {
          const docRef = doc(db, op.collection, op.docId);
          batch.update(docRef, {
            ...op.data,
            updatedAt: serverTimestamp(),
          });
        } else if (op.type === "delete" && op.docId) {
          const docRef = doc(db, op.collection, op.docId);
          batch.delete(docRef);
        }
      });

      await batch.commit();
    } catch (error) {
      console.error("Error in batch write:", error);
      throw error;
    }
  }

  /**
   * Run a transaction
   */
  static async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    try {
      return await runTransaction(db, updateFunction);
    } catch (error) {
      console.error("Error in transaction:", error);
      throw error;
    }
  }

  /**
   * Convert Firestore document to plain object
   */
  private static convertDocument<T extends FirestoreDocument>(
    doc: DocumentSnapshot
  ): T {
    const data = doc.data();
    if (!data) {
      throw new Error("Document has no data");
    }

    // Convert Firestore Timestamps to ISO strings
    const convertedData = this.convertTimestamps(data);

    return {
      id: doc.id,
      ...convertedData,
    } as T;
  }

  /**
   * Convert Firestore Timestamps to ISO strings recursively
   */
  private static convertTimestamps(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Timestamp) {
      return obj.toDate().toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertTimestamps(item));
    }

    if (typeof obj === "object") {
      const converted: any = {};
      Object.keys(obj).forEach((key) => {
        converted[key] = this.convertTimestamps(obj[key]);
      });
      return converted;
    }

    return obj;
  }
}

export default FirestoreService;


