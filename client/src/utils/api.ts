import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";
import { Assignment, StudentSubmission } from "../types/assignments";

// Type definitions for API responses
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featuredImage?: string;
  authorId: number;
  firstName: string;
  lastName: string;
  author: {
    id: number;
    firstName: string;
    lastName: string;
  };
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  scheduledFor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  content: string;
  author: string;
  firstName: string;
  lastName: string;
  storyId: number;
  userId: number;
  createdAt: string;
}

export interface Analytics {
  totalStories: number;
  publishedStories: number;
  draftStories: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
}

export interface StoriesResponse {
  stories: Story[];
  pagination: Pagination;
}

export interface StoryResponse {
  story: Story;
  comments: Comment[];
  pagination: Pagination;
  liked: boolean;
}

export interface FeaturedStoriesResponse extends Array<Story> { }

export interface CommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface LikeResponse {
  liked: boolean;
}

export interface AnalyticsResponse {
  analytics: Analytics;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Extend axios config type to include metadata
declare module "axios" {
  interface AxiosRequestConfig {
    metadata?: { startTime: Date };
  }
}

// Request interceptor to add auth token and handle requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("API Request - Token from localStorage:", token);
    console.log("API Request - URL:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "API Request - Authorization header set:",
        config.headers.Authorization
      );
    } else {
      console.log("API Request - No token found in localStorage");
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for performance monitoring
    const endTime = new Date();
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = endTime.getTime() - startTime.getTime();
      if (duration > 3000) {
        console.warn(
          `Slow API response: ${response.config.url} took ${duration}ms`
        );
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh", {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem("token", token);
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          originalRequest.headers["Authorization"] = `Bearer ${token}`;

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        toast.error("Session expired. Please login again.");
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const message = retryAfter
        ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
        : "Too many requests. Please wait a moment before trying again.";
      toast.error(message);
    }
    // Handle other errors
    else if (error.response?.status === 403) {
      toast.error(
        "Access denied. You don't have permission to perform this action."
      );
    } else if (error.response?.status === 404) {
      toast.error("Resource not found. Please check your request.");
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.code === "ECONNABORTED") {
      toast.error(
        "Request timeout. Please check your connection and try again."
      );
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

// API response wrapper for consistent error handling
export const apiCall = async <T>(
  apiFunction: () => Promise<AxiosResponse<T>>,
  errorMessage?: string
): Promise<T> => {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error: any) {
    const message =
      errorMessage || error.response?.data?.message || "An error occurred";
    throw new Error(message);
  }
};

// Generic API functions
export const apiService = {
  // GET request
  get: <T>(url: string, config?: any) => apiCall<T>(() => api.get(url, config)),

  // POST request
  post: <T>(url: string, data?: any, config?: any) =>
    apiCall<T>(() => api.post(url, data, config)),

  // PUT request
  put: <T>(url: string, data?: any, config?: any) =>
    apiCall<T>(() => api.put(url, data, config)),

  // DELETE request
  delete: <T>(url: string, config?: any) =>
    apiCall<T>(() => api.delete(url, config)),

  // PATCH request
  patch: <T>(url: string, data?: any, config?: any) =>
    apiCall<T>(() => api.patch(url, data, config)),
};

// Stories API functions
export const storiesApi = {
  // Public stories
  getStories: (params?: any): Promise<StoriesResponse> =>
    apiService.get<StoriesResponse>("/stories", { params }),
  getFeaturedStories: (): Promise<Story[]> =>
    apiService.get<Story[]>("/stories/featured"),
  getStory: (id: string | number): Promise<StoryResponse> =>
    apiService.get<StoryResponse>(`/stories/${id}`),

  // Admin stories
  getAllStories: (params?: any): Promise<StoriesResponse> =>
    apiService.get<StoriesResponse>("/stories/admin/all", { params }),
  createStory: (data: any) => apiService.post("/stories", data),
  updateStory: (id: string | number, data: any) =>
    apiService.put(`/stories/${id}`, data),
  deleteStory: (id: string | number) => apiService.delete(`/stories/${id}`),
  publishStory: (id: string | number) =>
    apiService.patch(`/stories/${id}/publish`),
  unpublishStory: (id: string | number) =>
    apiService.patch(`/stories/${id}/unpublish`),

  // Story interactions
  getStoryComments: (
    id: string | number,
    params?: any
  ): Promise<CommentsResponse> =>
    apiService.get<CommentsResponse>(`/stories/${id}/comments`, { params }),
  checkStoryLike: (id: string | number): Promise<LikeResponse> =>
    apiService.get<LikeResponse>(`/stories/${id}/like`),
  likeStory: (id: string | number): Promise<LikeResponse> =>
    apiService.post<LikeResponse>(`/stories/${id}/like`),
  unlikeStory: (id: string | number) =>
    apiService.delete(`/stories/${id}/like`),
  addComment: (id: string | number, content: string) =>
    apiService.post(`/stories/${id}/comments`, { content }),

  // Analytics
  getAnalytics: (): Promise<AnalyticsResponse> =>
    apiService.get<AnalyticsResponse>("/stories/admin/analytics"),
};

// Courses API functions
export const coursesApi = {
  // Public courses
  getCourses: (params?: any) => apiService.get("/courses", { params }),
  getCourse: (id: string | number) => apiService.get(`/courses/${id}`),

  // Admin/Trainer courses
  createCourse: (data: any) => apiService.post("/courses", data),
  updateCourse: (id: string | number, data: any) =>
    apiService.put(`/courses/${id}`, data),
  deleteCourse: (id: string | number) => apiService.delete(`/courses/${id}`),
  activateCourse: (id: string | number) =>
    apiService.patch(`/courses/${id}/activate`),
  deactivateCourse: (id: string | number) =>
    apiService.patch(`/courses/${id}/deactivate`),
};

// Registrations API functions
export const registrationsApi = {
  // Student registrations
  registerForCourse: (courseId: string | number) =>
    apiService.post(`/registrations/${courseId}`),
  getMyRegistrations: () => apiService.get("/registrations/my"),

  // Admin registrations
  getAllRegistrations: (params?: any) =>
    apiService.get("/registrations", { params }),
  updateRegistration: (id: string | number, data: any) =>
    apiService.put(`/registrations/${id}`, data),
  approveRegistration: (id: string | number) =>
    apiService.patch(`/registrations/${id}/approve`),
  rejectRegistration: (id: string | number, reason?: string) =>
    apiService.patch(`/registrations/${id}/reject`, { reason }),
};

// User management API functions
export const usersApi = {
  // Profile management
  getProfile: () => apiService.get("/auth/profile"),
  updateProfile: (data: any) => apiService.put("/auth/profile", data),

  // Admin user management
  getAllUsers: (params?: any) => apiService.get("/users", { params }),
  getUser: (id: string | number) => apiService.get(`/users/${id}`),
  updateUser: (id: string | number, data: any) =>
    apiService.put(`/users/${id}`, data),
  deleteUser: (id: string | number) => apiService.delete(`/users/${id}`),
  changeUserRole: (id: string | number, role: string) =>
    apiService.patch(`/users/${id}/role`, { role }),
  activateUser: (id: string | number) =>
    apiService.patch(`/users/${id}/activate`),
  deactivateUser: (id: string | number) =>
    apiService.patch(`/users/${id}/deactivate`),
};

// Dashboard API functions
export const dashboardApi = {
  // Student dashboard
  getStudentStats: () => apiService.get("/dashboard/student"),
  getStudentCourses: () => apiService.get("/dashboard/student/courses"),

  // Trainer dashboard
  getTrainerStats: () => apiService.get("/dashboard/trainer"),
  getTrainerCourses: () => apiService.get("/dashboard/trainer/courses"),
  getTrainerStudents: () => apiService.get("/dashboard/trainer/students"),

  // Admin dashboard
  getAdminStats: () => apiService.get("/dashboard/admin"),
  getSystemStats: () => apiService.get("/dashboard/admin/system"),
  getRecentActivity: () => apiService.get("/dashboard/admin/activity"),
};

// File upload API functions
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return apiService.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append("document", file);
    return apiService.post("/upload/document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Assignments API functions
export const assignmentsApi = {
  // Trainer functions
  createAssignment: (data: Partial<Assignment>) =>
    apiService.post<Assignment>("/assignments", data),

  getAssignmentsForCourse: (courseId: number) =>
    apiService.get<Assignment[]>(`/assignments/course/${courseId}`),

  getSubmissionsForAssignment: (assignmentId: number) =>
    apiService.get<StudentSubmission[]>(`/assignments/${assignmentId}/submissions`),

  gradeSubmission: (submissionId: number, data: { grade: number; feedback?: string }) =>
    apiService.post<StudentSubmission>(`/assignments/submissions/${submissionId}/grade`, data),

  // Student functions
  submitAssignment: (assignmentId: number, data: { fileUrl: string; fileName: string }) =>
    apiService.post<StudentSubmission>(`/assignments/${assignmentId}/submit`, data),

  getMySubmissions: () =>
    apiService.get<StudentSubmission[]>("/assignments/my-submissions"),
};

// Export statement at the end
export { api };
