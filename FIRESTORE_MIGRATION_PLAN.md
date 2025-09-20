# Firestore Migration Plan for KM Media Learning Platform

## Overview

This document outlines the comprehensive migration strategy from PostgreSQL to Firebase Firestore, including data modeling, migration scripts, code refactoring, and optimization strategies.

## 1. Firestore Data Model Design

### Core Collections Structure

```
/users/{userId}
/courses/{courseId}
/registrations/{registrationId}
/payments/{paymentId}
/stories/{storyId}
/enquiries/{enquiryId}
```

### Subcollections for Related Data

```
/courses/{courseId}/materials/{materialId}
/courses/{courseId}/assignments/{assignmentId}
/courses/{courseId}/quizzes/{quizId}
/courses/{courseId}/announcements/{announcementId}
/courses/{courseId}/enrollments/{enrollmentId}

/assignments/{assignmentId}/submissions/{submissionId}
/quizzes/{quizId}/attempts/{attemptId}
/quizzes/{quizId}/questions/{questionId}

/stories/{storyId}/comments/{commentId}
/stories/{storyId}/likes/{likeId}

/users/{userId}/progress/{progressId}
/users/{userId}/notifications/{notificationId}
```

## 2. Optimized Data Models

### Users Collection

```typescript
interface FirestoreUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "trainer";
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  experience?: string;
  profileImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized data for performance
  fullName: string;
  displayName: string;

  // Indexing fields
  roleIndex: string; // for compound queries
  emailIndex: string; // for case-insensitive searches
}
```

### Courses Collection

```typescript
interface FirestoreCourse {
  id: string;
  name: string;
  description: string;
  excerpt?: string;
  duration: string;
  price: number;
  maxStudents: number;
  level: "beginner" | "intermediate" | "advanced";
  category: "Tech" | "Media" | "Vocational";
  instructorId?: string;
  isActive: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized instructor data for performance
  instructor?: {
    id: string;
    name: string;
    specialization: string;
  };

  // Indexing and search fields
  categoryIndex: string;
  levelIndex: string;
  searchKeywords: string[]; // for full-text search
  priceRange: string; // 'low', 'medium', 'high'
}
```

### Registrations Collection

```typescript
interface FirestoreRegistration {
  id: string;
  userId: string;
  courseId: string;
  status: "pending" | "approved" | "rejected" | "completed";
  registrationDate: Timestamp;

  // Personal Information (denormalized for easier access)
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName: string;
    dateOfBirth: string;
    residentialAddress: string;
    nationality: string;
    religion?: string;
    maritalStatus: string;
    occupation: string;
    telephone?: string;
  };

  // Educational Background
  educationInfo: {
    levelOfEducation: string;
    nameOfSchool: string;
    yearAttendedFrom: number;
    yearAttendedTo: number;
    certificateObtained?: string;
  };

  // Parent/Guardian Information
  guardianInfo: {
    name: string;
    occupation: string;
    address: string;
    contact: string;
    telephone?: string;
  };

  // Course Information
  courseInfo: {
    preferredCourse: string;
    academicYear: string;
  };

  declaration: string;
  comments?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized course data for performance
  course?: {
    id: string;
    name: string;
    description: string;
  };

  // Indexing fields
  statusIndex: string;
  courseCategoryIndex: string;
  registrationYearIndex: string;
}
```

### Payments Collection

```typescript
interface FirestorePayment {
  id: string;
  userId: string;
  courseId: string;
  reference: string;
  amount: number;
  currency: string;
  paymentType: "application_fee" | "course_fee" | "installment";
  status: "pending" | "success" | "failed" | "cancelled";
  paymentMethod: string;
  installmentNumber?: number;
  totalInstallments?: number;
  installmentAmount?: number;
  remainingBalance?: number;
  metadata?: Record<string, any>;
  paidAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized data
  userInfo: {
    name: string;
    email: string;
  };
  courseInfo: {
    name: string;
    category: string;
  };

  // Indexing fields
  statusIndex: string;
  paymentTypeIndex: string;
  yearMonthIndex: string; // for analytics
}
```

### Stories Collection

```typescript
interface FirestoreStory {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  authorId: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  scheduledFor?: Timestamp;
  publishedAt?: Timestamp;
  tags?: string[];
  metaDescription?: string;
  seoTitle?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized author data
  author?: {
    id: string;
    name: string;
    profileImage?: string;
  };

  // Indexing fields
  categoryIndex: string;
  publishedIndex: string;
  featuredIndex: string;
  searchKeywords: string[];
}
```

## 3. Subcollections Design

### Course Materials Subcollection

```
/courses/{courseId}/materials/{materialId}
```

```typescript
interface CourseMaterial {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  fileName: string;
  module?: string;
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  orderIndex: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Assignments Subcollection

```
/courses/{courseId}/assignments/{assignmentId}
```

```typescript
interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Timestamp;
  maxScore: number;
  assignmentType: "individual" | "group";
  instructions?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isActive: boolean;
  allowLateSubmission: boolean;
  latePenalty: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Student Submissions Subcollection

```
/assignments/{assignmentId}/submissions/{submissionId}
```

```typescript
interface AssignmentSubmission {
  id: string;
  studentId: string;
  submissionDate: Timestamp;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submissionText?: string;
  grade?: number;
  feedback?: string;
  status: "submitted" | "late" | "missing" | "graded";
  isLate: boolean;
  latePenaltyApplied: number;
  gradedBy?: string;
  gradedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Denormalized student data
  studentInfo: {
    name: string;
    email: string;
  };
}
```

## 4. Real-time Features Implementation

### Live Classes

```typescript
interface LiveClass {
  id: string;
  courseId: string;
  title: string;
  description: string;
  scheduledFor: Timestamp;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  instructorId: string;
  meetingUrl?: string;
  recordingUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Real-time Notifications

```typescript
interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "assignment" | "grade" | "announcement" | "payment" | "general";
  isRead: boolean;
  data?: Record<string, any>; // Additional data for the notification
  createdAt: Timestamp;
  readAt?: Timestamp;
}
```

## 5. Data Denormalization Strategy

### Benefits of Denormalization in Firestore:

1. **Reduced Read Operations**: Access related data in single queries
2. **Better Performance**: No need for complex joins
3. **Cost Optimization**: Fewer document reads
4. **Real-time Updates**: Easier to maintain consistency

### Key Denormalization Patterns:

1. **User Data in Related Documents**: Include user name/email in courses, payments, etc.
2. **Course Data in Registrations**: Include course name/category for easy filtering
3. **Aggregated Counts**: Store like counts, view counts directly in documents
4. **Search Keywords**: Pre-computed search terms for efficient querying

## 6. Indexing Strategy

### Composite Indexes for Common Queries:

1. `users`: role + createdAt (for admin user management)
2. `courses`: category + isActive + createdAt (for course listings)
3. `registrations`: userId + status (for student enrollments)
4. `payments`: userId + status + createdAt (for payment history)
5. `stories`: category + isPublished + createdAt (for story listings)

### Single Field Indexes:

- All foreign key fields (userId, courseId, etc.)
- Status fields for filtering
- Date fields for sorting
- Search fields for text queries

## 7. Security Rules Design

### Collection-Level Security:

```javascript
// Users can read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'trainer'];
}

// Courses - public read, admin/trainer write
match /courses/{courseId} {
  allow read: if true; // Public courses
  allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'trainer'];

  // Subcollections inherit parent permissions
  match /materials/{materialId} {
    allow read: if true;
    allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'trainer'];
  }
}

// Registrations - students can create, read their own
match /registrations/{registrationId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && (resource.data.userId == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'trainer']);
  allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'trainer'];
}
```

## 8. Migration Strategy

### Phase 1: Setup and Preparation

1. Set up Firebase project and Firestore
2. Configure security rules
3. Create data export scripts
4. Design and test data models

### Phase 2: Data Migration

1. Export PostgreSQL data to JSON
2. Transform data to Firestore format
3. Import data with batch operations
4. Validate data integrity

### Phase 3: Code Migration

1. Update backend repositories to use Firestore SDK
2. Modify services to work with new data structure
3. Update frontend to use Firestore client SDK
4. Implement real-time features

### Phase 4: Testing and Optimization

1. Comprehensive testing of all features
2. Performance optimization
3. Cost analysis and optimization
4. Real-time feature validation

## 9. Performance Optimization

### Query Optimization:

1. Use compound indexes for complex queries
2. Implement pagination with cursor-based navigation
3. Cache frequently accessed data
4. Use batch operations for bulk updates

### Cost Optimization:

1. Minimize document reads through denormalization
2. Use efficient pagination strategies
3. Implement offline caching
4. Optimize real-time listeners

### Real-time Optimization:

1. Use targeted listeners instead of broad queries
2. Implement proper cleanup of listeners
3. Use offline persistence for better UX
4. Optimize update patterns to minimize writes

## 10. Monitoring and Analytics

### Key Metrics to Track:

1. **Performance**: Query response times, document read counts
2. **Cost**: Daily/monthly Firestore usage costs
3. **Real-time**: Connection stability, update frequency
4. **User Experience**: Feature usage, error rates

### Monitoring Tools:

1. Firebase Analytics for user behavior
2. Firestore usage monitoring
3. Custom performance dashboards
4. Error tracking and alerting

This comprehensive migration plan ensures a smooth transition to Firestore while maintaining all existing functionality and adding powerful real-time capabilities.


