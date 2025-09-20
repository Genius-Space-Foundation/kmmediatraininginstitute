import React, { useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { FaTimes, FaUpload, FaFile, FaSpinner, FaCheck } from "react-icons/fa";

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onUploadSuccess: () => void;
}

interface MaterialFormData {
  title: string;
  description: string;
  module: string;
  isPublic: boolean;
  file: File | null;
}

const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  courseId,
  onUploadSuccess,
}) => {
  const [formData, setFormData] = useState<MaterialFormData>({
    title: "",
    description: "",
    module: "",
    isPublic: true,
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileSelect = (file: File) => {
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const simulateFileUpload = async (file: File): Promise<string> => {
    // Simulate file upload - in a real app, you'd upload to cloud storage
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://example.com/files/${file.name}`;
        resolve(mockUrl);
      }, 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setUploading(true);

      // Simulate file upload
      const fileUrl = await simulateFileUpload(formData.file);

      const materialData = {
        title: formData.title,
        description: formData.description,
        module: formData.module,
        isPublic: formData.isPublic,
        fileUrl: fileUrl,
        fileType: formData.file.type,
        fileName: formData.file.name,
        fileSize: formData.file.size,
      };

      await api.post(`/trainers/courses/${courseId}/materials`, materialData);

      toast.success("Material uploaded successfully!");
      onUploadSuccess();
      onClose();

      // Reset form
      setFormData({
        title: "",
        description: "",
        module: "",
        isPublic: true,
        file: null,
      });
    } catch (error: any) {
      console.error("Error uploading material:", error);
      toast.error(error.response?.data?.message || "Failed to upload material");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Upload Course Material
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* File Upload Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              File <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <FaCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {formData.file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(formData.file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, file: null }))
                    }
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <FaFile className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Drop your file here, or{" "}
                      <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileInputChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF, DOC, PPT, XLS, images, videos, audio, and
                      ZIP files
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter material title"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter material description (optional)"
            />
          </div>

          {/* Module */}
          <div className="space-y-2">
            <label
              htmlFor="module"
              className="block text-sm font-medium text-slate-700"
            >
              Module/Chapter
            </label>
            <input
              type="text"
              id="module"
              name="module"
              value={formData.module}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Module 1, Chapter 3, Week 2"
            />
          </div>

          {/* Public/Private */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <label htmlFor="isPublic" className="text-sm text-slate-700">
              Make this material publicly accessible to all students
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !formData.file || !formData.title.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload className="w-4 h-4" />
                  <span>Upload Material</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterialModal;























