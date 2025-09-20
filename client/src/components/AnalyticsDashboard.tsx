import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  CreditCard,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Shield,
  Database,
  Server,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Power,
  Sparkles,
  Sun,
  Moon,
  Palette,
  Brush,
  Scissors,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Move3D,
  Box,
  Package,
  Truck,
  ShoppingCart,
  Wallet,
  Banknote,
  Coins,
  PiggyBank,
  TrendingDown as TrendingDownIcon,
  ArrowUp as ArrowUpIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  CornerUpRight,
  CornerDownRight,
  CornerUpLeft,
  CornerDownLeft,
  CornerRightUp,
  CornerRightDown,
  CornerLeftUp,
  CornerLeftDown,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  systemHealth: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
  assignmentGrowth: number;
  lastUpdated: string;
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

interface AnalyticsDashboardProps {
  userType: "student" | "trainer" | "admin";
  data?: AnalyticsData;
  loading?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userType,
  data,
  loading = false,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [showDetails, setShowDetails] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  // Generate sample chart data based on user type
  useEffect(() => {
    if (userType === "student") {
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
    } else if (userType === "trainer") {
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
      });
    } else {
      setChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Course Enrollments",
            data: [5, 8, 3, 12, 6, 2, 9],
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 1)",
            fill: true,
          },
          {
            label: "Revenue",
            data: [1200, 1500, 800, 2000, 1100, 600, 1800],
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderColor: "rgba(34, 197, 94, 1)",
            fill: true,
          },
        ],
      });
    }
  }, [userType]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "users":
        return <Users className="h-5 w-5" />;
      case "courses":
        return <BookOpen className="h-5 w-5" />;
      case "revenue":
        return <CreditCard className="h-5 w-5" />;
      case "assignments":
        return <Activity className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case "users":
        return "text-blue-600 bg-blue-100";
      case "courses":
        return "text-purple-600 bg-purple-100";
      case "revenue":
        return "text-green-600 bg-green-100";
      case "assignments":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (growth < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) {
      return "text-green-600";
    } else if (growth < 0) {
      return "text-red-600";
    }
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600">
              {userType === "student" &&
                "Track your learning progress and performance"}
              {userType === "trainer" &&
                "Monitor your teaching effectiveness and student engagement"}
              {userType === "admin" &&
                "Comprehensive system analytics and insights"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {showDetails ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {["overview", "users", "courses", "revenue", "assignments"].map(
            (metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {getMetricIcon(metric)}
                  <span className="capitalize">{metric}</span>
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users/Courses Metric */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {userType === "admin" ? "Total Users" : "My Courses"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.totalUsers || data?.totalCourses || 0}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(data?.userGrowth || data?.courseGrowth || 0)}
                <span
                  className={`text-sm ml-1 ${getGrowthColor(
                    data?.userGrowth || data?.courseGrowth || 0
                  )}`}
                >
                  {Math.abs(data?.userGrowth || data?.courseGrowth || 0)}%
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${getMetricColor("users")}`}>
              {getMetricIcon("users")}
            </div>
          </div>
        </div>

        {/* Active Users/Courses Metric */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {userType === "admin" ? "Active Users" : "Active Courses"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data?.activeUsers || data?.activeCourses || 0}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(data?.userGrowth || data?.courseGrowth || 0)}
                <span
                  className={`text-sm ml-1 ${getGrowthColor(
                    data?.userGrowth || data?.courseGrowth || 0
                  )}`}
                >
                  {Math.abs(data?.userGrowth || data?.courseGrowth || 0)}%
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${getMetricColor("courses")}`}>
              {getMetricIcon("courses")}
            </div>
          </div>
        </div>

        {/* Revenue Metric */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {userType === "admin" ? "Total Revenue" : "Total Spent"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${(data?.totalRevenue || 0).toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(data?.revenueGrowth || 0)}
                <span
                  className={`text-sm ml-1 ${getGrowthColor(
                    data?.revenueGrowth || 0
                  )}`}
                >
                  {Math.abs(data?.revenueGrowth || 0)}%
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-full ${getMetricColor("revenue")}`}>
              {getMetricIcon("revenue")}
            </div>
          </div>
        </div>

        {/* Assignments Metric */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {userType === "admin" ? "System Health" : "Assignments"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {userType === "admin"
                  ? `${data?.systemHealth || 0}%`
                  : data?.totalAssignments || 0}
              </p>
              <div className="flex items-center mt-1">
                {userType === "admin" ? (
                  <Shield className="h-4 w-4 text-green-600" />
                ) : (
                  getGrowthIcon(data?.assignmentGrowth || 0)
                )}
                <span
                  className={`text-sm ml-1 ${getGrowthColor(
                    data?.assignmentGrowth || 0
                  )}`}
                >
                  {userType === "admin"
                    ? "Healthy"
                    : `${Math.abs(data?.assignmentGrowth || 0)}%`}
                </span>
              </div>
            </div>
            <div
              className={`p-3 rounded-full ${getMetricColor("assignments")}`}
            >
              {userType === "admin" ? (
                <Shield className="h-5 w-5" />
              ) : (
                getMetricIcon("assignments")
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {userType === "student" && "Study Progress"}
              {userType === "trainer" && "Teaching Activity"}
              {userType === "admin" && "System Overview"}
            </h3>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Chart visualization will be implemented with Chart.js</p>
              <p className="text-sm text-gray-400 mt-1">
                Data: {chartData?.datasets.length || 0} datasets,{" "}
                {chartData?.labels.length || 0} data points
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Grade</span>
              <span className="text-sm font-medium text-gray-900">
                {data?.averageGrade || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Completed Assignments
              </span>
              <span className="text-sm font-medium text-gray-900">
                {data?.completedAssignments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium text-gray-900">
                {data?.lastUpdated || "Never"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Status</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics (if enabled) */}
      {showDetails && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900">Goals</h4>
              <p className="text-sm text-gray-600">
                Track your learning objectives
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Achievements</h4>
              <p className="text-sm text-gray-600">Celebrate your milestones</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Ratings</h4>
              <p className="text-sm text-gray-600">
                View your performance ratings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
