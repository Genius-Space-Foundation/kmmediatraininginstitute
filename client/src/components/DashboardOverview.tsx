import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BookOpen,
  Activity,
  Plus,
  FileText,
  Edit,
  BarChart3,
  Settings,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  completedRegistrations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeUsers: number;
  systemHealth: number;
  totalStories: number;
  publishedStories: number;
  totalComments: number;
  averageRating: number;
  // Enhanced payment stats
  totalPayments?: number;
  successfulPayments?: number;
  failedPayments?: number;
  pendingPayments?: number;
  applicationFees?: number;
  courseFees?: number;
  installmentPayments?: number;
}

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  loading,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const quickActions = [
    {
      title: "Add New Course",
      description: "Create a new course offering",
      icon: Plus,
      color: "bg-blue-500",
      link: "/admin/courses/new",
    },
    {
      title: "Manage Registrations",
      description: "Review and approve applications",
      icon: FileText,
      color: "bg-green-500",
      link: "/admin/registrations",
    },
    {
      title: "Create Story",
      description: "Publish new content",
      icon: Edit,
      color: "bg-purple-500",
      link: "/admin/stories/new",
    },
    {
      title: "View Analytics",
      description: "Detailed reports and insights",
      icon: BarChart3,
      color: "bg-indigo-500",
      link: "/admin/analytics",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                <span className="text-xs sm:text-sm text-green-600">
                  +12.5%
                </span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">
                  from last month
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg ml-3">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Total Registrations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Registrations
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats?.totalRegistrations || 0)}
              </p>
              <div className="flex items-center mt-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1" />
                <span className="text-xs sm:text-sm text-blue-600">+8.2%</span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">
                  from last month
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-lg ml-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Courses
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalCourses || 0}
              </p>
              <div className="flex items-center mt-2">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-1" />
                <span className="text-xs sm:text-sm text-purple-600">+2</span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">
                  new this month
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-lg ml-3">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                System Health
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.systemHealth || 0}%
              </p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                <span className="text-xs sm:text-sm text-green-600 hidden sm:inline">
                  All systems operational
                </span>
                <span className="text-xs sm:text-sm text-green-600 sm:hidden">
                  Operational
                </span>
              </div>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg ml-3">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-responsive-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 group touch-target"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className={`p-2 sm:p-3 rounded-lg ${action.color} bg-opacity-10 flex-shrink-0`}
                >
                  <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Registration Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-responsive-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Registration Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Pending
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.pendingRegistrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Approved
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.approvedRegistrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Rejected
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.rejectedRegistrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Completed
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.completedRegistrations || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-responsive-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Payment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Successful
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.successfulPayments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Pending
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.pendingPayments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">Failed</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.failedPayments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Total Revenue
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalRevenue || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-responsive-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Content Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Total Courses
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.totalCourses || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-purple-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Published Stories
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.publishedStories || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Active Users
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.activeUsers || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-indigo-500 mr-3" />
                <span className="text-gray-700 dark:text-gray-300">
                  Total Comments
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats?.totalComments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
