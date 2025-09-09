import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaUser,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPlus,
  FaEdit,
  FaEye,
  FaCheck,
  FaClock,
  FaGraduationCap,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaDownload,
  FaBell,
  FaSearch,
  FaSync,
  FaFileAlt,
  FaTasks,
  FaQuestionCircle,
  FaInbox,
  FaUpload,
  FaFileUpload,
  FaClipboardList,
} from "react-icons/fa";

interface TrainerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  specialization?: string;
  bio?: string;
  experience?: number;
  hourlyRate?: number;
  availability?: string;
}

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  maxStudents: number;
  enrolledStudents: number;
  completedStudents: number;
  status: "active" | "inactive";
  startDate: string;
  endDate: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  courseName: string;
  duration: string;
  status: "pending" | "active" | "completed" | "cancelled";
  registrationDate: string;
  progress: number;
}

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  pendingStudents: number;
  monthlyRevenue: number;
}

interface CourseMaterial {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  fileName: string;
  module?: string;
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  assignmentType: "individual" | "group";
  instructions?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  isActive: boolean;
  allowLateSubmission: boolean;
  latePenalty: number;
  submissionCount: number;
  submittedCount: number;
  lateCount: number;
  missingCount: number;
  createdAt: string;
  courseName: string;
  courseId: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  timeLimit?: number;
  attemptsAllowed: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  totalQuestions: number;
  totalPoints: number;
  attemptCount: number;
  studentCount: number;
  createdAt: string;
}

interface StudentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  submissionDate: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submissionText?: string;
  grade?: number;
  feedback?: string;
  status: "submitted" | "late" | "missing" | "graded";
  isLate: boolean;
  latePenaltyApplied: number;
  gradedBy?: number;
  gradedAt?: string;
  firstName: string;
  lastName: string;
  email: string;
  assignmentTitle: string;
  dueDate: string;
  maxScore: number;
  courseName: string;
  courseId: number;
}

const TrainerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    pendingStudents: 0,
    monthlyRevenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        profileRes,
        coursesRes,
        studentsRes,
        statsRes,
        assignmentsRes,
        quizzesRes,
        submissionsRes,
        materialsRes,
      ] = await Promise.all([
        api.get("/trainers/profile"),
        api.get("/trainers/courses"),
        api.get("/trainers/students"),
        api.get("/trainers/dashboard"),
        api.get("/trainers/assignments"),
        api.get("/trainers/quizzes"),
        api.get("/trainers/submissions"),
        api.get("/trainers/materials"),
      ]);

      setProfile(profileRes.data.profile || {});
      setCourses(coursesRes.data.courses || []);
      setStudents(studentsRes.data.students || []);
      setStats(statsRes.data.stats || {});
      setAssignments(assignmentsRes.data.assignments || []);
      setQuizzes(quizzesRes.data.quizzes || []);
      setSubmissions(submissionsRes.data.submissions || []);
      setMaterials(materialsRes.data.materials || []);
      setLastUpdated(new Date());
      // Only show success toast for manual refresh, not auto-refresh
      if (refreshing) {
        toast.success("Dashboard data updated successfully");
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load dashboard data";
      toast.error(errorMessage);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  // Refresh data when tab changes - removed to prevent excessive API calls
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Don't automatically refresh on tab change to prevent rate limiting
  };

  // Auto-refresh data every 60 seconds (increased from 30 to reduce rate limiting)
  useEffect(() => {
    if (!user) return; // Don't start interval if user is not authenticated

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Auto-refresh assignments and submissions every 30 seconds when their tabs are active
  useEffect(() => {
    if (!user || (activeTab !== "assignments" && activeTab !== "submissions"))
      return;

    const interval = setInterval(() => {
      // Only refresh specific data when on relevant tabs
      if (activeTab === "assignments") {
        api
          .get("/trainers/assignments")
          .then((response) => {
            setAssignments(response.data.assignments || []);
          })
          .catch((error) => {
            console.error("Error refreshing assignments:", error);
          });
      }
      if (activeTab === "submissions") {
        api
          .get("/trainers/submissions")
          .then((response) => {
            setSubmissions(response.data.submissions || []);
          })
          .catch((error) => {
            console.error("Error refreshing submissions:", error);
          });
      }
    }, 30000); // 30 seconds for specific tabs

    return () => clearInterval(interval);
  }, [activeTab, user]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+R or F5 to refresh
      if ((event.ctrlKey && event.key === "r") || event.key === "F5") {
        event.preventDefault();
        handleManualRefresh();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "courses", label: "My Courses", icon: FaBook },
    { id: "materials", label: "Materials", icon: FaFileAlt },
    { id: "assignments", label: "Assignments", icon: FaTasks },
    { id: "quizzes", label: "Quizzes", icon: FaQuestionCircle },
    { id: "submissions", label: "Submissions", icon: FaInbox },
    { id: "students", label: "My Students", icon: FaUsers },
    { id: "analytics", label: "Analytics", icon: FaChartBar },
    { id: "profile", label: "Profile", icon: FaUser },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="mt-8 text-xl font-semibold text-slate-900">
            Loading Dashboard
          </h3>
          <p className="mt-2 text-slate-600">
            Please wait while we prepare your workspace
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex lg:flex-row flex-col">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:w-72 lg:flex-shrink-0 lg:min-h-screen ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Trainer Portal
              </h2>
              <p className="text-sm text-slate-600">Professional Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <FaTimes className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {profile?.firstName?.charAt(0)}
                {profile?.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {profile?.firstName} {profile?.lastName}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {profile?.email}
                {refreshing && (
                  <span className="ml-1 text-blue-600">• Updating</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-0 flex-1 min-w-0">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <FaBars className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {sidebarItems.find((item) => item.id === activeTab)?.label}
                </h1>
                <p className="text-slate-600">
                  Welcome back, {profile?.firstName}! Here's what's happening
                  today.
                  {lastUpdated && (
                    <span className="block text-xs text-slate-500 mt-1">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                      {refreshing && (
                        <span className="ml-2 text-blue-600">
                          • Updating...
                        </span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManualRefresh}
                disabled={loading || refreshing}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <FaSync
                  className={`w-5 h-5 text-slate-600 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 relative">
                <FaBell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {profile?.firstName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Total Courses
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {refreshing ? "..." : stats.totalCourses}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-emerald-600">
                        <FaArrowUp className="w-3 h-3 mr-1" />
                        <span>+12% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                      <FaBook className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Total Students
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {refreshing ? "..." : stats.totalStudents}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-emerald-600">
                        <FaArrowUp className="w-3 h-3 mr-1" />
                        <span>+8% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                      <FaUsers className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Active Students
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        {refreshing ? "..." : stats.activeStudents}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-blue-600">
                        <FaArrowUp className="w-3 h-3 mr-1" />
                        <span>+15% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                      <FaGraduationCap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Monthly Revenue
                      </p>
                      <p className="text-3xl font-bold text-slate-900">
                        ${refreshing ? "..." : stats.monthlyRevenue}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-emerald-600">
                        <FaArrowUp className="w-3 h-3 mr-1" />
                        <span>+22% from last month</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl">
                      <FaChartBar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-slate-600">
                    Get things done faster
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => navigate("/trainer/profile/edit")}
                    className="flex items-center space-x-4 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-200"
                  >
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                      <FaEdit className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-emerald-900 block">
                        Update Profile
                      </span>
                      <span className="text-sm text-emerald-700">
                        Edit your information
                      </span>
                    </div>
                  </button>

                  <button className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                      <FaCalendarAlt className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-purple-900 block">
                        Schedule Session
                      </span>
                      <span className="text-sm text-purple-700">
                        Book a training session
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                      Recent Students
                    </h3>
                    <button
                      onClick={() => setActiveTab("students")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(students || []).slice(0, 5).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {student.firstName.charAt(0)}
                            {student.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {student.courseName}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            student.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : student.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                      Course Performance
                    </h3>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-6">
                    {(courses || []).slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="p-6 bg-slate-50 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-slate-900">
                            {course.name}
                          </h4>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              course.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
                          <span>
                            {course.enrolledStudents}/{course.maxStudents}{" "}
                            students
                          </span>
                          <span className="flex items-center font-semibold text-emerald-600">
                            <FaStar className="w-3 h-3 mr-1" />
                            4.8
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                (course.enrolledStudents / course.maxStudents) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Enrollment Progress</span>
                          <span className="font-semibold">
                            {Math.round(
                              (course.enrolledStudents / course.maxStudents) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      {profile?.firstName?.charAt(0)}
                      {profile?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {profile?.firstName} {profile?.lastName}
                    </h2>
                    <p className="text-blue-100 text-lg mb-4">
                      {profile?.specialization}
                    </p>
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center text-sm">
                        <FaEnvelope className="w-4 h-4 mr-2" />
                        {profile?.email}
                      </span>
                      {profile?.phone && (
                        <span className="flex items-center text-sm">
                          <FaPhone className="w-4 h-4 mr-2" />
                          {profile.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Full Name
                        </label>
                        <p className="text-lg text-slate-900 font-medium">
                          {profile?.firstName} {profile?.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="w-4 h-4 text-slate-400" />
                          <p className="text-lg text-slate-900">
                            {profile?.email}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Phone Number
                        </label>
                        <div className="flex items-center space-x-2">
                          <FaPhone className="w-4 h-4 text-slate-400" />
                          <p className="text-lg text-slate-900">
                            {profile?.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Address
                        </label>
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="w-4 h-4 text-slate-400" />
                          <p className="text-lg text-slate-900">
                            {profile?.address || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Specialization
                        </label>
                        <p className="text-lg text-slate-900 font-medium">
                          {profile?.specialization || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Experience
                        </label>
                        <p className="text-lg text-slate-900">
                          {profile?.experience || 0} years
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Hourly Rate
                        </label>
                        <p className="text-lg text-slate-900 font-semibold text-emerald-600">
                          ${profile?.hourlyRate || 0}/hour
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-600 block mb-2">
                          Availability
                        </label>
                        <p className="text-lg text-slate-900">
                          {profile?.availability || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Stats */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    Professional Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">
                            Total Students
                          </p>
                          <p className="text-2xl font-bold text-blue-900">
                            {stats?.totalStudents || 0}
                          </p>
                        </div>
                        <FaUsers className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-700">
                            Active Courses
                          </p>
                          <p className="text-2xl font-bold text-emerald-900">
                            {stats?.totalCourses || 0}
                          </p>
                        </div>
                        <FaBook className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">
                            Success Rate
                          </p>
                          <p className="text-2xl font-bold text-purple-900">
                            95%
                          </p>
                        </div>
                        <FaStar className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  About Me
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg">
                  {profile?.bio ||
                    "No bio provided. Add a compelling description about your teaching experience and expertise."}
                </p>
              </div>
            </div>
          )}

          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    My Courses
                  </h3>
                  <p className="text-slate-600">
                    Manage and track your training programs
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    className="px-4 py-2 bg-slate-400 text-white rounded-lg cursor-not-allowed flex items-center space-x-2"
                    disabled
                    title="Courses are assigned by admin"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Courses Assigned by Admin</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courses || [])
                  .filter(
                    (course) =>
                      course.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      course.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-slate-900">
                            {course.name}
                          </h4>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              course.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {course.status}
                          </span>
                        </div>

                        <p className="text-slate-600 mb-6 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Duration</span>
                            <span className="font-semibold text-slate-900">
                              {course.duration}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Price</span>
                            <span className="font-semibold text-emerald-600">
                              ₵{course.price}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Enrolled</span>
                            <span className="font-semibold text-blue-600">
                              {course.enrolledStudents}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Completed</span>
                            <span className="font-semibold text-blue-600">
                              {course.completedStudents}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Enrollment Progress</span>
                            <span className="font-semibold">
                              {Math.round(
                                (course.enrolledStudents / course.maxStudents) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${
                                  (course.enrolledStudents /
                                    course.maxStudents) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              navigate(`/trainer/courses/${course.id}/manage`)
                            }
                            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
                          >
                            <FaClipboardList className="w-4 h-4" />
                            <span className="text-sm font-medium">Manage</span>
                          </button>
                          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                            <FaEye className="w-4 h-4" />
                            <span className="text-sm font-medium">View</span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/trainer/courses/${course.id}/edit`)
                            }
                            className="flex items-center space-x-2 text-slate-600 hover:text-slate-700"
                          >
                            <FaEdit className="w-4 h-4" />
                            <span className="text-sm font-medium">Edit</span>
                          </button>
                          <button className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
                            <FaDownload className="w-4 h-4" />
                            <span className="text-sm font-medium">Export</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    My Students
                  </h3>
                  <p className="text-slate-600">
                    Manage and track student progress
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {(students || [])
                        .filter(
                          (student) =>
                            student.firstName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            student.lastName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            student.email
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            student.courseName
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map((student) => (
                          <tr
                            key={student.id}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-white font-semibold text-sm">
                                    {student.firstName.charAt(0)}
                                    {student.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="text-sm text-slate-500">
                                    {student.email}
                                  </div>
                                  {student.phone && (
                                    <div className="text-sm text-slate-500">
                                      {student.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-slate-900">
                                {student.courseName}
                              </div>
                              <div className="text-sm text-slate-500">
                                Duration: {student.duration}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  student.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : student.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : student.status === "completed"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                    style={{ width: `${student.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-slate-600">
                                  {student.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                              {new Date(
                                student.registrationDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button className="text-blue-600 hover:text-blue-700">
                                  <FaEye className="w-4 h-4" />
                                </button>
                                <button className="text-slate-600 hover:text-slate-700">
                                  <FaEdit className="w-4 h-4" />
                                </button>
                                <button className="text-emerald-600 hover:text-emerald-700">
                                  <FaCheck className="w-4 h-4" />
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

          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Assignment Submissions
                  </h3>
                  <p className="text-slate-600">
                    Review and grade student submissions
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search submissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {submissions.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Assignment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Submission Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Grade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {submissions
                          .filter(
                            (submission) =>
                              submission.firstName
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              submission.lastName
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              submission.email
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              submission.assignmentTitle
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              submission.courseName
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                          )
                          .map((submission) => (
                            <tr
                              key={submission.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center mr-4">
                                    <span className="text-white font-semibold text-sm">
                                      {submission.firstName.charAt(0)}
                                      {submission.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {submission.firstName} {submission.lastName}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                      {submission.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="font-medium text-slate-900">
                                  {submission.assignmentTitle}
                                </p>
                                <p className="text-sm text-slate-600">
                                  Due: {new Date(submission.dueDate).toLocaleDateString()} {new Date(submission.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-slate-900">{submission.courseName}</p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-slate-900">
                                  {new Date(submission.submissionDate).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {new Date(submission.submissionDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    submission.status === "submitted"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : submission.status === "late"
                                      ? "bg-amber-100 text-amber-700"
                                      : submission.status === "missing"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {submission.status.charAt(0).toUpperCase() +
                                    submission.status.slice(1)}
                                </span>
                                {submission.isLate && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    Late penalty: {submission.latePenaltyApplied}%
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {submission.grade !== null && submission.grade !== undefined ? (
                                  <p className="font-semibold text-slate-900">
                                    {submission.grade} / {submission.maxScore}
                                  </p>
                                ) : (
                                  <p className="text-slate-500">Not graded</p>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => navigate(`/trainer/submissions/${submission.id}`)}
                                  >
                                    <FaEye className="w-4 h-4" />
                                  </button>
                                  {submission.status !== "graded" && (
                                    <button 
                                      className="text-emerald-600 hover:text-emerald-700"
                                      onClick={() => navigate(`/trainer/submissions/${submission.id}/grade`)}
                                    >
                                      <FaCheck className="w-4 h-4" />
                                    </button>
                                  )}
                                  {submission.fileUrl && (
                                    <a
                                      href={submission.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-600 hover:text-slate-700"
                                    >
                                      <FaDownload className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaInbox className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Submissions will appear here when students submit their assignments.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Analytics Dashboard
                </h3>
                <p className="text-slate-600">
                  Analytics features coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">
                  Settings
                </h3>
                <p className="text-slate-600">
                  Settings features coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
