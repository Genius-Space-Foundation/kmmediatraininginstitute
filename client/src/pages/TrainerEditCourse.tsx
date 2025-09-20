import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaBook,
  FaSave,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";

interface CourseFormData {
  name: string;
  description: string;
  duration: string;
  price: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  syllabus: string;
  requirements: string;
  learningOutcomes: string;
  isActive: boolean;
}

interface CourseContentData {
  description: string;
  syllabus: string;
  requirements: string;
  learningOutcomes: string;
}

const TrainerEditCourse: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    description: "",
    duration: "",
    price: 0,
    maxStudents: 20,
    startDate: "",
    endDate: "",
    syllabus: "",
    requirements: "",
    learningOutcomes: "",
    isActive: true,
  });

  const fetchCourseData = useCallback(async () => {
    try {
      setFetching(true);
      const response = await api.get(`/trainers/courses/${courseId}`);
      const course = response.data;

      setFormData({
        name: course.name || "",
        description: course.description || "",
        duration: course.duration || "",
        price: course.price || 0,
        maxStudents: course.maxStudents || 20,
        startDate: course.startDate || "",
        endDate: course.endDate || "",
        syllabus: course.syllabus || "",
        requirements: course.requirements || "",
        learningOutcomes: course.learningOutcomes || "",
        isActive: course.isActive !== false,
      });
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch course data"
      );
      navigate("/trainer/courses");
    } finally {
      setFetching(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, fetchCourseData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "trainer") {
      toast.error("Access denied. Trainer privileges required.");
      return;
    }

    try {
      setLoading(true);

      // Only send content fields that trainers are allowed to update
      const contentData: CourseContentData = {
        description: formData.description,
        syllabus: formData.syllabus,
        requirements: formData.requirements,
        learningOutcomes: formData.learningOutcomes,
      };

      await api.put(`/trainers/courses/${courseId}/content`, contentData);

      toast.success("Course content updated successfully!");
      navigate("/trainer/courses");
    } catch (error: any) {
      console.error("Error updating course content:", error);
      toast.error(
        error.response?.data?.message || "Failed to update course content"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={() => navigate("/trainer/courses")}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
              <FaBook className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Edit Course</h1>
              <p className="text-slate-600">
                Update your training program details
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Notice about editable fields */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Course Content Management
            </h3>
            <p className="text-sm text-blue-800">
              As a trainer, you can only edit the course content fields below.
              Basic course information (title, price, duration, etc.) is managed
              by administrators.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only basic information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Course Information (Read-only)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Price (GHC)
                  </label>
                  <input
                    type="text"
                    value={`GHC ${formData.price}`}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Maximum Students
                  </label>
                  <input
                    type="text"
                    value={formData.maxStudents}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={formData.startDate}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={formData.endDate}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Editable content fields */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Course Content (Editable)
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your course content and objectives"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Syllabus
                  </label>
                  <textarea
                    name="syllabus"
                    value={formData.syllabus}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Outline the course structure, topics, and schedule"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="List any prerequisites or requirements for this course"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Learning Outcomes
                  </label>
                  <textarea
                    name="learningOutcomes"
                    value={formData.learningOutcomes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What students will learn and be able to do after completing this course"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/trainer/courses")}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <FaSave className="w-4 h-4" />
                <span>{loading ? "Updating..." : "Update Course Content"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerEditCourse;
