import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Upload,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  Target,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import MaterialUploadModal from "./MaterialUploadModal";
import AssignmentCreationModal from "./AssignmentCreationModal";

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
  createdAt: string;
}

const TrainerCourseManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("materials");
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    materials: true,
    assignments: true,
  });

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course materials
      const materialsResponse = await api.get(`/courses/${id}/materials`);
      setMaterials(materialsResponse.data.data.materials);

      // Fetch assignments
      const assignmentsResponse = await api.get(`/courses/${id}/assignments`);
      setAssignments(assignmentsResponse.data.data.assignments);
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to fetch course data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: "materials" | "assignments") => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMaterialModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Material</span>
          </button>
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Assignment</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
        <button
          onClick={() => setActiveTab("materials")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "materials"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Course Materials ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "assignments"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Target className="h-4 w-4 inline mr-2" />
          Assignments ({assignments.length})
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-6">
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
                    {materials.map((material) => (
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
                                <span>{formatFileSize(material.fileSize)}</span>
                              )}
                              {material.module && (
                                <span>Module: {material.module}</span>
                              )}
                              <span>{formatDate(material.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Materials Available
                    </h4>
                    <p className="text-gray-600">
                      Add course materials to help your students learn.
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
                    {assignments.map((assignment) => (
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
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {assignment.assignmentType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-700 mb-3">
                            {assignment.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
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
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                Created: {formatDate(assignment.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              {assignment.attachmentUrl && (
                                <a
                                  href={assignment.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Download Attachment"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No Assignments Available
                    </h4>
                    <p className="text-gray-600">
                      Create assignments to assess your students' progress.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Material Upload Modal */}
      {showMaterialModal && (
        <MaterialUploadModal
          courseId={id!}
          isOpen={showMaterialModal}
          onClose={() => setShowMaterialModal(false)}
          onSuccess={() => {
            fetchCourseData();
            setShowMaterialModal(false);
          }}
        />
      )}

      {/* Assignment Creation Modal */}
      {showAssignmentModal && (
        <AssignmentCreationModal
          courseId={id!}
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          onSuccess={() => {
            fetchCourseData();
            setShowAssignmentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TrainerCourseManagement;
