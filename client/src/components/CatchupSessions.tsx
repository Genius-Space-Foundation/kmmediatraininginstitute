import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Star,
  Target,
} from "lucide-react";

interface CatchupSession {
  id: number;
  courseId: number;
  courseName?: string;
  studentId: number;
  studentName?: string;
  mentorId: number;
  mentorName?: string;
  sessionDate: string;
  sessionType: "weekly_review" | "one_on_one" | "group" | "emergency";
  topicsCovered: string[];
  studentConcerns?: string;
  mentorFeedback?: string;
  actionItems: string[];
  nextSessionDate?: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  studentSatisfaction?: number;
  mentorRating?: number;
  createdAt: string;
  updatedAt: string;
}

interface CatchupSessionsProps {
  courseId: number;
  isTrainer?: boolean;
}

const CatchupSessions: React.FC<CatchupSessionsProps> = ({
  courseId,
  isTrainer = false,
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CatchupSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CatchupSession | null>(
    null
  );
  const [filter, setFilter] = useState<
    "all" | "scheduled" | "completed" | "cancelled" | "rescheduled"
  >("all");
  const [studentFilter, setStudentFilter] = useState<string>("");

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    studentId: "",
    mentorId: "",
    sessionDate: "",
    sessionType: "weekly_review" as
      | "weekly_review"
      | "one_on_one"
      | "group"
      | "emergency",
    topicsCovered: [] as string[],
    studentConcerns: "",
    actionItems: [] as string[],
    nextSessionDate: "",
    mentorFeedback: "",
    studentSatisfaction: 0,
    mentorRating: 0,
  });

  // Available students and mentors
  const [students, setStudents] = useState<
    Array<{ id: number; name: string; email: string }>
  >([]);
  const [mentors, setMentors] = useState<
    Array<{ id: number; name: string; email: string }>
  >([]);

  useEffect(() => {
    fetchSessions();
    if (isTrainer) {
      fetchStudents();
      fetchMentors();
    }
  }, [courseId, filter, studentFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== "all") params.status = filter;
      if (studentFilter) params.studentId = studentFilter;

      const response = await api.get(`/catchup-sessions/course/${courseId}`, {
        params,
      });
      setSessions(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching catchup sessions:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch catchup sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/registrations/admin/all`, {
        params: { courseId, status: "approved" },
      });
      const studentData =
        response.data.registrations?.map((reg: any) => ({
          id: reg.userId,
          name: `${reg.firstName} ${reg.lastName}`,
          email: reg.email,
        })) || [];
      setStudents(studentData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await api.get("/trainers/admin/all");
      const mentorData =
        response.data.trainers?.map((trainer: any) => ({
          id: trainer.id,
          name: `${trainer.firstName} ${trainer.lastName}`,
          email: trainer.email,
        })) || [];
      setMentors(mentorData);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/catchup-sessions", {
        courseId,
        ...formData,
      });

      toast.success("Catchup session created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchSessions();
    } catch (error: any) {
      console.error("Error creating catchup session:", error);
      toast.error(
        error.response?.data?.message || "Failed to create catchup session"
      );
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    try {
      const response = await api.put(
        `/catchup-sessions/${selectedSession.id}`,
        formData
      );

      toast.success("Catchup session updated successfully!");
      setShowEditModal(false);
      setSelectedSession(null);
      resetForm();
      fetchSessions();
    } catch (error: any) {
      console.error("Error updating catchup session:", error);
      toast.error(
        error.response?.data?.message || "Failed to update catchup session"
      );
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (
      !window.confirm("Are you sure you want to delete this catchup session?")
    )
      return;

    try {
      await api.delete(`/catchup-sessions/${sessionId}`);
      toast.success("Catchup session deleted successfully!");
      fetchSessions();
    } catch (error: any) {
      console.error("Error deleting catchup session:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete catchup session"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      mentorId: "",
      sessionDate: "",
      sessionType: "weekly_review",
      topicsCovered: [],
      studentConcerns: "",
      actionItems: [],
      nextSessionDate: "",
      mentorFeedback: "",
      studentSatisfaction: 0,
      mentorRating: 0,
    });
  };

  const openEditModal = (session: CatchupSession) => {
    setSelectedSession(session);
    setFormData({
      studentId: session.studentId.toString(),
      mentorId: session.mentorId.toString(),
      sessionDate: new Date(session.sessionDate).toISOString().slice(0, 16),
      sessionType: session.sessionType,
      topicsCovered: session.topicsCovered,
      studentConcerns: session.studentConcerns || "",
      actionItems: session.actionItems,
      nextSessionDate: session.nextSessionDate
        ? new Date(session.nextSessionDate).toISOString().slice(0, 16)
        : "",
      mentorFeedback: session.mentorFeedback || "",
      studentSatisfaction: session.studentSatisfaction || 0,
      mentorRating: session.mentorRating || 0,
    });
    setShowEditModal(true);
  };

  const addTopic = () => {
    setFormData({
      ...formData,
      topicsCovered: [...formData.topicsCovered, ""],
    });
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...formData.topicsCovered];
    newTopics[index] = value;
    setFormData({ ...formData, topicsCovered: newTopics });
  };

  const removeTopic = (index: number) => {
    const newTopics = formData.topicsCovered.filter((_, i) => i !== index);
    setFormData({ ...formData, topicsCovered: newTopics });
  };

  const addActionItem = () => {
    setFormData({
      ...formData,
      actionItems: [...formData.actionItems, ""],
    });
  };

  const updateActionItem = (index: number, value: string) => {
    const newItems = [...formData.actionItems];
    newItems[index] = value;
    setFormData({ ...formData, actionItems: newItems });
  };

  const removeActionItem = (index: number) => {
    const newItems = formData.actionItems.filter((_, i) => i !== index);
    setFormData({ ...formData, actionItems: newItems });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "rescheduled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "weekly_review":
        return "bg-blue-50 text-blue-700";
      case "one_on_one":
        return "bg-green-50 text-green-700";
      case "group":
        return "bg-purple-50 text-purple-700";
      case "emergency":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading catchup sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catchup Sessions</h2>
          <p className="text-gray-600">
            Weekly reviews and mentorship sessions
          </p>
        </div>

        {isTrainer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Session</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex space-x-2">
          {["all", "scheduled", "completed", "cancelled", "rescheduled"].map(
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

        {isTrainer && (
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                      session.status
                    )}`}
                  >
                    {getStatusIcon(session.status)}
                    <span>{session.status}</span>
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(
                      session.sessionType
                    )}`}
                  >
                    {session.sessionType.replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {session.studentName} & {session.mentorName}
                </h3>
                <p className="text-sm text-gray-600">{session.courseName}</p>
              </div>

              {isTrainer && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(session)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(session.sessionDate)}</span>
                </div>
                {session.nextSessionDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Next: {formatDate(session.nextSessionDate)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {session.studentSatisfaction && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 mr-2" />
                    <span>Student Rating: {session.studentSatisfaction}/5</span>
                  </div>
                )}
                {session.mentorRating && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-2" />
                    <span>Mentor Rating: {session.mentorRating}/5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Topics Covered */}
            {session.topicsCovered.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Topics Covered:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {session.topicsCovered.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items */}
            {session.actionItems.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Action Items:
                </h4>
                <ul className="space-y-1">
                  {session.actionItems.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-600"
                    >
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Student Concerns */}
            {session.studentConcerns && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Student Concerns:
                </h4>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                  {session.studentConcerns}
                </p>
              </div>
            )}

            {/* Mentor Feedback */}
            {session.mentorFeedback && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Mentor Feedback:
                </h4>
                <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  {session.mentorFeedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Catchup Sessions
          </h3>
          <p className="text-gray-600">
            {isTrainer
              ? "Schedule your first catchup session to get started."
              : "No catchup sessions are scheduled yet."}
          </p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Catchup Session
            </h3>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mentor *
                  </label>
                  <select
                    value={formData.mentorId}
                    onChange={(e) =>
                      setFormData({ ...formData, mentorId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.sessionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type *
                  </label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sessionType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="weekly_review">Weekly Review</option>
                    <option value="one_on_one">One-on-One</option>
                    <option value="group">Group Session</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topics Covered
                </label>
                <div className="space-y-2">
                  {formData.topicsCovered.map((topic, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => updateTopic(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter topic"
                      />
                      <button
                        type="button"
                        onClick={() => removeTopic(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTopic}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Topic
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Concerns
                </label>
                <textarea
                  value={formData.studentConcerns}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentConcerns: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any concerns or challenges the student is facing..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Items
                </label>
                <div className="space-y-2">
                  {formData.actionItems.map((item, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) =>
                          updateActionItem(index, e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter action item"
                      />
                      <button
                        type="button"
                        onClick={() => removeActionItem(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addActionItem}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Action Item
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Session Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.nextSessionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nextSessionDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar to Create Modal but with pre-filled data */}
      {showEditModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Catchup Session
            </h3>
            <form onSubmit={handleUpdateSession} className="space-y-4">
              {/* Similar form fields as create modal but with additional fields for feedback and ratings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) =>
                      setFormData({ ...formData, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mentor *
                  </label>
                  <select
                    value={formData.mentorId}
                    onChange={(e) =>
                      setFormData({ ...formData, mentorId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Mentor</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.sessionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Type *
                  </label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sessionType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="weekly_review">Weekly Review</option>
                    <option value="one_on_one">One-on-One</option>
                    <option value="group">Group Session</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Add mentor feedback and ratings fields for edit modal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mentor Feedback
                </label>
                <textarea
                  value={formData.mentorFeedback}
                  onChange={(e) =>
                    setFormData({ ...formData, mentorFeedback: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Mentor's feedback and notes..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Satisfaction (1-5)
                  </label>
                  <input
                    type="number"
                    value={formData.studentSatisfaction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        studentSatisfaction: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mentor Rating (1-5)
                  </label>
                  <input
                    type="number"
                    value={formData.mentorRating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mentorRating: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="5"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedSession(null);
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
                  Update Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatchupSessions;











