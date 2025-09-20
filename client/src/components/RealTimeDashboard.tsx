import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  Download,
  Filter,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Share2,
  ExternalLink,
} from "lucide-react";

interface RealTimeStats {
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

interface NotificationItem {
  id: string;
  type: "assignment" | "grade" | "payment" | "course" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

const RealTimeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealTimeStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Real-time data fetching
  const fetchRealTimeData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      const response = await api.get("/students/dashboard/realtime");
      const data = response.data.data;

      setStats({
        timestamp: Date.now(),
        totalCourses: data.totalCourses || 0,
        activeCourses: data.activeCourses || 0,
        completedCourses: data.completedCourses || 0,
        totalAssignments: data.totalAssignments || 0,
        pendingAssignments: data.pendingAssignments || 0,
        submittedAssignments: data.submittedAssignments || 0,
        gradedAssignments: data.gradedAssignments || 0,
        totalPayments: data.totalPayments || 0,
        pendingPayments: data.pendingPayments || 0,
        completedPayments: data.completedPayments || 0,
        averageGrade: data.averageGrade || 0,
        studyStreak: data.studyStreak || 0,
        lastActivity: data.lastActivity || "No recent activity",
        notifications: data.notifications || 0,
        systemStatus: data.systemStatus || "online",
      });

      setLastUpdate(new Date());

      // Generate chart data
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
      });
    } catch (err: any) {
      console.error("Error fetching real-time data:", err);
      setError(err.response?.data?.message || "Failed to fetch data");
      toast.error("Failed to update dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/students/notifications");
      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isOnline) return;

    const interval = setInterval(fetchRealTimeData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRealTimeData, isOnline]);

  // Initial data fetch
  useEffect(() => {
    fetchRealTimeData();
    fetchNotifications();
  }, [fetchRealTimeData, fetchNotifications]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchRealTimeData();
      toast.success("Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchRealTimeData]);

  // Manual refresh
  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchRealTimeData();
    await fetchNotifications();
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/students/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Refresh interval */}
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
                disabled={!autoRefresh}
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={300000}>5m</option>
              </select>

              {/* Manual refresh */}
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.priority === "high"
                                    ? "bg-red-500"
                                    : notification.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              ></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    notification.timestamp
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Last update time */}
              {lastUpdate && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-400">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Courses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalCourses}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {stats.activeCourses} active
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Assignments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalAssignments}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {stats.pendingAssignments} pending
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPayments}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {stats.completedPayments} completed
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Grade
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageGrade.toFixed(1)}%
                  </p>
                  <p className="text-sm text-purple-600 flex items-center mt-1">
                    <Award className="h-4 w-4 mr-1" />
                    {stats.studyStreak} day streak
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Study Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Study Progress
              </h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Chart visualization will be implemented with Chart.js</p>
              </div>
            </div>
          </div>

          {/* Activity Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.lastActivity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <span
                  className={`text-sm font-medium ${
                    stats?.systemStatus === "online"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stats?.systemStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Unread Notifications
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.notifications}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Browse Courses
              </span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                View Assignments
              </span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CreditCard className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Make Payment
              </span>
            </button>
            <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                Settings
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
