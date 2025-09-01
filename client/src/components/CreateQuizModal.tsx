import React, { useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  FaTimes,
  FaPlus,
  FaSpinner,
  FaCalendarAlt,
  FaClock,
  FaQuestionCircle,
} from "react-icons/fa";

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onCreateSuccess: () => void;
}

interface QuizFormData {
  title: string;
  description: string;
  timeLimit: number | null;
  attemptsAllowed: number;
  startDate: string;
  endDate: string;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onCreateSuccess,
}) => {
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    timeLimit: null,
    attemptsAllowed: 1,
    startDate: "",
    endDate: "",
  });
  const [creating, setCreating] = useState(false);
  const [hasTimeLimit, setHasTimeLimit] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleTimeLimitToggle = (enabled: boolean) => {
    setHasTimeLimit(enabled);
    if (!enabled) {
      setFormData((prev) => ({ ...prev, timeLimit: null }));
    } else {
      setFormData((prev) => ({ ...prev, timeLimit: 30 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    // Validate dates if provided
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        toast.error("End date must be after start date");
        return;
      }
    }

    try {
      setCreating(true);

      const quizData = {
        ...formData,
        timeLimit: hasTimeLimit ? formData.timeLimit : null,
      };

      await api.post(`/trainers/courses/${courseId}/quizzes`, quizData);

      toast.success("Quiz created successfully!");
      onCreateSuccess();
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        timeLimit: null,
        attemptsAllowed: 1,
        startDate: "",
        endDate: "",
      });
      setHasTimeLimit(false);
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      toast.error(error.response?.data?.message || "Failed to create quiz");
    } finally {
      setCreating(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Create Quiz</h2>
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
              Quiz Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter quiz title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter quiz description (optional)"
            />
          </div>

          {/* Time Limit */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="hasTimeLimit"
                checked={hasTimeLimit}
                onChange={(e) => handleTimeLimitToggle(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
              />
              <label
                htmlFor="hasTimeLimit"
                className="text-sm font-medium text-slate-700"
              >
                Set time limit
              </label>
            </div>

            {hasTimeLimit && (
              <div className="space-y-2">
                <label
                  htmlFor="timeLimit"
                  className="block text-sm font-medium text-slate-700"
                >
                  Time Limit (minutes)
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="number"
                    id="timeLimit"
                    name="timeLimit"
                    value={formData.timeLimit || ""}
                    onChange={handleInputChange}
                    min="1"
                    max="480"
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter time limit in minutes"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Students will have this amount of time to complete the quiz
                  once they start
                </p>
              </div>
            )}
          </div>

          {/* Attempts Allowed */}
          <div className="space-y-2">
            <label
              htmlFor="attemptsAllowed"
              className="block text-sm font-medium text-slate-700"
            >
              Attempts Allowed
            </label>
            <select
              id="attemptsAllowed"
              name="attemptsAllowed"
              value={formData.attemptsAllowed}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value={1}>1 attempt</option>
              <option value={2}>2 attempts</option>
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts</option>
              <option value={-1}>Unlimited attempts</option>
            </select>
          </div>

          {/* Availability Dates */}
          <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700">
              Quiz Availability (Optional)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-slate-700"
                >
                  Available From
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-slate-700"
                >
                  Available Until
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || getMinDate()}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Leave blank to make the quiz available immediately and
              indefinitely
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaQuestionCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Next Steps
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  After creating the quiz, you'll be able to add questions and
                  configure additional settings.
                </p>
              </div>
            </div>
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
              disabled={creating || !formData.title.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4" />
                  <span>Create Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizModal;










