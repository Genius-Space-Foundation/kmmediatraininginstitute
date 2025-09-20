import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Eye,
  UserPlus,
  BookOpen,
} from "lucide-react";

interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  bio?: string;
  experience: number;
  createdAt: string;
  updatedAt?: string;
  coursesCount?: number;
  studentsCount?: number;
}

interface CreateTrainerData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialization: string;
  bio?: string;
  experience: number;
}

const AdminTrainerManagement: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [createData, setCreateData] = useState<CreateTrainerData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    bio: "",
    experience: 0,
  });
  const [editData, setEditData] = useState<Partial<Trainer>>({});

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/trainers/admin/all");
      setTrainers(response.data.trainers || []);
    } catch (error: any) {
      console.error("Error fetching trainers:", error);
      toast.error(error.response?.data?.message || "Failed to fetch trainers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/trainers/admin/register", createData);
      toast.success("Trainer created successfully");
      setShowCreateModal(false);
      setCreateData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        bio: "",
        experience: 0,
      });
      fetchTrainers();
    } catch (error: any) {
      console.error("Error creating trainer:", error);
      toast.error(error.response?.data?.message || "Failed to create trainer");
    }
  };

  const handleEditTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    try {
      const response = await api.put(
        `/trainers/admin/${selectedTrainer.id}`,
        editData
      );
      toast.success("Trainer updated successfully");
      setShowEditModal(false);
      setSelectedTrainer(null);
      setEditData({});
      fetchTrainers();
    } catch (error: any) {
      console.error("Error updating trainer:", error);
      toast.error(error.response?.data?.message || "Failed to update trainer");
    }
  };

  const handleDeleteTrainer = async (trainerId: number) => {
    if (!window.confirm("Are you sure you want to delete this trainer?"))
      return;

    try {
      await api.delete(`/trainers/admin/${trainerId}`);
      toast.success("Trainer deleted successfully");
      fetchTrainers();
    } catch (error: any) {
      console.error("Error deleting trainer:", error);
      toast.error(error.response?.data?.message || "Failed to delete trainer");
    }
  };

  const openEditModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setEditData({
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      phone: trainer.phone || "",
      specialization: trainer.specialization,
      bio: trainer.bio || "",
      experience: trainer.experience,
    });
    setShowEditModal(true);
  };

  const filteredTrainers = trainers.filter(
    (trainer) =>
      trainer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-600">Loading trainers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Trainer Management
          </h3>
          <p className="text-gray-600">
            Manage trainers and their course assignments
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Trainer
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trainers..."
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

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainers.map((trainer) => (
          <div
            key={trainer.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(trainer)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteTrainer(trainer.id)}
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
                <h4 className="text-lg font-semibold text-gray-900">
                  {trainer.firstName} {trainer.lastName}
                </h4>
                <p className="text-sm text-gray-600">
                  {trainer.specialization}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {trainer.email}
                </div>
                {trainer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {trainer.phone}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2" />
                  {trainer.experience} years experience
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Joined {new Date(trainer.createdAt).toLocaleDateString()}
                </div>
              </div>

              {trainer.bio && (
                <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                  {trainer.bio}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {trainer.coursesCount || 0} courses
                  </span>
                  <span className="flex items-center">
                    <GraduationCap className="h-4 w-4 mr-1" />
                    {trainer.studentsCount || 0} students
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrainers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No trainers found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "No trainers match your search criteria."
              : "Get started by adding your first trainer."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Trainer
            </button>
          )}
        </div>
      )}

      {/* Create Trainer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Create New Trainer
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrainer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createData.firstName}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createData.lastName}
                    onChange={(e) =>
                      setCreateData({ ...createData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={createData.email}
                    onChange={(e) =>
                      setCreateData({ ...createData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={createData.password}
                    onChange={(e) =>
                      setCreateData({ ...createData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={createData.phone}
                    onChange={(e) =>
                      setCreateData({ ...createData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={createData.experience}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={createData.specialization}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      specialization: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={createData.bio}
                  onChange={(e) =>
                    setCreateData({ ...createData, bio: e.target.value })
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
                  Create Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trainer Modal */}
      {showEditModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Edit Trainer
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditTrainer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.firstName || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editData.lastName || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editData.experience || 0}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={editData.specialization || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, specialization: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editData.bio || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
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
                  Update Trainer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainerManagement;


