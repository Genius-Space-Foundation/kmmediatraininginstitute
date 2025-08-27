import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  TrendingUp,
  User,
  FileText,
  CreditCard,
  Bell,
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  LogOut,
  Menu,
  Filter,
  MoreHorizontal,
  Edit,
  GraduationCap,
  DollarSign,
  Home,
  Calendar,
  BarChart3,
  Target,
  Plus,
  Search,
  ChevronRight,
} from "lucide-react";

interface Course {
  id: number;
  courseName: string;
  courseDescription: string;
  status: string;
  createdAt: string;
  courseId: number;
}

interface Payment {
  id: number;
  courseName: string;
  amount: string;
  status: string;
  createdAt: string;
  reference: string;
}

interface DashboardStats {
  totalRegistrations: number;
  activeRegistrations: number;
  pendingRegistrations: number;
  completedRegistrations: number;
  totalSpent: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  dateOfBirth: string;
  profileImage?: string | null;
}

const ModernStudentDashboard: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Real data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: "Passionate student learning web development and modern technologies.",
    dateOfBirth: "1995-06-15",
    profileImage: user?.profileImage || null,
  });

  // Initialize profile image from user data
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch overview data
      const overviewResponse = await api.get("/students/dashboard/overview");
      const overviewData = overviewResponse.data.data;

      setStats(overviewData.stats);
      setCourses(overviewData.recentRegistrations);
      setPayments(overviewData.recentPayments);

      // Fetch profile data
      const profileResponse = await api.get("/students/profile");
      const userData = profileResponse.data.data.user;

      setProfileData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        bio: "Passionate student learning web development and modern technologies.",
        dateOfBirth: "1995-06-15",
        profileImage: userData.profileImage || null,
      });

      // Set profile image from user data
      if (userData.profileImage) {
        setProfileImage(userData.profileImage);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".notifications-dropdown")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
      case "successful":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "overdue":
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleProfileImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setProfileData((prev) => ({
          ...prev,
          profileImage: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      await api.put("/auth/profile", {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        profileImage: profileImage, // Include the profile image
      });

      toast.success("Profile updated successfully!");
      setEditMode(false);

      // Refresh user data in AuthContext
      await refreshUser();

      // Refresh dashboard data to get updated profile
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            Loading your dashboard...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Preparing your learning experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">KM Media</h1>
                  <p className="text-xs text-gray-500">Learning Platform</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  to="/courses"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Courses
                </Link>
                <Link
                  to="/stories"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  Stories
                </Link>
                <Link
                  to="/about"
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
                >
                  About Us
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white/50 backdrop-blur-sm transition-all"
                />
              </div>

              {/* Notifications */}
              <div className="relative notifications-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {/* Assuming notifications are fetched from the API or state */}
                  {/* For now, we'll keep a placeholder for notifications */}
                  {/* {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )} */}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Placeholder for notifications */}
                      <div className="p-4 text-center text-gray-500">
                        No notifications available
                      </div>
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
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
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header with Toggle */}
            <div className="p-4 border-b border-gray-100 lg:hidden">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Card */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                    <span className="text-xs text-emerald-600 font-medium">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-2">
                {[
                  {
                    id: "overview",
                    label: "Overview",
                    icon: Home,
                    badge: null,
                  },
                  {
                    id: "courses",
                    label: "My Courses",
                    icon: BookOpen,
                    badge: courses.filter((c) => c.status === "approved")
                      .length,
                  },
                  {
                    id: "assignments",
                    label: "Assignments",
                    icon: FileText,
                    badge: null,
                  },
                  {
                    id: "progress",
                    label: "Progress",
                    icon: TrendingUp,
                    badge: null,
                  },
                  {
                    id: "achievements",
                    label: "Achievements",
                    icon: GraduationCap,
                    badge: null,
                  },
                  {
                    id: "materials",
                    label: "Materials",
                    icon: DollarSign,
                    badge: null,
                  },
                  {
                    id: "payments",
                    label: "Payments",
                    icon: CreditCard,
                    badge: null,
                  },
                  {
                    id: "profile",
                    label: "Profile",
                    icon: User,
                    badge: null,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            activeTab === item.id
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                        {item.label}
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            activeTab === item.id
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-responsive-2xl sm:text-responsive-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.firstName}! 👋
                  </h2>
                  <p className="text-responsive-base sm:text-lg text-gray-600">
                    Continue your learning journey and track your progress.
                  </p>
                </div>
                <div className="flex sm:hidden items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Today's Goal
                    </p>
                    <p className="text-xl font-bold text-blue-600">2 hours</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Today's Goal
                    </p>
                    <p className="text-2xl font-bold text-blue-600">2 hours</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    {
                      title: "Total Registrations",
                      value: stats?.totalRegistrations || 0,
                      icon: BookOpen,
                      color: "blue",
                      change: "All time",
                    },
                    {
                      title: "Active Courses",
                      value: stats?.activeRegistrations || 0,
                      icon: BookOpen,
                      color: "emerald",
                      change: "Currently enrolled",
                    },
                    {
                      title: "Pending Applications",
                      value: stats?.pendingRegistrations || 0,
                      icon: FileText,
                      color: "amber",
                      change: "Awaiting approval",
                    },
                    {
                      title: "Total Spent",
                      value: `₵${stats?.totalSpent || "0.00"}`,
                      icon: DollarSign,
                      color: "purple",
                      change: "All payments",
                    },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.title}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                              {stat.title}
                            </p>
                            <p className="text-xl sm:text-3xl font-bold text-gray-900">
                              {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {stat.change}
                            </p>
                          </div>
                          <div
                            className={`p-2 sm:p-3 rounded-xl bg-${stat.color}-100 ml-3 flex-shrink-0`}
                          >
                            <Icon
                              className={`h-5 w-5 sm:h-6 sm:w-6 text-${stat.color}-600`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current Courses */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Current Courses
                    </h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {courses
                      .filter((c) => c.status === "approved")
                      .map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/20 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {course.courseName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {course.courseDescription}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {course.status}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {course.createdAt}
                            </p>
                            <p className="text-xs text-gray-500">
                              Enrolled: {course.createdAt}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recent Activity & Notifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activity */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {/* Placeholder for recent activity */}
                      <div className="p-4 text-center text-gray-500">
                        No recent activity data available
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-4">
                      {/* Placeholder for upcoming deadlines */}
                      <div className="p-4 text-center text-gray-500">
                        No upcoming deadlines data available
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    My Courses
                  </h3>
                  <Link
                    to="/courses"
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll in New Course
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              course.status
                            )}`}
                          >
                            {course.status}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {course.courseName}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                          {course.courseDescription}
                        </p>

                        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Enrolled:{" "}
                            {new Date(course.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Status: {course.status}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            to={`/student/courses/${course.courseId}`}
                            className="flex-1 bg-blue-600 text-white py-2 sm:py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium text-center touch-target"
                          >
                            <span className="hidden sm:inline">
                              View Course
                            </span>
                            <span className="sm:hidden">View</span>
                          </Link>
                          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors touch-target">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No Courses Enrolled
                      </h4>
                      <p className="text-gray-600 mb-4">
                        You haven't enrolled in any courses yet. Start your
                        learning journey today!
                      </p>
                      <Link
                        to="/courses"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Assignments
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Placeholder for assignments */}
                  <div className="p-4 text-center text-gray-500">
                    No assignments data available
                  </div>
                </div>
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Learning Progress
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Overall Progress */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Overall Progress
                    </h4>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <svg
                            className="w-32 h-32 transform -rotate-90"
                            viewBox="0 0 120 120"
                          >
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                            />
                            <circle
                              cx="60"
                              cy="60"
                              r="54"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 54}`}
                              strokeDashoffset={`${
                                2 * Math.PI * 54 * (1 - 0.68)
                              }`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">
                              68%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          Overall completion rate
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Study Statistics */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Study Statistics
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total Study Hours
                        </span>
                        <span className="font-semibold text-gray-900">24h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">This Week</span>
                        <span className="font-semibold text-gray-900">8h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Average Grade
                        </span>
                        <span className="font-semibold text-gray-900">92%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Assignments Completed
                        </span>
                        <span className="font-semibold text-gray-900">12</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Progress Details */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Course Progress Details
                  </h4>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 bg-white/50 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {course.courseName}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {course.courseDescription}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              0%
                            </span>
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
                                style={{ width: "0%" }}
                              ></div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {course.createdAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Achievements
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Placeholder for achievements */}
                  <div className="p-4 text-center text-gray-500">
                    No achievements data available
                  </div>
                </div>
              </div>
            )}

            {/* Materials Tab */}
            {activeTab === "materials" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Learning Materials
                  </h3>
                  <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Course
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Placeholder for materials */}
                  <div className="p-4 text-center text-gray-500">
                    No materials data available
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Payment History
                </h3>

                <div className="space-y-4">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                              <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {payment.courseName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Reference: {payment.reference}
                              </p>
                              <p className="text-xs text-gray-500">
                                Date:{" "}
                                {new Date(
                                  payment.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ₵{payment.amount}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No Payment History
                      </h4>
                      <p className="text-gray-600 mb-4">
                        You haven't made any payments yet. Enroll in a course to
                        get started!
                      </p>
                      <Link
                        to="/courses"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Profile Settings
                  </h3>
                  <div className="flex space-x-2">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleProfileSave}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Picture */}
                  <div className="lg:col-span-1">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 text-center">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          {profileImage || user?.profileImage ? (
                            <img
                              src={profileImage || user?.profileImage}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-16 w-16 text-white" />
                          )}
                        </div>
                        {editMode && (
                          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            <Edit className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {profileData.firstName} {profileData.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {profileData.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="lg:col-span-2">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={profileData.firstName}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900">
                              {profileData.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={profileData.lastName}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900">
                              {profileData.lastName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          {editMode ? (
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900">{profileData.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          {editMode ? (
                            <input
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900">{profileData.phone}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          {editMode ? (
                            <input
                              type="text"
                              value={profileData.address}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  address: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900">
                              {profileData.address}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          {editMode ? (
                            <textarea
                              value={profileData.bio}
                              onChange={(e) =>
                                setProfileData((prev) => ({
                                  ...prev,
                                  bio: e.target.value,
                                }))
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900">{profileData.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">KM Media</h1>
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <Link
              to="/"
              onClick={() => setShowMobileMenu(false)}
              className="block text-gray-600 hover:text-blue-600 transition-colors text-lg font-medium py-2"
            >
              Home
            </Link>
            <Link
              to="/courses"
              onClick={() => setShowMobileMenu(false)}
              className="block text-gray-600 hover:text-blue-600 transition-colors text-lg font-medium py-2"
            >
              Courses
            </Link>
            <Link
              to="/stories"
              onClick={() => setShowMobileMenu(false)}
              className="block text-gray-600 hover:text-blue-600 transition-colors text-lg font-medium py-2"
            >
              Stories
            </Link>
            <Link
              to="/about"
              onClick={() => setShowMobileMenu(false)}
              className="block text-gray-600 hover:text-blue-600 transition-colors text-lg font-medium py-2"
            >
              About Us
            </Link>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
                className="w-full bg-red-600 text-white py-2 rounded-xl hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ModernStudentDashboard;
