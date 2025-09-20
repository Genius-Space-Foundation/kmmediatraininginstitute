import { api } from "../utils/api";

export interface RealTimeStats {
  timestamp: number;
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalAssignments: number;
  pendingAssignments: number;
  submittedAssignments: number;
  gradedAssignments: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  averageGrade: number;
  studyStreak: number;
  lastActivity: string;
  notifications: number;
  systemStatus: "online" | "offline" | "maintenance";
}

export interface NotificationItem {
  id: string;
  type:
    | "assignment"
    | "grade"
    | "payment"
    | "course"
    | "system"
    | "submission"
    | "student"
    | "registration"
    | "user";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

class RealTimeService {
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Student Dashboard
  async getStudentDashboardData(): Promise<RealTimeStats> {
    try {
      const response = await api.get("/students/dashboard/realtime");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching student dashboard data:", error);
      throw error;
    }
  }

  async getStudentNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get("/students/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching student notifications:", error);
      throw error;
    }
  }

  // Trainer Dashboard
  async getTrainerDashboardData(): Promise<RealTimeStats> {
    try {
      const response = await api.get("/trainers/dashboard/realtime");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching trainer dashboard data:", error);
      throw error;
    }
  }

  async getTrainerNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get("/trainers/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching trainer notifications:", error);
      throw error;
    }
  }

  // Admin Dashboard
  async getAdminDashboardData(): Promise<RealTimeStats> {
    try {
      const response = await api.get("/admin/dashboard/realtime");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
      throw error;
    }
  }

  async getAdminNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get("/admin/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(
    notificationId: string,
    userType: "student" | "trainer" | "admin"
  ): Promise<void> {
    try {
      await api.patch(`/${userType}s/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Real-time data subscription
  subscribeToData(
    key: string,
    callback: (data: any) => void,
    fetchFunction: () => Promise<any>,
    interval: number = 30000
  ): () => void {
    // Add listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Start interval if not already running
    if (!this.refreshIntervals.has(key)) {
      const intervalId = setInterval(async () => {
        try {
          const data = await fetchFunction();
          this.notifyListeners(key, data);
        } catch (error) {
          console.error(`Error in real-time subscription for ${key}:`, error);
        }
      }, interval);
      this.refreshIntervals.set(key, intervalId);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeFromData(key, callback);
    };
  }

  private notifyListeners(key: string, data: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  private unsubscribeFromData(
    key: string,
    callback: (data: any) => void
  ): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        // No more listeners, clear interval
        const intervalId = this.refreshIntervals.get(key);
        if (intervalId) {
          clearInterval(intervalId);
          this.refreshIntervals.delete(key);
        }
        this.listeners.delete(key);
      }
    }
  }

  // Cleanup all subscriptions
  cleanup(): void {
    this.refreshIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.refreshIntervals.clear();
    this.listeners.clear();
  }

  // Generate sample chart data
  generateChartData(
    type: "study" | "assignments" | "payments" | "courses"
  ): ChartData {
    const baseLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    switch (type) {
      case "study":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Study Hours",
              data: [2, 3, 1, 4, 2, 1, 3],
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 1)",
              fill: true,
            },
            {
              label: "Assignments Completed",
              data: [1, 2, 0, 3, 1, 0, 2],
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderColor: "rgba(16, 185, 129, 1)",
              fill: true,
            },
          ],
        };

      case "assignments":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Assignments Created",
              data: [3, 2, 4, 1, 3, 0, 2],
              backgroundColor: "rgba(168, 85, 247, 0.1)",
              borderColor: "rgba(168, 85, 247, 1)",
              fill: true,
            },
            {
              label: "Submissions Graded",
              data: [5, 3, 6, 2, 4, 1, 3],
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              borderColor: "rgba(245, 158, 11, 1)",
              fill: true,
            },
          ],
        };

      case "payments":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Revenue",
              data: [1200, 1500, 800, 2000, 1100, 600, 1800],
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              borderColor: "rgba(34, 197, 94, 1)",
              fill: true,
            },
          ],
        };

      case "courses":
        return {
          labels: baseLabels,
          datasets: [
            {
              label: "Course Enrollments",
              data: [5, 8, 3, 12, 6, 2, 9],
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 1)",
              fill: true,
            },
            {
              label: "Course Completions",
              data: [2, 4, 1, 6, 3, 1, 4],
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 1)",
              fill: true,
            },
          ],
        };

      default:
        return {
          labels: baseLabels,
          datasets: [],
        };
    }
  }

  // WebSocket connection for real-time updates (if available)
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connectWebSocket(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:5000/ws";
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
  }

  private handleWebSocketMessage(data: any): void {
    // Handle different types of real-time updates
    switch (data.type) {
      case "notification":
        this.notifyListeners("notifications", data.payload);
        break;
      case "stats":
        this.notifyListeners("stats", data.payload);
        break;
      case "assignment":
        this.notifyListeners("assignments", data.payload);
        break;
      case "payment":
        this.notifyListeners("payments", data.payload);
        break;
      default:
        console.log("Unknown WebSocket message type:", data.type);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      setTimeout(() => {
        console.log(
          `Attempting to reconnect to WebSocket (attempt ${this.reconnectAttempts})`
        );
        this.connectWebSocket();
      }, delay);
    } else {
      console.error("Max reconnection attempts reached");
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const realTimeService = new RealTimeService();










