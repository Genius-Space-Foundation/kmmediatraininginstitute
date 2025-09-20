import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Bell,
  Trophy,
  Download,
  MessageCircle,
  Play,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Users,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Target,
  CheckCircle,
  AlertCircle,
  Star,
  BarChart3,
  GraduationCap,
  User,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface Course {
  id: number;
  courseName: string;
  courseDescription: string;
  status: string;
  progress: number;
  nextLesson?: string;
  instructor: string;
  duration: string;
  enrolledDate: string;
}

interface Assignment {
  id: number;
  title: string;
  courseName: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "overdue";
  grade?: number;
  maxScore: number;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: "general" | "course" | "assignment";
  courseName?: string;
  createdAt: string;
  isRead: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  points: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  color: string;
}

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Fetch real data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch student dashboard data with error handling
        const [coursesResponse, assignmentsResponse, announcementsResponse] =
          await Promise.allSettled([
            api.get("/students/dashboard/courses"),
            api.get("/students/dashboard/assignments"),
            api.get("/students/dashboard/announcements"),
          ]);

        // Extract data from settled promises
        const coursesData =
          coursesResponse.status === "fulfilled"
            ? coursesResponse.value.data.courses
            : [];
        const assignmentsData =
          assignmentsResponse.status === "fulfilled"
            ? assignmentsResponse.value.data.assignments
            : [];
        const announcementsData =
          announcementsResponse.status === "fulfilled"
            ? announcementsResponse.value.data.announcements
            : [];

        setCourses(coursesData || []);
        setAssignments(assignmentsData || []);
        setAnnouncements(announcementsData || []);

        // Mock achievements for now (would come from achievements API)
        setAchievements([
          {
            id: 1,
            title: "First Assignment Complete",
            description: "Submitted your first assignment",
            icon: "🎯",
            earnedDate: "2024-02-15",
            points: 50,
          },
          {
            id: 2,
            title: "Week Streak",
            description: "Studied for 7 consecutive days",
            icon: "🔥",
            earnedDate: "2024-03-01",
            points: 100,
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

  const quickActions: QuickAction[] = [
    {
      id: "join-class",
      title: "Join Live Class",
      description: "Attend scheduled live sessions",
      icon: Play,
      action: () => console.log("Join live class"),
      color: "bg-blue-500",
    },
    {
      id: "download-resources",
      title: "Download Resources",
      description: "Access course materials",
      icon: Download,
      action: () => console.log("Download resources"),
      color: "bg-green-500",
    },
    {
      id: "ask-question",
      title: "Ask Question",
      description: "Get help from instructors",
      icon: MessageCircle,
      action: () => console.log("Ask question"),
      color: "bg-purple-500",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "submitted":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      case "graded":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
      case "graded":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Loading your dashboard...
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">KM Media</h1>
                  <p className="text-xs text-gray-500">Learning Platform</p>
                </div>
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
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {announcements.filter((a) => !a.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {announcements.filter((a) => !a.isRead).length}
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
                      {announcements.map((announcement) => (
                        <div
                          key={announcement.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                            !announcement.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                !announcement.isRead
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {announcement.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {announcement.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {announcement.createdAt}
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
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
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
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
                  { id: "overview", label: "Overview", icon: BarChart3 },
                  { id: "courses", label: "My Courses", icon: BookOpen },
                  { id: "assignments", label: "Assignments", icon: FileText },
                  { id: "schedule", label: "Schedule", icon: Calendar },
                  { id: "achievements", label: "Achievements", icon: Trophy },
                  { id: "announcements", label: "Announcements", icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
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
                Welcome back, {user?.firstName}! 👋
              </h2>
              <p className="text-lg text-gray-600">
                Continue your learning journey and track your progress.
              </p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Course Progress Tracker */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Course Progress
                    </h3>
                    <Link
                      to="/courses"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                    >
                      View All
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
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
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {course.courseName}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {course.courseDescription}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-semibold text-gray-900">
                              {course.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          {course.nextLesson && (
                            <p className="text-xs text-gray-500">
                              Next: {course.nextLesson}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={action.action}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`p-3 rounded-lg ${action.color}`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900">
                              {action.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {action.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Upcoming Deadlines
                  </h3>
                  <div className="space-y-4">
                    {assignments.slice(0, 3).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              getStatusColor(assignment.status).split(" ")[1]
                            }`}
                          >
                            {getStatusIcon(assignment.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {assignment.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {assignment.courseName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              assignment.status
                            )}`}
                          >
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* My Courses Tab */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    My Courses
                  </h3>
                  <Link
                    to="/courses"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll in New Course
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
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
                          {course.courseName}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {course.courseDescription}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Instructor</span>
                            <span className="font-semibold text-gray-900">
                              {course.instructor}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-semibold text-gray-900">
                              {course.duration}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-semibold text-gray-900">
                              {course.progress}%
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                            Continue Learning
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

            {/* Assignments Tab */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Assignments
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {assignment.title}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                assignment.status
                              )}`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Course: {assignment.courseName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Max Score</p>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.maxScore} points
                          </p>
                        </div>
                        {assignment.grade !== undefined && (
                          <div>
                            <p className="text-xs text-gray-500">Grade</p>
                            <p className="text-sm font-medium text-gray-900">
                              {assignment.grade}/{assignment.maxScore}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {assignment.status}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            Created: {new Date().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {assignment.status === "pending" && (
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Submit Assignment
                            </button>
                          )}
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center"
                    >
                      <div className="text-4xl mb-4">{achievement.icon}</div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {achievement.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Earned</span>
                        <span className="font-semibold text-gray-900">
                          {achievement.earnedDate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-500">Points</span>
                        <span className="font-semibold text-blue-600">
                          {achievement.points}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Announcements
                </h3>

                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                        !announcement.isRead
                          ? "border-l-4 border-l-blue-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            !announcement.isRead ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {announcement.title}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {announcement.createdAt}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2">
                            {announcement.content}
                          </p>
                          {announcement.courseName && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {announcement.courseName}
                            </span>
                          )}
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

export default StudentDashboard;
