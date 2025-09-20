import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import LiveClasses from "../components/LiveClasses";
import CatchupSessions from "../components/CatchupSessions";
import CapstoneProjects from "../components/CapstoneProjects";
import IndustrialAttachments from "../components/IndustrialAttachments";
import {
  BookOpen,
  Video,
  MessageSquare,
  Target,
  Briefcase,
  TrendingUp,
  Calendar,
  Users,
  Award,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
  Plus,
  Filter,
  Search,
  Clipboard,
} from "lucide-react";

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  level: string;
  category: string;
  instructorId: number;
  instructorName?: string;
  isActive: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LearningStats {
  totalHoursStudied: number;
  completedModules: number;
  totalModules: number;
  averageGrade: number;
  upcomingClasses: number;
  pendingSessions: number;
  completedAssignments: number;
  totalAssignments: number;
}

const EnhancedLearningDashboard: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "live-classes"
    | "catchup-sessions"
    | "capstone-projects"
    | "industrial-attachments"
    | "materials"
    | "assignments"
    | "progress"
  >("overview");
  const [isTrainer, setIsTrainer] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      checkUserRole();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await api.get(`/courses/${courseId}`);
      setCourse(courseResponse.data.data);

      // Fetch learning stats
      const statsResponse = await api.get(
        `/students/learning-stats/${courseId}`
      );
      setStats(statsResponse.data.data);
    } catch (error: any) {
      console.error("Error fetching course data:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch course data"
      );
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = () => {
    if (user?.role === "trainer") {
      setIsTrainer(true);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "live-classes", label: "Live Classes", icon: Video },
    { id: "catchup-sessions", label: "Catchup Sessions", icon: MessageSquare },
    { id: "capstone-projects", label: "Capstone Projects", icon: Target },
    {
      id: "industrial-attachments",
      label: "Industrial Attachments",
      icon: Briefcase,
    },
    { id: "materials", label: "Materials", icon: FileText },
    { id: "assignments", label: "Assignments", icon: Clipboard },
    { id: "progress", label: "Progress", icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The course you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/courses")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {course.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Enhanced Learning Experience
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isTrainer && (
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {course.featuredImage ? (
                  <img
                    src={course.featuredImage}
                    alt={course.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {course.name}
                  </h2>
                  <p className="text-gray-600">{course.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {course.duration}
                    </span>
                    <span className="flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      {course.level}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.category}
                    </span>
                  </div>
                </div>
              </div>

              {course.learningOutcomes && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Learning Outcomes:
                  </h3>
                  <p className="text-sm text-gray-600">
                    {course.learningOutcomes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Progress
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(
                            (stats.completedModules / stats.totalModules) * 100
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Study Hours
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalHoursStudied}h
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Video className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Upcoming Classes
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.upcomingClasses}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Award className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Average Grade
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.averageGrade}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab("live-classes")}
                    className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Video className="h-6 w-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-blue-900">
                        Join Live Class
                      </p>
                      <p className="text-sm text-blue-700">
                        Attend interactive sessions
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("catchup-sessions")}
                    className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <MessageSquare className="h-6 w-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-green-900">
                        Catchup Session
                      </p>
                      <p className="text-sm text-green-700">
                        Schedule with mentor
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("materials")}
                    className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FileText className="h-6 w-6 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium text-purple-900">
                        Study Materials
                      </p>
                      <p className="text-sm text-purple-700">
                        Access resources
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Completed Module 3
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Attended Live Class
                      </p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Submitted Assignment
                      </p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "live-classes" && (
            <LiveClasses courseId={parseInt(courseId!)} isTrainer={isTrainer} />
          )}

          {activeTab === "catchup-sessions" && (
            <CatchupSessions
              courseId={parseInt(courseId!)}
              isTrainer={isTrainer}
            />
          )}

          {activeTab === "capstone-projects" && <CapstoneProjects />}

          {activeTab === "industrial-attachments" && <IndustrialAttachments />}

          {activeTab === "materials" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Learning Materials
              </h3>
              <p className="text-gray-600">Materials section coming soon...</p>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Assignments
              </h3>
              <p className="text-gray-600">
                Assignments section coming soon...
              </p>
            </div>
          )}

          {activeTab === "progress" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Learning Progress
              </h3>
              <p className="text-gray-600">Progress tracking coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLearningDashboard;
