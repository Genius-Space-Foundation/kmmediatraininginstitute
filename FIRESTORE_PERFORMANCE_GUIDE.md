# Firestore Performance & Cost Optimization Guide

## Overview

This guide provides comprehensive strategies for optimizing Firestore performance and minimizing costs in your KM Media learning platform.

## 1. Data Structure Optimization

### Denormalization Strategies

#### User Data in Related Documents

```typescript
// Instead of storing only user ID, denormalize essential user data
interface CourseRegistration {
  userId: string;
  userInfo: {
    name: string; // Denormalized for easy display
    email: string; // Denormalized for contact
    profileImage?: string; // Denormalized for UI
  };
  courseId: string;
  courseInfo: {
    name: string; // Denormalized for easy reference
    category: string; // Denormalized for filtering
  };
  // ... other fields
}
```

#### Aggregated Counts

```typescript
// Store counts directly in documents to avoid expensive aggregation queries
interface Course {
  id: string;
  name: string;
  // ... other fields
  enrollmentCount: number; // Denormalized count
  materialCount: number; // Denormalized count
  assignmentCount: number; // Denormalized count
}
```

### Indexing Fields for Common Queries

```typescript
interface OptimizedCourse {
  // Primary data
  name: string;
  description: string;
  category: string;

  // Indexing fields for efficient queries
  categoryIndex: string; // For category-based queries
  levelIndex: string; // For level-based queries
  priceRange: string; // For price range queries
  searchKeywords: string[]; // For text search
  publishedIndex: string; // For published/unpublished queries
}
```

## 2. Query Optimization

### Efficient Query Patterns

#### Use Compound Indexes

```typescript
// Good: Uses compound index
const courses = await query(
  collection(db, "courses"),
  where("category", "==", "Tech"),
  where("isActive", "==", true),
  orderBy("createdAt", "desc"),
  limit(10)
);

// Bad: Requires multiple queries
const allCourses = await getDocs(collection(db, "courses"));
const filtered = allCourses.docs.filter(
  (doc) => doc.data().category === "Tech" && doc.data().isActive
);
```

#### Implement Pagination Efficiently

```typescript
class PaginationService {
  static async getPaginatedCourses(
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ) {
    let q = query(
      collection(db, "courses"),
      where("isActive", "==", true),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1) // Get one extra to check if there are more
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const data = hasMore ? docs.slice(0, -1) : docs;

    return {
      data: data.map((doc) => ({ id: doc.id, ...doc.data() })),
      lastDoc: data[data.length - 1],
      hasMore,
    };
  }
}
```

### Avoid Expensive Operations

#### Batch Operations

```typescript
// Good: Batch multiple operations
const batch = writeBatch(db);
updates.forEach((update) => {
  const docRef = doc(db, "courses", update.id);
  batch.update(docRef, update.data);
});
await batch.commit();

// Bad: Individual operations
for (const update of updates) {
  await updateDoc(doc(db, "courses", update.id), update.data);
}
```

#### Transaction Usage

```typescript
// Use transactions for related data updates
await runTransaction(db, async (transaction) => {
  const courseRef = doc(db, "courses", courseId);
  const enrollmentRef = doc(db, "enrollments", enrollmentId);

  transaction.update(courseRef, {
    enrollmentCount: increment(1),
  });

  transaction.set(enrollmentRef, enrollmentData);
});
```

## 3. Real-time Optimization

### Efficient Listeners

#### Targeted Subscriptions

```typescript
// Good: Specific, targeted subscription
const unsubscribe = onSnapshot(
  query(
    collection(db, "courses"),
    where("instructorId", "==", currentUserId),
    where("isActive", "==", true)
  ),
  (snapshot) => {
    // Handle updates
  }
);

// Bad: Listening to entire collection
const unsubscribe = onSnapshot(collection(db, "courses"), (snapshot) => {
  // Filter client-side (expensive!)
  const myCourses = snapshot.docs.filter(
    (doc) => doc.data().instructorId === currentUserId
  );
});
```

#### Proper Cleanup

```typescript
// Always clean up listeners
useEffect(() => {
  const unsubscribe = onSnapshot(/* ... */);

  return () => {
    unsubscribe(); // Important: Clean up on unmount
  };
}, []);
```

### Offline Persistence

```typescript
// Enable offline persistence for better UX
import { enableNetwork, disableNetwork } from "firebase/firestore";

// Configure offline persistence
enableNetwork(db);

// Handle network state changes
const handleNetworkChange = (isOnline: boolean) => {
  if (isOnline) {
    enableNetwork(db);
  } else {
    disableNetwork(db);
  }
};
```

## 4. Cost Optimization Strategies

### Minimize Document Reads

#### Use Subcollections Wisely

```typescript
// Good: Use subcollections for related data
// /courses/{courseId}/materials/{materialId}
// This allows reading course info without loading all materials

// Bad: Store all materials in a single course document
// This would require reading the entire document for any material update
```

#### Implement Smart Caching

```typescript
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getCachedData(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

### Optimize Write Operations

#### Batch Related Updates

```typescript
// Good: Batch related updates
const updateCourseWithMaterials = async (
  courseId: string,
  materials: Material[]
) => {
  const batch = writeBatch(db);

  // Update course document
  const courseRef = doc(db, "courses", courseId);
  batch.update(courseRef, {
    materialCount: materials.length,
    updatedAt: serverTimestamp(),
  });

  // Update materials
  materials.forEach((material) => {
    const materialRef = doc(db, "courses", courseId, "materials", material.id);
    batch.set(materialRef, material);
  });

  await batch.commit();
};
```

#### Use Server Timestamps

```typescript
// Good: Use server timestamps for consistency
const createDocument = async (data: any) => {
  await addDoc(collection(db, "courses"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Bad: Client-side timestamps can cause ordering issues
const createDocument = async (data: any) => {
  await addDoc(collection(db, "courses"), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};
```

## 5. Advanced Optimization Techniques

### Connection Pooling

```typescript
// Reuse Firestore instances
class FirestoreManager {
  private static instance: Firestore;

  static getInstance(): Firestore {
    if (!this.instance) {
      this.instance = initializeFirestore(app, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        ignoreUndefinedProperties: true,
      });
    }
    return this.instance;
  }
}
```

### Query Result Caching

```typescript
class QueryCache {
  private cache = new Map<string, QueryResult>();

  async executeQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes
  ): Promise<T> {
    const cached = this.cache.get(queryKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const result = await queryFn();
    this.cache.set(queryKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }
}
```

### Lazy Loading

```typescript
// Implement lazy loading for large datasets
class LazyLoader {
  static async loadCourseMaterials(
    courseId: string,
    batchSize: number = 10
  ): Promise<Material[]> {
    const materials: Material[] = [];
    let lastDoc: DocumentSnapshot | undefined;
    let hasMore = true;

    while (hasMore) {
      let q = query(
        collection(db, "courses", courseId, "materials"),
        orderBy("orderIndex"),
        limit(batchSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;

      materials.push(...docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      hasMore = docs.length === batchSize;
      lastDoc = docs[docs.length - 1];
    }

    return materials;
  }
}
```

## 6. Monitoring and Analytics

### Performance Monitoring

```typescript
class PerformanceMonitor {
  static trackQuery(queryName: string, queryFn: () => Promise<any>) {
    const startTime = performance.now();

    return queryFn().then((result) => {
      const duration = performance.now() - startTime;
      console.log(`Query ${queryName} took ${duration}ms`);

      // Send to analytics service
      this.sendMetrics(queryName, duration);

      return result;
    });
  }

  private static sendMetrics(queryName: string, duration: number) {
    // Send to your analytics service
    // e.g., Google Analytics, DataDog, etc.
  }
}
```

### Cost Tracking

```typescript
class CostTracker {
  private static readCount = 0;
  private static writeCount = 0;

  static trackRead() {
    this.readCount++;
    console.log(`Total reads: ${this.readCount}`);
  }

  static trackWrite() {
    this.writeCount++;
    console.log(`Total writes: ${this.writeCount}`);
  }

  static getCostEstimate(): number {
    // Firestore pricing (as of 2024)
    const readCost = 0.06 / 100000; // $0.06 per 100k reads
    const writeCost = 0.18 / 100000; // $0.18 per 100k writes

    return this.readCount * readCost + this.writeCount * writeCost;
  }
}
```

## 7. Best Practices Summary

### Do's ✅

- Use compound indexes for complex queries
- Implement proper pagination with cursor-based navigation
- Denormalize frequently accessed data
- Use batch operations for multiple updates
- Clean up listeners properly
- Cache frequently accessed data
- Use subcollections for related data
- Monitor performance and costs

### Don'ts ❌

- Don't read entire collections for filtering
- Don't use client-side timestamps for ordering
- Don't forget to clean up listeners
- Don't store large arrays in documents
- Don't use complex queries without proper indexes
- Don't ignore offline capabilities
- Don't skip error handling
- Don't forget to monitor costs

## 8. Migration Checklist

### Pre-Migration

- [ ] Analyze current query patterns
- [ ] Design optimized data structure
- [ ] Plan index requirements
- [ ] Set up monitoring

### During Migration

- [ ] Export data with proper transformation
- [ ] Import data in batches
- [ ] Validate data integrity
- [ ] Test all functionality

### Post-Migration

- [ ] Monitor performance metrics
- [ ] Track cost changes
- [ ] Optimize based on usage patterns
- [ ] Update documentation

This guide provides a comprehensive approach to optimizing your Firestore implementation for both performance and cost-effectiveness. Regular monitoring and optimization based on actual usage patterns will ensure the best results.


