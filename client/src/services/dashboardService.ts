import { api } from "../utils/api";

export interface DashboardStats {
  totalRegistrations: number;
  activeRegistrations: number;
  pendingRegistrations: number;
  completedRegistrations: number;
  totalSpent: string;
  averageGrade: number;
  studyStreak: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdueAssignments: number;
  totalPayments: number;
  pendingPayments: number;
  completedPayments: number;
  lastActivity: string;
  notifications: number;
  systemStatus: string;
}

export interface Course {
  id: number;
  courseName: string;
  courseDescription: string;
  instructor: string;
  duration: string;
  price: string;
  status: "active" | "completed" | "pending";
  progress: number;
  startDate: string;
  endDate: string;
  rating: number;
  enrolledStudents: number;
  modules: number;
  assignments: number;
}

export interface Payment {
  id: number;
  courseName: string;
  amount: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId: string;
  date: string;
  dueDate?: string;
  installmentNumber?: number;
  totalInstallments?: number;
}

export interface Assignment {
  id: number;
  title: string;
  courseName: string;
  description: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "overdue";
  grade?: number;
  maxGrade: number;
  submissionDate?: string;
  feedback?: string;
  attachments: string[];
}

export interface NotificationItem {
  id: string;
  type: "assignment" | "grade" | "payment" | "course" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastActivity: string;
  coursesEnrolled: number;
  totalSpent: string;
  averageGrade: number;
  progress: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "trainer" | "admin";
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastActivity: string;
  profileImage?: string;
}

export interface Registration {
  id: number;
  studentName: string;
  courseName: string;
  status: "pending" | "approved" | "rejected";
  applicationDate: string;
  reviewDate?: string;
  notes?: string;
  priority: "low" | "medium" | "high";
}

// Student Dashboard Service
export const studentDashboardService = {
  async getOverview(): Promise<{
    stats: DashboardStats;
    recentRegistrations: Course[];
    recentPayments: Payment[];
  }> {
    try {
      const response = await api.get("/students/dashboard/overview");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching student overview:", error);
      // Return mock data for development
      return {
        stats: {
          totalRegistrations: 5,
          activeRegistrations: 3,
          pendingRegistrations: 1,
          completedRegistrations: 1,
          totalSpent: "2,500.00",
          averageGrade: 85.5,
          studyStreak: 7,
          totalAssignments: 12,
          completedAssignments: 8,
          pendingAssignments: 3,
          overdueAssignments: 1,
          totalPayments: 3,
          pendingPayments: 1,
          completedPayments: 2,
          lastActivity: "2 hours ago",
          notifications: 3,
          systemStatus: "online",
        },
        recentRegistrations: [
          {
            id: 1,
            courseName: "Advanced React Development",
            courseDescription: "Master advanced React concepts and patterns",
            instructor: "John Doe",
            duration: "8 weeks",
            price: "599.00",
            status: "active",
            progress: 65,
            startDate: "2024-01-15",
            endDate: "2024-03-15",
            rating: 4.8,
            enrolledStudents: 45,
            modules: 12,
            assignments: 8,
          },
        ],
        recentPayments: [
          {
            id: 1,
            courseName: "Advanced React Development",
            amount: "599.00",
            status: "completed",
            paymentMethod: "Credit Card",
            transactionId: "TXN123456",
            date: "2024-01-15",
            installmentNumber: 1,
            totalInstallments: 1,
          },
        ],
      };
    }
  },

  async getCourses(): Promise<Course[]> {
    try {
      const response = await api.get("/students/courses");
      return response.data.courses || [];
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  },

  async getPayments(): Promise<Payment[]> {
    try {
      const response = await api.get("/students/payments");
      return response.data.payments || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  },

  async getAssignments(): Promise<Assignment[]> {
    try {
      const response = await api.get("/students/assignments");
      return response.data.assignments || [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  },

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get("/students/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  async getChartData(
    type: "progress" | "payments" | "assignments"
  ): Promise<ChartData[]> {
    try {
      const response = await api.get(`/students/charts/${type}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching ${type} chart data:`, error);
      // Return mock data
      const mockData = {
        progress: [
          { name: "Week 1", value: 20 },
          { name: "Week 2", value: 35 },
          { name: "Week 3", value: 50 },
          { name: "Week 4", value: 65 },
          { name: "Week 5", value: 80 },
          { name: "Week 6", value: 90 },
          { name: "Week 7", value: 95 },
          { name: "Week 8", value: 100 },
        ],
        payments: [
          { name: "Jan", value: 599 },
          { name: "Feb", value: 799 },
          { name: "Mar", value: 1200 },
          { name: "Apr", value: 899 },
          { name: "May", value: 1500 },
          { name: "Jun", value: 1100 },
        ],
        assignments: [
          { name: "Completed", value: 8 },
          { name: "Pending", value: 3 },
          { name: "Overdue", value: 1 },
        ],
      };
      return mockData[type] || [];
    }
  },
};

// Trainer Dashboard Service
export const trainerDashboardService = {
  async getOverview(): Promise<{
    stats: DashboardStats;
    courses: Course[];
    students: Student[];
  }> {
    try {
      const response = await api.get("/trainers/dashboard/overview");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching trainer overview:", error);
      return {
        stats: {
          totalRegistrations: 0,
          activeRegistrations: 0,
          pendingRegistrations: 0,
          completedRegistrations: 0,
          totalSpent: "0",
          averageGrade: 0,
          studyStreak: 0,
          totalAssignments: 15,
          completedAssignments: 12,
          pendingAssignments: 2,
          overdueAssignments: 1,
          totalPayments: 0,
          pendingPayments: 0,
          completedPayments: 0,
          lastActivity: "1 hour ago",
          notifications: 5,
          systemStatus: "online",
        },
        courses: [],
        students: [],
      };
    }
  },

  async getCourses(): Promise<Course[]> {
    try {
      const response = await api.get("/trainers/courses");
      return response.data.courses || [];
    } catch (error) {
      console.error("Error fetching trainer courses:", error);
      return [];
    }
  },

  async getStudents(): Promise<Student[]> {
    try {
      const response = await api.get("/trainers/students");
      return response.data.students || [];
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  },

  async getAssignments(): Promise<Assignment[]> {
    try {
      const response = await api.get("/trainers/assignments");
      return response.data.assignments || [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  },

  async getSubmissions(): Promise<any[]> {
    try {
      const response = await api.get("/trainers/submissions");
      return response.data.submissions || [];
    } catch (error) {
      console.error("Error fetching submissions:", error);
      return [];
    }
  },

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get("/trainers/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },
};

// Admin Dashboard Service
export const adminDashboardService = {
  async getOverview(): Promise<{
    stats: DashboardStats;
    courses: Course[];
    users: User[];
    registrations: Registration[];
  }> {
    try {
      const response = await api.get("/admin/dashboard/overview");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching admin overview:", error);
      return {
        stats: {
          totalRegistrations: 0,
          activeRegistrations: 0,
          pendingRegistrations: 0,
          completedRegistrations: 0,
          totalSpent: "0",
          averageGrade: 0,
          studyStreak: 0,
          totalAssignments: 0,
          completedAssignments: 0,
          pendingAssignments: 0,
          overdueAssignments: 0,
          totalPayments: 0,
          pendingPayments: 0,
          completedPayments: 0,
          lastActivity: "Now",
          notifications: 8,
          systemStatus: "online",
        },
        courses: [],
        users: [],
        registrations: [],
      };
    }
  },

  async getCourses(): Promise<Course[]> {
    try {
      const response = await api.get("/admin/courses");
      return response.data.courses || [];
    } catch (error) {
      console.error("Error fetching admin courses:", error);
      return [];
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get("/admin/users");
      return response.data.users || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  async getRegistrations(): Promise<Registration[]> {
    try {
      const response = await api.get("/admin/registrations");
      return response.data.registrations || [];
    } catch (error) {
      console.error("Error fetching registrations:", error);
      return [];
    }
  },

  async getPayments(): Promise<Payment[]> {
    try {
      const response = await api.get("/admin/payments");
      return response.data.payments || [];
    } catch (error) {
      console.error("Error fetching payments:", error);
      return [];
    }
  },

  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get("/admin/notifications");
      return response.data.notifications || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },
};

// Common utility functions
export const exportData = (
  data: any[],
  filename: string,
  format: "csv" | "json" = "csv"
) => {
  if (format === "csv") {
    const csvContent = convertToCSV(data);
    downloadFile(csvContent, `${filename}.csv`, "text/csv");
  } else {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, "application/json");
  }
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      return typeof value === "string"
        ? `"${value.replace(/"/g, '""')}"`
        : value;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
