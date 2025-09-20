import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  MessageCircle,
  Upload,
  FileText,
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
  Play,
  Download,
  Star,
  Target,
  AlertCircle,
  ChevronRight,
  Activity,
  Bookmark,
  ClipboardList,
  MessageSquare,
  Send,
  Video,
  Mic,
  Camera,
  Share2,
} from "lucide-react";

interface Course {
  id: number;
  name: string;
  description: string;
  enrolledStudents: number;
  maxStudents: number;
  status: "active" | "inactive";
  nextSession?: string;
  instructor: string;
  duration: string;
  createdAt: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  courseName: string;
  progress: number;
  status: "active" | "completed" | "pending";
  lastActivity: string;
  attendance: number;
}

interface Session {
  id: number;
  title: string;
  courseName: string;
  startTime: string;
  endTime: string;
  type: "live" | "recorded" | "assignment";
  status: "upcoming" | "ongoing" | "completed";
  attendees: number;
  maxAttendees: number;
}

interface Assignment {
  id: number;
  title: string;
  courseName: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  averageGrade: number;
  status: "draft" | "published" | "closed";
}

interface Message {
  id: number;
  from: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
}

const TrainerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Data states
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch real data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch trainer dashboard data with error handling
        const [
          dashboardResponse,
          coursesResponse,
          studentsResponse,
          sessionsResponse,
          assignmentsResponse,
        ] = await Promise.allSettled([
          api.get("/trainers/dashboard"),
          api.get("/trainers/courses"),
          api.get("/trainers/students"),
          api.get("/trainers/sessions"),
          api.get("/trainers/assignments"),
        ]);

        // Extract data from settled promises
        const coursesData =
          coursesResponse.status === "fulfilled"
            ? coursesResponse.value.data.courses
            : [];
        const studentsData =
          studentsResponse.status === "fulfilled"
            ? studentsResponse.value.data.students
            : [];
        const sessionsData =
          sessionsResponse.status === "fulfilled"
            ? sessionsResponse.value.data.sessions
            : [];
        const assignmentsData =
          assignmentsResponse.status === "fulfilled"
            ? assignmentsResponse.value.data.assignments
            : [];

        setCourses(coursesData || []);
        setStudents(studentsData || []);
        setSessions(sessionsData || []);
        setAssignments(assignmentsData || []);

        // Mock messages for now (would come from messages API)
        setMessages([
          {
            id: 1,
            from: "Alice Johnson",
            subject: "Question about CSS Grid",
            content: "I'm having trouble understanding CSS Grid layout...",
            timestamp: "2024-03-10T09:30:00Z",
            isRead: false,
            priority: "medium",
          },
          {
            id: 2,
            from: "Bob Smith",
            subject: "Assignment Submission Issue",
            content: "I'm unable to submit my assignment...",
            timestamp: "2024-03-09T15:45:00Z",
            isRead: true,
            priority: "high",
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
      case "published":
      case "upcoming":
        return "text-green-600 bg-green-50 border-green-200";
      case "inactive":
      case "draft":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "completed":
      case "closed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "ongoing":
        return "text-purple-600 bg-purple-50 border-purple-200";
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
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Trainer Portal
                  </h1>
                  <p className="text-xs text-gray-500">
                    Professional Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {messages.filter((m) => !m.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {messages.filter((m) => !m.isRead).length}
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
                      {messages.slice(0, 3).map((message) => (
                        <div
                          key={message.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                            !message.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                !message.isRead ? "bg-blue-500" : "bg-gray-300"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {message.subject}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {message.from}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {message.timestamp}
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
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
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
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
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
                  { id: "courses", label: "Course Management", icon: BookOpen },
                  { id: "students", label: "Student Analytics", icon: Users },
                  {
                    id: "sessions",
                    label: "Upcoming Sessions",
                    icon: Calendar,
                  },
                  {
                    id: "assignments",
                    label: "Evaluation Tools",
                    icon: FileText,
                  },
                  {
                    id: "messages",
                    label: "Communication Hub",
                    icon: MessageCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === item.id
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
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
                Welcome back, {user?.firstName}! 👨‍🏫
              </h2>
              <p className="text-lg text-gray-600">
                Manage your courses and track student progress.
              </p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Teaching Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Total Courses
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {courses.length}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +2 this month
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Active Students
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {students.length}
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +5 this week
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Sessions Today
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {
                            sessions.filter((s) => s.status === "upcoming")
                              .length
                          }
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          Next in 2 hours
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Pending Grading
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {assignments.reduce(
                            (acc, a) => acc + a.submissions,
                            0
                          )}
                        </p>
                        <p className="text-sm text-yellow-600 mt-1">
                          Needs attention
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">
                          Upload Materials
                        </h4>
                        <p className="text-sm text-gray-600">
                          Add course resources
                        </p>
                      </div>
                    </button>

                    <button className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">
                          Start Live Session
                        </h4>
                        <p className="text-sm text-gray-600">Begin teaching</p>
                      </div>
                    </button>

                    <button className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                      <div className="p-3 bg-purple-500 rounded-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">
                          Create Assignment
                        </h4>
                        <p className="text-sm text-gray-600">Add new task</p>
                      </div>
                    </button>

                    <button className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                      <div className="p-3 bg-yellow-500 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">
                          Send Message
                        </h4>
                        <p className="text-sm text-gray-600">
                          Contact students
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Recent Students
                    </h3>
                    <div className="space-y-4">
                      {students.slice(0, 5).map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {student.firstName.charAt(0)}
                              {student.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {student.courseName}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">
                                {student.progress}%
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              student.status
                            )}`}
                          >
                            {student.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Upcoming Sessions
                    </h3>
                    <div className="space-y-4">
                      {sessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {session.title}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                session.status
                              )}`}
                            >
                              {session.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {session.courseName}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                              {new Date(session.startTime).toLocaleDateString()}
                            </span>
                            <span>
                              {new Date(session.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center">
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
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
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
                            <span className="text-gray-500">Enrolled</span>
                            <span className="font-semibold text-gray-900">
                              {course.enrolledStudents}/{course.maxStudents}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Duration</span>
                            <span className="font-semibold text-gray-900">
                              {course.duration}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Next Session</span>
                            <span className="font-semibold text-gray-900">
                              {course.nextSession
                                ? new Date(
                                    course.nextSession
                                  ).toLocaleDateString()
                                : "TBD"}
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (course.enrolledStudents / course.maxStudents) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
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

            {/* Student Analytics Tab */}
            {activeTab === "students" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Student Analytics
                  </h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Activity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr
                            key={student.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-white font-semibold text-sm">
                                    {student.firstName.charAt(0)}
                                    {student.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {student.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                {student.courseName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                    style={{ width: `${student.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">
                                  {student.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">
                                {student.attendance}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                student.lastActivity
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-700">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="text-purple-600 hover:text-purple-700">
                                  <MessageCircle className="h-4 w-4" />
                                </button>
                                <button className="text-gray-600 hover:text-gray-700">
                                  <MoreHorizontal className="h-4 w-4" />
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

            {/* Upcoming Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Upcoming Sessions
                  </h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>
                      </div>

                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {session.title}
                      </h4>
                      <p className="text-gray-600 mb-4">{session.courseName}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Start Time</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(session.startTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">End Time</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(session.endTime).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Attendees</span>
                          <span className="font-semibold text-gray-900">
                            {session.attendees}/{session.maxAttendees}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          Start Session
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluation Tools Tab */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Evaluation Tools
                  </h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </button>
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
                          <p className="text-xs text-gray-500">Submissions</p>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.submissions}/{assignment.totalStudents}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Average Grade</p>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.averageGrade}%
                          </p>
                        </div>
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
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            Grade Submissions
                          </button>
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

            {/* Communication Hub Tab */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Communication Hub
                  </h3>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>

                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
                        !message.isRead ? "border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            !message.isRead ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {message.subject}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                  message.priority
                                )}`}
                              >
                                {message.priority}
                              </span>
                              <span className="text-sm text-gray-500">
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">
                            From: {message.from}
                          </p>
                          <p className="text-gray-700 mb-4">
                            {message.content}
                          </p>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Reply
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                              Mark as Read
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

export default TrainerDashboard;
