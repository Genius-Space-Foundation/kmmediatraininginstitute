import React, { useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  FaTimes,
  FaPlus,
  FaSpinner,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaUser,
} from "react-icons/fa";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onCreateSuccess: () => void;
}

interface AssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  assignmentType: "individual" | "group";
  allowLateSubmission: boolean;
  latePenalty: number;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onCreateSuccess,
}) => {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    maxScore: 100,
    assignmentType: "individual",
    allowLateSubmission: false,
    latePenalty: 0,
  });
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter an assignment title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter an assignment description");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Please select a due date");
      return;
    }

    // Validate due date is in the future
    const dueDate = new Date(formData.dueDate);
    if (dueDate <= new Date()) {
      toast.error("Due date must be in the future");
      return;
    }

    try {
      setCreating(true);

      await api.post(`/trainers/courses/${courseId}/assignments`, formData);

      toast.success("Assignment created successfully!");
      onCreateSuccess();
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        instructions: "",
        dueDate: "",
        maxScore: 100,
        assignmentType: "individual",
        allowLateSubmission: false,
        latePenalty: 0,
      });
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );
    } finally {
      setCreating(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Create Assignment
          </h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700"
            >
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter assignment title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter assignment description"
              required
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label
              htmlFor="instructions"
              className="block text-sm font-medium text-slate-700"
            >
              Detailed Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter detailed instructions for students (optional)"
            />
          </div>

          {/* Due Date and Max Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-slate-700"
              >
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="datetime-local"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="maxScore"
                className="block text-sm font-medium text-slate-700"
              >
                Maximum Score
              </label>
              <input
                type="number"
                id="maxScore"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleInputChange}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Assignment Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Assignment Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="individual"
                  checked={formData.assignmentType === "individual"}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <FaUser className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">Individual</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="assignmentType"
                  value="group"
                  checked={formData.assignmentType === "group"}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <FaUsers className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">Group</span>
              </label>
            </div>
          </div>

          {/* Late Submission Settings */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowLateSubmission"
                name="allowLateSubmission"
                checked={formData.allowLateSubmission}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
              />
              <label
                htmlFor="allowLateSubmission"
                className="text-sm font-medium text-slate-700"
              >
                Allow late submissions
              </label>
            </div>

            {formData.allowLateSubmission && (
              <div className="space-y-2">
                <label
                  htmlFor="latePenalty"
                  className="block text-sm font-medium text-slate-700"
                >
                  Late Penalty (% per day)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="latePenalty"
                    name="latePenalty"
                    value={formData.latePenalty}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter penalty percentage"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                    %
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Students will lose {formData.latePenalty}% of their score for
                  each day the assignment is late
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                creating ||
                !formData.title.trim() ||
                !formData.description.trim() ||
                !formData.dueDate
              }
              className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;










