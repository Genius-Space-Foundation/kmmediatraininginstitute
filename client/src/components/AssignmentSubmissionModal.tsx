import React, { useState } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "../utils/api";
import toast from "react-hot-toast";

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
}

interface AssignmentSubmissionModalProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
  onSubmissionSuccess: () => void;
}

const AssignmentSubmissionModal: React.FC<AssignmentSubmissionModalProps> = ({
  assignment,
  isOpen,
  onClose,
  onSubmissionSuccess,
}) => {
  const [submissionText, setSubmissionText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      // In a real implementation, you would upload the file to a cloud service
      // and get back a URL. For now, we'll use a placeholder
      setFileUrl(`https://example.com/uploads/${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submissionText.trim() && !fileUrl.trim()) {
      toast.error("Please provide either text submission or upload a file");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/courses/assignments/${assignment.id}/submit`,
        {
          submissionText: submissionText.trim() || null,
          fileUrl: fileUrl.trim() || null,
          fileName: fileName.trim() || null,
        }
      );

      if (response.data.success) {
        toast.success("Assignment submitted successfully!");
        onSubmissionSuccess();
        onClose();
        // Reset form
        setSubmissionText("");
        setFileUrl("");
        setFileName("");
        setSelectedFile(null);
      } else {
        toast.error(response.data.message || "Failed to submit assignment");
      }
    } catch (error: any) {
      console.error("Error submitting assignment:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit assignment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = new Date(assignment.dueDate) < new Date();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Submit Assignment
            </h2>
            <p className="text-sm text-gray-600 mt-1">{assignment.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Assignment Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Assignment Details
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Description:</strong> {assignment.description}
              </p>
              <div className="flex items-center space-x-4">
                <span>
                  <strong>Due Date:</strong> {formatDate(assignment.dueDate)}
                </span>
                <span>
                  <strong>Max Score:</strong> {assignment.maxScore} points
                </span>
                <span>
                  <strong>Type:</strong> {assignment.assignmentType}
                </span>
              </div>
              {isOverdue && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    This assignment is overdue
                  </span>
                </div>
              )}
            </div>
            {assignment.instructions && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">
                  Instructions:
                </h4>
                <p className="text-sm text-gray-700">
                  {assignment.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Submission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Submission
              </label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Enter your assignment submission here..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide your written response or answers here
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Upload (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  disabled={isSubmitting}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, TXT, JPG, PNG, GIF (Max 10MB)
                  </p>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-3 flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">
                    {selectedFile.name} selected
                  </span>
                </div>
              )}
            </div>

            {/* Submission Guidelines */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                Submission Guidelines
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Provide either text submission or upload a file (or both)
                </li>
                <li>
                  • Ensure your submission is complete and follows the
                  instructions
                </li>
                <li>
                  • Check that your file is readable and in the correct format
                </li>
                <li>• You can only submit once per assignment</li>
                {isOverdue && (
                  <li className="text-red-600 font-medium">
                    • This assignment is overdue and may affect your grade
                  </li>
                )}
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || (!submissionText.trim() && !fileUrl.trim())
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Submit Assignment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmissionModal;




