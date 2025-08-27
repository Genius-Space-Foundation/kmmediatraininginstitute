import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import UploadMaterialModal from "../components/UploadMaterialModal";
import CreateAssignmentModal from "../components/CreateAssignmentModal";
import CreateQuizModal from "../components/CreateQuizModal";
import {
  FaArrowLeft,
  FaBook,
  FaFileAlt,
  FaTasks,
  FaQuestionCircle,
  FaInbox,
  FaPlus,
  FaEdit,
  FaEye,
  FaDownload,
  FaUpload,
  FaFileUpload,
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaSpinner,
  FaGraduationCap,
  FaUsers,
  FaStar,
  FaExclamationTriangle,
  FaSearch,
} from "react-icons/fa";

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
}

const TrainerCourseManagement: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: FaBook },
    { id: "materials", label: "Materials", icon: FaFileAlt },
    { id: "assignments", label: "Assignments", icon: FaTasks },
    { id: "quizzes", label: "Quizzes", icon: FaQuestionCircle },
    { id: "submissions", label: "Submissions", icon: FaInbox },
    { id: "analytics", label: "Analytics", icon: FaClipboardList },
  ];

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, materialsRes, assignmentsRes, quizzesRes] =
        await Promise.all([
          api.get(`/trainers/courses/${courseId}`),
          api.get(`/trainers/courses/${courseId}/materials`),
          api.get(`/trainers/courses/${courseId}/assignments`),
          api.get(`/trainers/courses/${courseId}/quizzes`),
        ]);

      setCourse(courseRes.data.course);
      setMaterials(materialsRes.data.materials || []);
      setAssignments(assignmentsRes.data.assignments || []);
      setQuizzes(quizzesRes.data.quizzes || []);
    } catch (error: any) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course data");
      navigate("/trainer/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    return "📁";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900">
            Loading Course
          </h3>
          <p className="text-slate-600">
            Please wait while we fetch the course data
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900">
            Course Not Found
          </h3>
          <p className="text-slate-600">
            The requested course could not be found
          </p>
          <button
            onClick={() => navigate("/trainer/courses")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/trainer/courses")}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <FaBook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {course.name}
                  </h1>
                  <p className="text-slate-600">{course.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Status</div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {course.enrolledStudents}
                </div>
                <div className="text-sm text-slate-500">Enrolled Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {materials.length}
                </div>
                <div className="text-sm text-slate-500">Materials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {assignments.length}
                </div>
                <div className="text-sm text-slate-500">Assignments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {quizzes.length}
                </div>
                <div className="text-sm text-slate-500">Quizzes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">
                Course Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Course Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaClock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        Duration: {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {new Date(course.startDate).toLocaleDateString()} -{" "}
                        {new Date(course.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaUsers className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {course.enrolledStudents}/{course.maxStudents} students
                        enrolled
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaGraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {course.completedStudents} students completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaFileAlt className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-slate-600">
                          New material uploaded
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        2 hours ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaTasks className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-slate-600">
                          Assignment due tomorrow
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">1 day ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaInbox className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-slate-600">
                          5 new submissions
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Course Materials
                </h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FaUpload className="w-4 h-4" />
                  <span>Upload Material</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getFileIcon(material.fileType)}
                        </span>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {material.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {material.fileName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <FaEdit className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <FaDownload className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {material.description && (
                      <p className="text-sm text-slate-600 mb-3">
                        {material.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatFileSize(material.fileSize)}</span>
                      <span>{material.downloadCount} downloads</span>
                    </div>

                    {material.module && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {material.module}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Assignments
                </h2>
                <button
                  onClick={() => setShowAssignmentModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </div>

              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {assignment.title}
                        </h3>
                        <p className="text-slate-600 mt-1">
                          {assignment.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                          <FaEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {assignment.submissionCount}
                        </div>
                        <div className="text-sm text-slate-500">
                          Total Submissions
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">
                          {assignment.submittedCount}
                        </div>
                        <div className="text-sm text-slate-500">On Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {assignment.lateCount}
                        </div>
                        <div className="text-sm text-slate-500">Late</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {assignment.missingCount}
                        </div>
                        <div className="text-sm text-slate-500">Missing</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span>Max Score: {assignment.maxScore}</span>
                        <span className="capitalize">
                          {assignment.assignmentType}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          assignment.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {assignment.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "quizzes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Quizzes</h2>
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Create Quiz</span>
                </button>
              </div>

              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {quiz.title}
                        </h3>
                        {quiz.description && (
                          <p className="text-slate-600 mt-1">
                            {quiz.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600">
                          <FaEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {quiz.attemptCount}
                        </div>
                        <div className="text-sm text-slate-500">
                          Total Attempts
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">
                          {quiz.studentCount}
                        </div>
                        <div className="text-sm text-slate-500">
                          Students Attempted
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {quiz.totalQuestions}
                        </div>
                        <div className="text-sm text-slate-500">Questions</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center space-x-4">
                        {quiz.timeLimit && (
                          <span>Time Limit: {quiz.timeLimit} min</span>
                        )}
                        <span>Attempts: {quiz.attemptsAllowed}</span>
                        <span>Points: {quiz.totalPoints}</span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          quiz.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {quiz.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Student Submissions
                </h2>
                <div className="flex items-center space-x-4">
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

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-slate-600 text-center">
                  Submissions will be displayed here when students submit their
                  assignments.
                </p>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">
                Course Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {course.enrolledStudents}
                      </div>
                      <div className="text-blue-100">Enrolled Students</div>
                    </div>
                    <FaUsers className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {materials.length}
                      </div>
                      <div className="text-emerald-100">Course Materials</div>
                    </div>
                    <FaFileAlt className="w-8 h-8 text-emerald-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {assignments.length}
                      </div>
                      <div className="text-purple-100">Assignments</div>
                    </div>
                    <FaTasks className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{quizzes.length}</div>
                      <div className="text-orange-100">Quizzes</div>
                    </div>
                    <FaQuestionCircle className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Engagement Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      Course Completion Rate
                    </span>
                    <span className="font-semibold text-slate-900">
                      {course.maxStudents > 0
                        ? Math.round(
                            (course.completedStudents / course.maxStudents) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          course.maxStudents > 0
                            ? (course.completedStudents / course.maxStudents) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UploadMaterialModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        courseId={courseId!}
        onUploadSuccess={fetchCourseData}
      />

      <CreateAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        courseId={courseId!}
        onCreateSuccess={fetchCourseData}
      />

      <CreateQuizModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        courseId={courseId!}
        onCreateSuccess={fetchCourseData}
      />
    </div>
  );
};

export default TrainerCourseManagement;
