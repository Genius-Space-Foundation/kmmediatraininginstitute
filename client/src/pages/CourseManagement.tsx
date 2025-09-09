import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    FaUpload,
    FaTrash,
    FaEdit,
    FaDownload,
    FaEye,
    FaLock,
    FaLockOpen,
    FaPlus,
    FaBook,
    FaVideo,
    FaFile,
    FaLink
} from 'react-icons/fa';

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

interface Module {
    id: number;
    name: string;
    description: string;
    order: number;
    materials: CourseMaterial[];
}

const CourseManagement: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState<Module[]>([]);
    const [selectedModule, setSelectedModule] = useState<Module | null>(null);
    const [showAddMaterial, setShowAddMaterial] = useState(false);
    const [showAddModule, setShowAddModule] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [materialForm, setMaterialForm] = useState({
        title: '',
        description: '',
        module: '',
        isPublic: true,
        file: null as File | null,
    });
    const [moduleForm, setModuleForm] = useState({
        name: '',
        description: '',
        order: 0,
    });

    useEffect(() => {
        fetchModules();
    }, [id]);

    const fetchModules = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/courses/${id}/modules`);
      setModules(response.data.modules);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMaterialForm({ ...materialForm, file });
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('title', materialForm.title);
    formData.append('description', materialForm.description);
    formData.append('moduleId', selectedModule?.id.toString() || '');
    formData.append('isPublic', materialForm.isPublic.toString());
    formData.append('file', materialForm.file);

    try {
      const response = await api.post(`/courses/${id}/materials`, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      toast.success('Material added successfully');
      fetchModules();
      setShowAddMaterial(false);
      setMaterialForm({
        title: '',
        description: '',
        module: '',
        isPublic: true,
        file: null,
      });
      setUploadProgress(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add material');
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${id}/modules`, moduleForm);
      toast.success('Module added successfully');
      fetchModules();
      setShowAddModule(false);
      setModuleForm({
        name: '',
        description: '',
        order: 0,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add module');
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await api.delete(`/courses/${id}/materials/${materialId}`);
      toast.success('Material deleted successfully');
      fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete material');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this module and all its materials?')) {
      return;
    }

    try {
      await api.delete(`/courses/${id}/modules/${moduleId}`);
      toast.success('Module deleted successfully');
      fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete module');
    }
  };

  const toggleMaterialVisibility = async (materialId: number, isPublic: boolean) => {
    try {
      await api.patch(`/courses/${id}/materials/${materialId}`, {
        isPublic: !isPublic,
      });
      toast.success('Material visibility updated');
      fetchModules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update visibility');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FaFile className="w-6 h-6 text-red-500" />;
      case 'video':
        return <FaVideo className="w-6 h-6 text-blue-500" />;
      case 'document':
        return <FaBook className="w-6 h-6 text-green-500" />;
      default:
        return <FaLink className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading course materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Course Materials</h1>
            <p className="text-slate-600">Manage your course content and resources</p>
          </div>
          <button
            onClick={() => setShowAddModule(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaBook className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No Modules Yet
            </h3>
            <p className="text-slate-600 max-w-md mx-auto mb-6">
              Get started by creating your first module to organize your course materials.
            </p>
            <button
              onClick={() => setShowAddModule(true)}
              className="btn btn-primary"
            >
              Create First Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Modules List */}
            <div className="lg:col-span-1 space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-4 cursor-pointer transition-all duration-200 ${
                    selectedModule?.id === module.id
                      ? 'border-blue-500'
                      : 'border-slate-200 hover:border-blue-200'
                  }`}
                  onClick={() => setSelectedModule(module)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {module.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {module.description}
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <span>{module.materials.length} materials</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Materials List */}
            <div className="lg:col-span-2">
              {selectedModule ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedModule.name}
                      </h2>
                      <p className="text-slate-600">{selectedModule.description}</p>
                    </div>
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <FaUpload className="w-4 h-4" />
                      <span>Add Material</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedModule.materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center space-x-4">
                          {getFileIcon(material.fileType)}
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {material.title}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {material.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                              <span>{material.fileType.toUpperCase()}</span>
                              <span>
                                {(material.fileSize || 0) / 1024 / 1024} MB
                              </span>
                              <span>{material.downloadCount} downloads</span>
                              <span>{material.viewCount} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              toggleMaterialVisibility(
                                material.id,
                                material.isPublic
                              )
                            }
                            className={`p-2 rounded-lg ${
                              material.isPublic
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-red-600 hover:text-red-700'
                            }`}
                          >
                            {material.isPublic ? (
                              <FaLockOpen className="w-4 h-4" />
                            ) : (
                              <FaLock className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-blue-600 hover:text-blue-700"
                          >
                            <FaDownload className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            className="p-2 rounded-lg text-red-600 hover:text-red-700"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaBook className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Select a Module
                  </h3>
                  <p className="text-slate-600">
                    Choose a module from the left to view and manage its materials
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      {showAddMaterial && selectedModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Add New Material
            </h3>
            <form onSubmit={handleAddMaterial}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={materialForm.title}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, title: e.target.value })
                    }
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={materialForm.description}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        description: e.target.value,
                      })
                    }
                    className="input input-bordered w-full h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={materialForm.isPublic}
                    onChange={(e) =>
                      setMaterialForm({
                        ...materialForm,
                        isPublic: e.target.checked,
                      })
                    }
                    className="checkbox"
                  />
                  <span className="ml-2 text-sm text-slate-600">
                    Make this material public
                  </span>
                </div>
                {uploadProgress > 0 && (
                  <div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Add New Module
            </h3>
            <form onSubmit={handleAddModule}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Module Name
                  </label>
                  <input
                    type="text"
                    value={moduleForm.name}
                    onChange={(e) =>
                      setModuleForm({ ...moduleForm, name: e.target.value })
                    }
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={moduleForm.description}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        description: e.target.value,
                      })
                    }
                    className="input input-bordered w-full h-24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        order: parseInt(e.target.value),
                      })
                    }
                    className="input input-bordered w-full"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;