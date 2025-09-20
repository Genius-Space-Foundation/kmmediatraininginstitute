import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { Link } from "react-router-dom";
import AdminTrainerManagement from "../components/AdminTrainerManagement";
import AdminCourseManagement from "../components/AdminCourseManagement";
import AdminProfileManagement from "../components/AdminProfileManagement";
import {
  Users,
  BookOpen,
  DollarSign,
  BarChart3,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  GraduationCap,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  AlertCircle,
  UserPlus,
  FileText,
  CreditCard,
  PieChart,
  TrendingDown,
  Target,
  Shield,
  Database,
  Mail,
  Calendar,
  Download,
  Upload,
  Trash2,
  Check,
  X as XIcon,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalTrainers: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  activeUsers: number;
  systemHealth: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "student" | "trainer" | "admin";
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  instructor: string;
  enrolledStudents: number;
  maxStudents: number;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  revenue: number;
}

interface Payment {
  id: number;
  studentName: string;
  courseName: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  type: "course_fee" | "application_fee" | "installment";
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "approval" | "payment" | "system" | "user";
  priority: "low" | "medium" | "high";
  isRead: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTrainers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    systemHealth: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch real data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all dashboard data in parallel with error handling
        const [
          courseStatsResponse,
          registrationStatsResponse,
          trainerStatsResponse,
          usersResponse,
          coursesResponse,
          paymentsResponse,
        ] = await Promise.allSettled([
          api.get("/courses/admin/stats"),
          api.get("/registrations/admin/stats"),
          api.get("/trainers/admin/stats"),
          api.get("/users/admin/all"),
          api.get("/courses/admin/all"),
          api.get("/payments/admin/all"),
        ]);

        // Extract data from settled promises
        const courseStats =
          courseStatsResponse.status === "fulfilled"
            ? courseStatsResponse.value.data.data
            : { totalCourses: 0, totalRevenue: 0, monthlyRevenue: 0 };
        const registrationStats =
          registrationStatsResponse.status === "fulfilled"
            ? registrationStatsResponse.value.data.data
            : { totalRegistrations: 0, pendingRegistrations: 0 };
        const trainerStats =
          trainerStatsResponse.status === "fulfilled"
            ? trainerStatsResponse.value.data.data
            : { totalTrainers: 0 };
        const usersData =
          usersResponse.status === "fulfilled"
            ? usersResponse.value.data.users
            : [];
        const coursesData =
          coursesResponse.status === "fulfilled"
            ? coursesResponse.value.data.courses
            : [];
        const paymentsData =
          paymentsResponse.status === "fulfilled"
            ? paymentsResponse.value.data.payments
            : [];

        // Calculate combined stats
        setStats({
          totalStudents: registrationStats.totalRegistrations || 0,
          totalTrainers: trainerStats.totalTrainers || 0,
          totalCourses: courseStats.totalCourses || 0,
          totalRevenue: courseStats.totalRevenue || 0,
          monthlyRevenue: courseStats.monthlyRevenue || 0,
          pendingApprovals: registrationStats.pendingRegistrations || 0,
          activeUsers:
            usersData?.filter((u: any) => u.status === "active").length || 0,
          systemHealth: 98, // This would come from a system health endpoint
        });

        // Set real data from API responses
        setUsers(usersData || []);
        setCourses(coursesData || []);
        setPayments(paymentsData || []);

        // Mock notifications for now (would come from notifications API)
        setNotifications([
          {
            id: 1,
            title: "New Course Approval Request",
            message: "A new course needs approval",
            type: "approval",
            priority: "medium",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "inactive":
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Admin Portal
                  </h1>
                  <p className="text-xs text-gray-500">System Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-80"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                            !notification.isRead ? "bg-red-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                !notification.isRead
                                  ? "bg-red-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.createdAt}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6">
              <div className="space-y-2">
                {[
                  {
                    id: "overview",
                    label: "Institute Overview",
                    icon: BarChart3,
                  },
                  { id: "finance", label: "Finance Module", icon: DollarSign },
                  { id: "users", label: "User Management", icon: Users },
                  { id: "courses", label: "Course Management", icon: BookOpen },
                  {
                    id: "trainers",
                    label: "Trainer Management",
                    icon: UserPlus,
                  },
                  { id: "profile", label: "Profile Management", icon: User },
                  {
                    id: "analytics",
                    label: "Analytics & Reports",
                    icon: PieChart,
                  },
                  {
                    id: "notifications",
                    label: "Notifications/Approvals",
                    icon: Bell,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 🛠️
              </h2>
              <p className="text-lg text-gray-600">
                Manage your learning platform and monitor system performance.
              </p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Students
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.totalStudents}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +12 this month
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Trainers
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.totalTrainers}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +2 this month
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Courses
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {stats.totalCourses}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +3 this month
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Revenue
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${(stats.totalRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +15% this month
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Health & Pending Approvals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      System Health
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Overall Health
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {stats.systemHealth}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${stats.systemHealth}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Active Users</span>
                          <span className="font-semibold">
                            {stats.activeUsers}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Uptime</span>
                          <span className="font-semibold">99.9%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Pending Approvals
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Pending
                        </span>
                        <span className="text-2xl font-bold text-yellow-600">
                          {stats.pendingApprovals}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium">
                            Course Approvals
                          </span>
                          <span className="text-sm text-yellow-600">3</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <span className="text-sm font-medium">
                            User Registrations
                          </span>
                          <span className="text-sm text-yellow-600">5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Finance Module Tab */}
            {activeTab === "finance" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Finance Module
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Revenue Overview
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Revenue
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${(stats.totalRevenue || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Monthly Revenue
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${(stats.monthlyRevenue || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Growth Rate
                        </span>
                        <span className="font-semibold text-green-600">
                          +15%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Payment Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="font-semibold text-green-600">
                          85%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-semibold text-yellow-600">
                          10%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Failed</span>
                        <span className="font-semibold text-red-600">5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Payments
                    </h4>
                    <div className="space-y-2">
                      {payments.slice(0, 3).map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {payment.studentName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {payment.courseName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${payment.amount}
                            </p>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    User Management
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-white font-semibold text-sm">
                                    {user.firstName.charAt(0)}
                                    {user.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  user.status
                                )}`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-700">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-700">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Course Management Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Course Management
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              course.status
                            )}`}
                          >
                            {course.status}
                          </span>
                        </div>

                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {course.name}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {course.description}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Instructor</span>
                            <span className="font-semibold text-gray-900">
                              {course.instructor}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Enrolled</span>
                            <span className="font-semibold text-gray-900">
                              {course.enrolledStudents}/{course.maxStudents}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Revenue</span>
                            <span className="font-semibold text-gray-900">
                              ${(course.revenue || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                            Manage Course
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trainer Management Tab */}
            {activeTab === "trainers" && <AdminTrainerManagement />}

            {/* Course Management Tab */}
            {activeTab === "courses" && <AdminCourseManagement />}

            {/* Profile Management Tab */}
            {activeTab === "profile" && <AdminProfileManagement />}

            {/* Notifications/Approvals Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Notifications & Approvals
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Approve All
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                        !notification.isRead
                          ? "border-l-4 border-l-red-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            !notification.isRead ? "bg-red-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                  notification.priority
                                )}`}
                              >
                                {notification.priority}
                              </span>
                              <span className="text-sm text-gray-500">
                                {notification.createdAt}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">
                            {notification.message}
                          </p>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                              Approve
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                              Reject
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminDashboard;
