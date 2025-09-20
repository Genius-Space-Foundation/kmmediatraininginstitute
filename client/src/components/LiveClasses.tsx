import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

interface LiveClass {
  id: number;
  courseId: number;
  courseName?: string;
  title: string;
  description?: string;
  scheduledDate: string;
  durationMinutes: number;
  maxParticipants: number;
  meetingUrl?: string;
  meetingId?: string;
  meetingPassword?: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  recordingUrl?: string;
  createdBy: number;
  creatorName?: string;
  participants?: Array<{
    id: number;
    studentId: number;
    studentName: string;
    studentEmail: string;
    joinedAt?: string;
    leftAt?: string;
    attendanceDuration: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface LiveClassesProps {
  courseId: number;
  isTrainer?: boolean;
}

const LiveClasses: React.FC<LiveClassesProps> = ({
  courseId,
  isTrainer = false,
}) => {
  const { user } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<LiveClass | null>(null);
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "live" | "completed" | "cancelled"
  >("all");

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    durationMinutes: 60,
    maxParticipants: 100,
    meetingUrl: "",
    meetingId: "",
    meetingPassword: "",
  });

  useEffect(() => {
    fetchLiveClasses();
  }, [courseId, filter]);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/live-classes/course/${courseId}`, {
        params: filter !== "all" ? { status: filter } : {},
      });
      setLiveClasses(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching live classes:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch live classes"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/live-classes", {
        courseId,
        ...formData,
      });

      toast.success("Live class created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchLiveClasses();
    } catch (error: any) {
      console.error("Error creating live class:", error);
      toast.error(
        error.response?.data?.message || "Failed to create live class"
      );
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      const response = await api.put(
        `/live-classes/${selectedClass.id}`,
        formData
      );

      toast.success("Live class updated successfully!");
      setShowEditModal(false);
      setSelectedClass(null);
      resetForm();
      fetchLiveClasses();
    } catch (error: any) {
      console.error("Error updating live class:", error);
      toast.error(
        error.response?.data?.message || "Failed to update live class"
      );
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!window.confirm("Are you sure you want to delete this live class?"))
      return;

    try {
      await api.delete(`/live-classes/${classId}`);
      toast.success("Live class deleted successfully!");
      fetchLiveClasses();
    } catch (error: any) {
      console.error("Error deleting live class:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete live class"
      );
    }
  };

  const handleJoinClass = async (classId: number) => {
    try {
      const response = await api.post(`/live-classes/${classId}/join`);
      const { meetingUrl, meetingId, meetingPassword } = response.data.data;

      // Open meeting URL in new tab
      if (meetingUrl) {
        window.open(meetingUrl, "_blank");
      } else {
        toast(
          `Meeting ID: ${meetingId}${
            meetingPassword ? `\nPassword: ${meetingPassword}` : ""
          }`
        );
      }

      toast.success("Joined live class successfully!");
      fetchLiveClasses();
    } catch (error: any) {
      console.error("Error joining live class:", error);
      toast.error(error.response?.data?.message || "Failed to join live class");
    }
  };

  const handleLeaveClass = async (classId: number) => {
    try {
      await api.post(`/live-classes/${classId}/leave`);
      toast.success("Left live class successfully!");
      fetchLiveClasses();
    } catch (error: any) {
      console.error("Error leaving live class:", error);
      toast.error(
        error.response?.data?.message || "Failed to leave live class"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      scheduledDate: "",
      durationMinutes: 60,
      maxParticipants: 100,
      meetingUrl: "",
      meetingId: "",
      meetingPassword: "",
    });
  };

  const openEditModal = (liveClass: LiveClass) => {
    setSelectedClass(liveClass);
    setFormData({
      title: liveClass.title,
      description: liveClass.description || "",
      scheduledDate: new Date(liveClass.scheduledDate)
        .toISOString()
        .slice(0, 16),
      durationMinutes: liveClass.durationMinutes,
      maxParticipants: liveClass.maxParticipants,
      meetingUrl: liveClass.meetingUrl || "",
      meetingId: liveClass.meetingId || "",
      meetingPassword: liveClass.meetingPassword || "",
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "live":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "live":
        return <Play className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isClassUpcoming = (scheduledDate: string) => {
    return new Date(scheduledDate) > new Date();
  };

  const isClassLive = (scheduledDate: string, durationMinutes: number) => {
    const start = new Date(scheduledDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    const now = new Date();
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading live classes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Classes</h2>
          <p className="text-gray-600">Interactive live learning sessions</p>
        </div>

        {isTrainer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Class</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {["all", "scheduled", "live", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Live Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveClasses.map((liveClass) => (
          <div
            key={liveClass.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {liveClass.title}
                </h3>
                {liveClass.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {liveClass.description}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                    liveClass.status
                  )}`}
                >
                  {getStatusIcon(liveClass.status)}
                  <span>{liveClass.status}</span>
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(liveClass.scheduledDate)}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{liveClass.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  {liveClass.participants?.length || 0} /{" "}
                  {liveClass.maxParticipants} participants
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {liveClass.meetingUrl && (
                  <a
                    href={liveClass.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Join</span>
                  </a>
                )}

                {liveClass.recordingUrl && (
                  <a
                    href={liveClass.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm"
                  >
                    <Video className="h-4 w-4" />
                    <span>Recording</span>
                  </a>
                )}
              </div>

              {isTrainer && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(liveClass)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(liveClass.id)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {liveClasses.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Live Classes
          </h3>
          <p className="text-gray-600">
            {isTrainer
              ? "Schedule your first live class to get started."
              : "No live classes are scheduled yet."}
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Live Class
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting URL
                </label>
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={formData.meetingId}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={formData.meetingPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meetingPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Live Class
            </h3>
            <form onSubmit={handleUpdateClass} className="space-y-4">
              {/* Same form fields as create modal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxParticipants: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting URL
                </label>
                <input
                  type="url"
                  value={formData.meetingUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={formData.meetingId}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={formData.meetingPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meetingPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedClass(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
