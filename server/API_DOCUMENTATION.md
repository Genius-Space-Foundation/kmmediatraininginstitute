# KM Media Training Institute - API Documentation

## Overview

This document provides comprehensive API documentation for the KM Media Training Institute backend system. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://api.kmmediatraininginstitute.com/api/v1`

## Authentication

All protected endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## API Endpoints

### Authentication

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "student"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student"
    },
    "token": "jwt-token",
    "expiresIn": "24h"
  }
}
```

#### POST /auth/login

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token",
    "expiresIn": "24h"
  }
}
```

### Courses

#### GET /courses

Get all courses with pagination and filtering.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `level` (optional): Filter by level (beginner, intermediate, advanced)
- `search` (optional): Search in title and description

**Response:**

```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Web Development Fundamentals",
      "description": "Learn the basics of web development",
      "price": 299.99,
      "level": "beginner",
      "category": "Programming",
      "duration_weeks": 12,
      "is_active": true,
      "trainer": {
        "id": "uuid",
        "first_name": "Jane",
        "last_name": "Smith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### POST /courses

Create a new course (Admin/Trainer only).

**Request Body:**

```json
{
  "title": "Advanced React Development",
  "description": "Master React with advanced concepts",
  "price": 499.99,
  "level": "advanced",
  "category": "Programming",
  "duration_weeks": 8
}
```

### Assignments

#### GET /assignments/course/:courseId

Get assignments for a specific course.

**Response:**

```json
{
  "success": true,
  "message": "Assignments retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Build a Todo App",
      "description": "Create a todo application using React",
      "due_date": "2024-02-15T23:59:59Z",
      "max_points": 100,
      "assignment_type": "project",
      "is_active": true,
      "submissions_count": 15
    }
  ]
}
```

#### POST /assignments

Create a new assignment (Admin/Trainer only).

**Request Body:**

```json
{
  "course_id": "uuid",
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your JavaScript knowledge",
  "instructions": "Answer all questions carefully",
  "due_date": "2024-02-20T23:59:59Z",
  "max_points": 50,
  "assignment_type": "quiz"
}
```

#### POST /assignments/:id/submit

Submit an assignment (Student only).

**Request Body:**

```json
{
  "submission_text": "Here is my solution...",
  "file": "file-upload" // Optional file upload
}
```

#### POST /assignments/submissions/:submissionId/grade

Grade a submission (Admin/Trainer only).

**Request Body:**

```json
{
  "grade": 85,
  "feedback": "Good work! Consider improving error handling."
}
```

### Live Classes

#### GET /live-classes/upcoming

Get upcoming live classes.

**Query Parameters:**

- `days` (optional): Number of days to look ahead (default: 7)

**Response:**

```json
{
  "success": true,
  "message": "Upcoming classes retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "React Hooks Deep Dive",
      "description": "Learn advanced React hooks",
      "scheduled_date": "2024-02-10T14:00:00Z",
      "duration_minutes": 90,
      "meeting_url": "https://zoom.us/j/123456789",
      "status": "scheduled",
      "course": {
        "title": "Advanced React Development"
      }
    }
  ]
}
```

#### POST /live-classes

Create a live class (Admin/Trainer only).

**Request Body:**

```json
{
  "course_id": "uuid",
  "title": "State Management with Redux",
  "description": "Learn Redux for state management",
  "scheduled_date": "2024-02-15T10:00:00Z",
  "duration_minutes": 120,
  "meeting_url": "https://zoom.us/j/987654321",
  "meeting_id": "987654321",
  "meeting_password": "secure123"
}
```

### Payments

#### GET /payments/my-payments

Get user's payment history (Student only).

**Response:**

```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "amount": 299.99,
      "currency": "GHS",
      "status": "successful",
      "payment_method": "paystack",
      "created_at": "2024-01-15T10:30:00Z",
      "course_title": "Web Development Fundamentals"
    }
  ]
}
```

#### POST /payments

Create a payment (Student only).

**Request Body:**

```json
{
  "registration_id": "uuid",
  "amount": 299.99,
  "payment_method": "paystack"
}
```

#### POST /payments/webhook/paystack

Paystack webhook endpoint for payment verification.

**Request Body:**

```json
{
  "event": "charge.success",
  "data": {
    "reference": "PAY_123456789",
    "status": "success",
    "amount": 29999,
    "customer": {
      "email": "user@example.com"
    }
  }
}
```

### Dashboard

#### GET /dashboard/admin

Get admin dashboard statistics (Admin only).

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "total_students": 150,
    "total_courses": 25,
    "total_assignments": 120,
    "total_revenue": 45000.00,
    "recent_registrations": [...],
    "upcoming_classes": [...],
    "pending_assignments": [...]
  }
}
```

#### GET /dashboard/student

Get student dashboard statistics (Student only).

**Response:**

```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "enrolled_courses": 3,
    "completed_assignments": 12,
    "upcoming_classes": 2,
    "pending_assignments": 5,
    "recent_progress": [...],
    "upcoming_deadlines": [...]
  }
}
```

## Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 400  | Bad Request - Invalid input data        |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource not found          |
| 409  | Conflict - Resource already exists      |
| 422  | Unprocessable Entity - Validation error |
| 500  | Internal Server Error - Server error    |

## Rate Limiting

- **General endpoints**: 200 requests per 15 minutes
- **Authentication endpoints**: 50 requests per 15 minutes

Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## File Uploads

File uploads are supported for:

- Assignment submissions
- Course materials
- Profile images
- Success story images

**Supported formats:**

- Images: JPG, PNG, GIF (max 10MB)
- Documents: PDF, DOC, DOCX (max 25MB)
- Videos: MP4, AVI, MOV (max 100MB)

## Webhooks

### Paystack Payment Webhook

**Endpoint**: `POST /api/v1/payments/webhook/paystack`

**Events handled:**

- `charge.success`: Payment completed successfully
- `charge.failed`: Payment failed
- `charge.pending`: Payment pending

## Pagination

Most list endpoints support pagination:

**Query Parameters:**

- `page`: Page number (1-based)
- `limit`: Items per page (1-100)
- `sort`: Field to sort by
- `order`: Sort direction (asc/desc)

**Response Format:**

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install axios
```

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.kmmediatraininginstitute.com/api/v1",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### Python

```bash
pip install requests
```

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.kmmediatraininginstitute.com/api/v1/courses',
    headers=headers
)
```

## Support

For API support and questions:

- Email: api-support@kmmediatraininginstitute.com
- Documentation: https://docs.kmmediatraininginstitute.com
- Status Page: https://status.kmmediatraininginstitute.com



