import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  User,
  DollarSign,
  Users,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Award,
  Clock,
  Target,
  GraduationCap,
} from "lucide-react";

interface Course {
  id: number;
  name: string;
  description: string;
  excerpt?: string;
  duration: string;
  price: number;
  maxStudents: number;
  level: string;
  category: string;
  instructorId?: number;
  instructorName?: string;
  isActive: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
  createdAt: string;
  updatedAt?: string;
  enrolledStudents?: number;
  revenue?: number;
}

interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface CreateCourseData {
  name: string;
  description: string;
  excerpt?: string;
  duration: string;
  price: number;
  maxStudents: number;
  level: string;
  category: string;
  instructorId?: number;
  isActive: boolean;
  featuredImage?: string;
  syllabus?: string;
  requirements?: string;
  learningOutcomes?: string;
}

const AdminCourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [createData, setCreateData] = useState<CreateCourseData>({
    name: "",
    description: "",
    excerpt: "",
    duration: "",
    price: 0,
    maxStudents: 0,
    level: "beginner",
    category: "",
    instructorId: undefined,
    isActive: true,
    featuredImage: "",
    syllabus: "",
    requirements: "",
    learningOutcomes: "",
  });
  const [editData, setEditData] = useState<Partial<Course>>({});

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/courses/admin/all");
      setCourses(response.data.courses || []);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error(error.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await api.get("/trainers/admin/all");
      setTrainers(response.data.trainers || []);
    } catch (error: any) {
      console.error("Error fetching trainers:", error);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/courses", createData);
      toast.success("Course created successfully");
      setShowCreateModal(false);
      setCreateData({
        name: "",
        description: "",
        excerpt: "",
        duration: "",
        price: 0,
        maxStudents: 0,
        level: "beginner",
        category: "",
        instructorId: undefined,
        isActive: true,
        featuredImage: "",
        syllabus: "",
        requirements: "",
        learningOutcomes: "",
      });
      fetchCourses();
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast.error(error.response?.data?.message || "Failed to create course");
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const response = await api.put(`/courses/${selectedCourse.id}`, editData);
      toast.success("Course updated successfully");
      setShowEditModal(false);
      setSelectedCourse(null);
      setEditData({});
      fetchCourses();
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.message || "Failed to update course");
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await api.delete(`/courses/${courseId}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setEditData({
      name: course.name,
      description: course.description,
      excerpt: course.excerpt || "",
      duration: course.duration,
      price: course.price,
      maxStudents: course.maxStudents,
      level: course.level,
      category: course.category,
      instructorId: course.instructorId,
      isActive: course.isActive,
      featuredImage: course.featuredImage || "",
      syllabus: course.syllabus || "",
      requirements: course.requirements || "",
      learningOutcomes: course.learningOutcomes || "",
    });
    setShowEditModal(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "text-green-600 bg-green-50 border-green-200"
      : "text-red-600 bg-red-50 border-red-200";
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "advanced":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructorName &&
        course.instructorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Course Management
          </h3>
          <p className="text-gray-600">Manage courses and assign trainers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                    course.isActive
                  )}`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => openEditModal(course)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {course.name}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(
                      course.level
                    )}`}
                  >
                    {course.level}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {course.category}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-semibold text-gray-900">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-gray-900">
                    ₵{course.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Max Students</span>
                  <span className="font-semibold text-gray-900">
                    {course.maxStudents}
                  </span>
                </div>
                {course.instructorName && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {course.instructorName}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrolledStudents || 0} enrolled
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />₵
                    {course.revenue?.toLocaleString() || "0"} revenue
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "No courses match your search criteria."
              : "Get started by adding your first course."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Course
            </button>
          )}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Create New Course
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createData.name}
                    onChange={(e) =>
                      setCreateData({ ...createData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={createData.category}
                    onChange={(e) =>
                      setCreateData({ ...createData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={createData.description}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  rows={2}
                  value={createData.excerpt}
                  onChange={(e) =>
                    setCreateData({ ...createData, excerpt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 12 weeks"
                    value={createData.duration}
                    onChange={(e) =>
                      setCreateData({ ...createData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₵) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={createData.price}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Students *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={createData.maxStudents}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        maxStudents: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    required
                    value={createData.level}
                    onChange={(e) =>
                      setCreateData({ ...createData, level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Trainer
                  </label>
                  <select
                    value={createData.instructorId || ""}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        instructorId: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a trainer</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.firstName} {trainer.lastName} -{" "}
                        {trainer.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={createData.featuredImage}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        featuredImage: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={createData.isActive}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active Course
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Syllabus
                </label>
                <textarea
                  rows={3}
                  value={createData.syllabus}
                  onChange={(e) =>
                    setCreateData({ ...createData, syllabus: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <textarea
                  rows={2}
                  value={createData.requirements}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      requirements: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Outcomes
                </label>
                <textarea
                  rows={2}
                  value={createData.learningOutcomes}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      learningOutcomes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Course
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditCourse} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.name || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.category || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editData.description || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.duration || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₵) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editData.price || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Students *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editData.maxStudents || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        maxStudents: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    required
                    value={editData.level || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, level: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Trainer
                  </label>
                  <select
                    value={editData.instructorId || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        instructorId: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a trainer</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id} value={trainer.id}>
                        {trainer.firstName} {trainer.lastName} -{" "}
                        {trainer.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editData.isActive || false}
                  onChange={(e) =>
                    setEditData({ ...editData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="editIsActive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Active Course
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagement;


