import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  Award,
  Globe,
  Target,
  Lightbulb,
  Sparkles,
  Zap,
  Shield,
  Play,
  MessageCircle,
  Download,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Check,
  X,
  Eye,
  Upload,
  Edit,
  Plus,
  ChevronDown,
  ChevronRight,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Repeat,
} from "lucide-react";
import Footer from "../components/Footer";
import AssignmentSubmissionModal from "../components/AssignmentSubmissionModal";

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
}

interface CourseMaterial {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize?: number;
  module?: string;
  createdAt: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  assignmentType: string;
  instructions?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  submissionId?: number;
  submissionStatus?: string;
  score?: number;
  submittedAt?: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  timeLimit?: number;
  attemptsAllowed: number;
  isActive: boolean;
  totalQuestions: number;
  totalPoints: number;
  attemptId?: number;
  attemptStatus?: string;
  score?: number;
  completedAt?: string;
}

interface StudentProgress {
  id: number;
  materialId?: number;
  assignmentId?: number;
  quizId?: number;
  status: string;
  completedAt?: string;
  timeSpent?: number;
}

const StudentCourseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("materials");
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    materials: true,
    assignments: true,
    quizzes: true,
  });
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCourseData();
  }, [id, user, navigate]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseResponse = await api.get(`/courses/${id}`);
      setCourse(courseResponse.data.data.course);

      // Fetch course materials
      try {
        const materialsResponse = await api.get(`/courses/${id}/materials`);
        setMaterials(materialsResponse.data.data.materials);
      } catch (error) {
        console.log("No materials available or access denied");
      }

      // Fetch assignments
      try {
        const assignmentsResponse = await api.get(`/courses/${id}/assignments`);
        setAssignments(assignmentsResponse.data.data.assignments);
      } catch (error) {
        console.log("No assignments available or access denied");
      }

      // Fetch quizzes
      try {
        const quizzesResponse = await api.get(`/courses/${id}/quizzes`);
        setQuizzes(quizzesResponse.data.data.quizzes);
      } catch (error) {
        console.log("No quizzes available or access denied");
      }

      // Fetch student progress
      try {
        const progressResponse = await api.get(`/courses/${id}/progress`);
        setProgress(progressResponse.data.data.progress);
      } catch (error) {
        console.log("No progress data available");
      }
    } catch (error) {
      toast.error("Failed to fetch course data");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getMaterialIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "video":
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getProgressStatus = (
    itemId: number,
    type: "material" | "assignment" | "quiz"
  ) => {
    const progressItem = progress.find((p) => {
      if (type === "material") return p.materialId === itemId;
      if (type === "assignment") return p.assignmentId === itemId;
      if (type === "quiz") return p.quizId === itemId;
      return false;
    });
    return progressItem?.status || "not_started";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionModal(true);
  };

  const handleSubmissionSuccess = () => {
    // Refresh the assignments data to show updated submission status
    fetchCourseData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Course Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The course you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.name}
                </h1>
                <p className="text-gray-600">Course Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {course.duration}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                Max: {course.maxStudents}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Course Description */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Course Overview
          </h2>
          <p className="text-gray-700 leading-relaxed">{course.description}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("materials")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "materials"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Materials
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "assignments"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === "quizzes"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Quizzes
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Course Materials */}
          {activeTab === "materials" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Course Materials
                  </h3>
                  <button
                    onClick={() => toggleSection("materials")}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedSections.materials ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedSections.materials && (
                <div className="p-6">
                  {materials.length > 0 ? (
                    <div className="space-y-4">
                      {materials.map((material) => {
                        const status = getProgressStatus(
                          material.id,
                          "material"
                        );
                        return (
                          <div
                            key={material.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {getMaterialIcon(material.fileType)}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {material.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {material.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  {material.fileSize && (
                                    <span>
                                      {formatFileSize(material.fileSize)}
                                    </span>
                                  )}
                                  {material.module && (
                                    <span>Module: {material.module}</span>
                                  )}
                                  <span>{formatDate(material.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(status)}
                                <span className="text-sm text-gray-600">
                                  {getStatusText(status)}
                                </span>
                              </div>
                              <a
                                href={material.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Materials Available
                      </h4>
                      <p className="text-gray-600">
                        Course materials will be added by your trainer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assignments */}
          {activeTab === "assignments" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Assignments
                  </h3>
                  <button
                    onClick={() => toggleSection("assignments")}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedSections.assignments ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedSections.assignments && (
                <div className="p-6">
                  {assignments.length > 0 ? (
                    <div className="space-y-4">
                      {assignments.map((assignment) => {
                        const status = getProgressStatus(
                          assignment.id,
                          "assignment"
                        );
                        const isOverdue =
                          new Date(assignment.dueDate) < new Date();
                        const isSubmitted =
                          assignment.submissionStatus === "submitted" ||
                          assignment.submissionStatus === "graded";

                        return (
                          <div
                            key={assignment.id}
                            className="border border-gray-200 rounded-xl overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {assignment.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {isOverdue && !isSubmitted && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                      Overdue
                                    </span>
                                  )}
                                  {assignment.submissionStatus === "graded" && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      Graded: {assignment.score}/
                                      {assignment.maxScore}
                                    </span>
                                  )}
                                  {assignment.submissionStatus ===
                                    "submitted" && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                      Submitted
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-700 mb-3">
                                {assignment.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-2" />
                                  Due: {formatDate(assignment.dueDate)}
                                </div>
                                <div className="flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  Max Score: {assignment.maxScore}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  Type: {assignment.assignmentType}
                                </div>
                              </div>
                              {assignment.instructions && (
                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                  <h5 className="font-medium text-gray-900 mb-1">
                                    Instructions:
                                  </h5>
                                  <p className="text-sm text-gray-700">
                                    {assignment.instructions}
                                  </p>
                                </div>
                              )}
                              {assignment.attachmentUrl && (
                                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                  <h5 className="font-medium text-gray-900 mb-1">
                                    Assignment Attachment:
                                  </h5>
                                  <a
                                    href={assignment.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-sm text-green-700 hover:text-green-800"
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    {assignment.attachmentName ||
                                      "Download Attachment"}
                                  </a>
                                </div>
                              )}
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(status)}
                                  <span className="text-sm text-gray-600">
                                    {getStatusText(status)}
                                  </span>
                                </div>
                                {!isSubmitted && (
                                  <button
                                    onClick={() =>
                                      handleSubmitAssignment(assignment)
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    Submit Assignment
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Assignments Available
                      </h4>
                      <p className="text-gray-600">
                        Assignments will be added by your trainer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quizzes */}
          {activeTab === "quizzes" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Quizzes
                  </h3>
                  <button
                    onClick={() => toggleSection("quizzes")}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedSections.quizzes ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedSections.quizzes && (
                <div className="p-6">
                  {quizzes.length > 0 ? (
                    <div className="space-y-4">
                      {quizzes.map((quiz) => {
                        const status = getProgressStatus(quiz.id, "quiz");
                        const hasAttempted =
                          quiz.attemptStatus === "completed" ||
                          quiz.attemptStatus === "in_progress";

                        return (
                          <div
                            key={quiz.id}
                            className="border border-gray-200 rounded-xl overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {quiz.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {quiz.attemptStatus === "completed" && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                      Completed: {quiz.score}/{quiz.totalPoints}
                                    </span>
                                  )}
                                  {quiz.attemptStatus === "in_progress" && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                      In Progress
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-gray-700 mb-3">
                                {quiz.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-2" />
                                  {quiz.timeLimit
                                    ? `${quiz.timeLimit} min`
                                    : "No time limit"}
                                </div>
                                <div className="flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  {quiz.totalPoints} points
                                </div>
                                <div className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  {quiz.totalQuestions} questions
                                </div>
                                <div className="flex items-center">
                                  <Repeat className="h-4 w-4 mr-2" />
                                  {quiz.attemptsAllowed} attempts
                                </div>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(status)}
                                  <span className="text-sm text-gray-600">
                                    {getStatusText(status)}
                                  </span>
                                </div>
                                {!hasAttempted && (
                                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                    Start Quiz
                                  </button>
                                )}
                                {hasAttempted && (
                                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                                    View Results
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Quizzes Available
                      </h4>
                      <p className="text-gray-600">
                        Quizzes will be added by your trainer.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <AssignmentSubmissionModal
          assignment={selectedAssignment}
          isOpen={showSubmissionModal}
          onClose={() => {
            setShowSubmissionModal(false);
            setSelectedAssignment(null);
          }}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};

export default StudentCourseView;
