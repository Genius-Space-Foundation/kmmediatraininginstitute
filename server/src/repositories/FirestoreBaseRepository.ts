/**
 * Firestore Base Repository
 *
 * This abstract base class provides common Firestore operations
 * for all repository implementations.
 */

import { FirestoreUtils } from "../database/firestore";
import { logger } from "../utils/logger";
import { DatabaseError, NotFoundError } from "../utils/errors";

export abstract class FirestoreBaseRepository {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Get a single document by ID
   */
  async findById<T>(id: string): Promise<T | null> {
    try {
      const doc = await FirestoreUtils.getDocument(
        this.collectionName,
        id
      ).get();

      if (!doc.exists) {
        return null;
      }

      return FirestoreUtils.docToObject(doc) as T;
    } catch (error) {
      logger.error(
        `Error finding document by ID: ${this.collectionName}/${id}`,
        error
      );
      throw new DatabaseError("Failed to retrieve document");
    }
  }

  /**
   * Get all documents in a collection
   */
  protected async findAll<T>(
    limit?: number,
    startAfter?: FirebaseFirestore.DocumentSnapshot
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = FirestoreUtils.getCollection(
        this.collectionName
      );

      if (limit) {
        query = query.limit(limit);
      }

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => FirestoreUtils.docToObject(doc) as T);
    } catch (error) {
      logger.error(
        `Error finding all documents: ${this.collectionName}`,
        error
      );
      throw new DatabaseError("Failed to retrieve documents");
    }
  }

  /**
   * Find documents by field value
   */
  protected async findByField<T>(
    field: string,
    value: any,
    limit?: number
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = FirestoreUtils.getCollection(
        this.collectionName
      ).where(field, "==", value);

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => FirestoreUtils.docToObject(doc) as T);
    } catch (error) {
      logger.error(
        `Error finding documents by field: ${this.collectionName}/${field}`,
        error
      );
      throw new DatabaseError("Failed to retrieve documents");
    }
  }

  /**
   * Find documents by multiple field values
   */
  protected async findByFields<T>(
    conditions: Record<string, any>,
    limit?: number
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = FirestoreUtils.getCollection(
        this.collectionName
      );

      Object.entries(conditions).forEach(([field, value]) => {
        query = query.where(field, "==", value);
      });

      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => FirestoreUtils.docToObject(doc) as T);
    } catch (error) {
      logger.error(
        `Error finding documents by fields: ${this.collectionName}`,
        error
      );
      throw new DatabaseError("Failed to retrieve documents");
    }
  }

  /**
   * Create a new document
   */
  async create<T>(
    data: Omit<T, "id" | "createdAt" | "updatedAt">,
    customId?: string
  ): Promise<T> {
    try {
      const docRef = customId
        ? FirestoreUtils.getDocument(this.collectionName, customId)
        : FirestoreUtils.getCollection(this.collectionName).doc();

      const docData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await docRef.set(docData);

      const createdDoc = await docRef.get();
      return FirestoreUtils.docToObject(createdDoc) as T;
    } catch (error) {
      logger.error(`Error creating document: ${this.collectionName}`, error);
      throw new DatabaseError("Failed to create document");
    }
  }

  /**
   * Update a document
   */
  async update<T>(id: string, data: Partial<T>): Promise<T> {
    try {
      const docRef = FirestoreUtils.getDocument(this.collectionName, id);

      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new NotFoundError("Document not found");
      }

      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await docRef.update(updateData);

      const updatedDoc = await docRef.get();
      return FirestoreUtils.docToObject(updatedDoc) as T;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(
        `Error updating document: ${this.collectionName}/${id}`,
        error
      );
      throw new DatabaseError("Failed to update document");
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = FirestoreUtils.getDocument(this.collectionName, id);

      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        throw new NotFoundError("Document not found");
      }

      await docRef.delete();
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      logger.error(
        `Error deleting document: ${this.collectionName}/${id}`,
        error
      );
      throw new DatabaseError("Failed to delete document");
    }
  }

  /**
   * Check if a document exists
   */
  protected async exists(id: string): Promise<boolean> {
    try {
      return await FirestoreUtils.documentExists(this.collectionName, id);
    } catch (error) {
      logger.error(
        `Error checking document existence: ${this.collectionName}/${id}`,
        error
      );
      return false;
    }
  }

  /**
   * Count documents in collection
   */
  protected async count(): Promise<number> {
    try {
      return await FirestoreUtils.getCollectionCount(this.collectionName);
    } catch (error) {
      logger.error(`Error counting documents: ${this.collectionName}`, error);
      return 0;
    }
  }

  /**
   * Count documents with field condition
   */
  protected async countByField(field: string, value: any): Promise<number> {
    try {
      const query = FirestoreUtils.getCollection(this.collectionName).where(
        field,
        "==",
        value
      );
      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      logger.error(
        `Error counting documents by field: ${this.collectionName}/${field}`,
        error
      );
      return 0;
    }
  }

  /**
   * Get paginated results
   */
  protected async getPaginated<T>(
    page: number = 1,
    limit: number = 10,
    orderBy?: string,
    orderDirection: "asc" | "desc" = "desc"
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    try {
      let query: FirebaseFirestore.Query = FirestoreUtils.getCollection(
        this.collectionName
      );

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy, orderDirection);
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const totalSnapshot = await FirestoreUtils.getCollection(
        this.collectionName
      ).get();
      const total = totalSnapshot.size;

      // Get paginated data
      query = query.limit(limit);

      if (offset > 0) {
        // Get the document to start after
        const offsetQuery = FirestoreUtils.getCollection(this.collectionName);
        if (orderBy) {
          offsetQuery.orderBy(orderBy, orderDirection);
        }
        const offsetSnapshot = await offsetQuery.limit(offset).get();
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];

        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();
      const data = snapshot.docs.map(
        (doc) => FirestoreUtils.docToObject(doc) as T
      );

      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;

      return {
        data,
        total,
        page,
        totalPages,
        hasMore,
      };
    } catch (error) {
      logger.error(
        `Error getting paginated results: ${this.collectionName}`,
        error
      );
      throw new DatabaseError("Failed to retrieve paginated results");
    }
  }

  /**
   * Search documents with multiple conditions
   */
  protected async search<T>(
    searchConditions: Array<{
      field: string;
      operator: FirebaseFirestore.WhereFilterOp;
      value: any;
    }>,
    limit?: number,
    orderBy?: string,
    orderDirection: "asc" | "desc" = "desc"
  ): Promise<T[]> {
    try {
      let query: FirebaseFirestore.Query = FirestoreUtils.getCollection(
        this.collectionName
      );

      // Apply search conditions
      searchConditions.forEach((condition) => {
        query = query.where(
          condition.field,
          condition.operator,
          condition.value
        );
      });

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy, orderDirection);
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => FirestoreUtils.docToObject(doc) as T);
    } catch (error) {
      logger.error(`Error searching documents: ${this.collectionName}`, error);
      throw new DatabaseError("Failed to search documents");
    }
  }

  /**
   * Update multiple documents
   */
  protected async updateMultiple(
    updates: Array<{ id: string; data: any }>
  ): Promise<void> {
    try {
      await FirestoreUtils.updateMultipleDocuments(
        this.collectionName,
        updates
      );
    } catch (error) {
      logger.error(
        `Error updating multiple documents: ${this.collectionName}`,
        error
      );
      throw new DatabaseError("Failed to update documents");
    }
  }

  /**
   * Delete multiple documents
   */
  protected async deleteMultiple(ids: string[]): Promise<void> {
    try {
      await FirestoreUtils.deleteMultipleDocuments(this.collectionName, ids);
    } catch (error) {
      logger.error(
        `Error deleting multiple documents: ${this.collectionName}`,
        error
      );
      throw new DatabaseError("Failed to delete documents");
    }
  }
}
