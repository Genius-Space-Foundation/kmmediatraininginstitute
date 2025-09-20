import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { industrialApi } from "../utils/api";

interface IndustrialAttachmentOpportunity {
  id: number;
  course_id: number;
  company_name: string;
  position_title: string;
  description: string;
  requirements: string[];
  duration_weeks: number;
  start_date: string;
  end_date: string;
  location: string;
  stipend?: number;
  max_students: number;
  status: string;
  created_at: string;
  course_title?: string;
  trainer_name?: string;
}

interface AttachmentApplication {
  id: number;
  attachment_id: number;
  student_id: number;
  cover_letter: string;
  resume_url?: string;
  portfolio_url?: string;
  status: string;
  feedback?: string;
  applied_at: string;
  reviewed_at?: string;
  student_name?: string;
  student_email?: string;
  company_name?: string;
  position_title?: string;
}

const IndustrialAttachments: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<
    IndustrialAttachmentOpportunity[]
  >([]);
  const [applications, setApplications] = useState<AttachmentApplication[]>([]);
  const [myApplications, setMyApplications] = useState<AttachmentApplication[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<IndustrialAttachmentOpportunity | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Form states
  const [formData, setFormData] = useState({
    company_name: "",
    position_title: "",
    description: "",
    requirements: "",
    duration_weeks: 4,
    start_date: "",
    end_date: "",
    location: "",
    stipend: "",
    max_students: 1,
  });

  const [applicationData, setApplicationData] = useState({
    cover_letter: "",
    resume_url: "",
    portfolio_url: "",
  });

  useEffect(() => {
    fetchOpportunities();
    if (user?.role === "user") {
      fetchMyApplications();
    }
  }, [courseId, user]);

  const fetchOpportunities = async () => {
    try {
      const data = await industrialApi.getIndustrialOpportunities(
        Number(courseId)
      );
      setOpportunities(data);
    } catch (err) {
      setError("Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const data = await industrialApi.getStudentApplications();
      setMyApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const fetchApplications = async (opportunityId: number) => {
    try {
      const data = await industrialApi.getOpportunityApplications(
        opportunityId
      );
      setApplications(data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const opportunityData = {
        ...formData,
        course_id: parseInt(courseId!),
        requirements: formData.requirements
          .split("\n")
          .filter((req) => req.trim()),
        stipend: formData.stipend ? parseFloat(formData.stipend) : undefined,
      };

      const data = await industrialApi.createIndustrialOpportunity(
        opportunityData
      );
      setOpportunities([data, ...opportunities]);
      setShowCreateForm(false);
      setFormData({
        company_name: "",
        position_title: "",
        description: "",
        requirements: "",
        duration_weeks: 4,
        start_date: "",
        end_date: "",
        location: "",
        stipend: "",
        max_students: 1,
      });
    } catch (err) {
      setError("Failed to create opportunity");
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpportunity) return;

    try {
      const applicationPayload = {
        ...applicationData,
        opportunity_id: selectedOpportunity.id,
      };

      await industrialApi.applyForIndustrialAttachment(applicationPayload);
      setShowApplicationForm(false);
      setApplicationData({
        cover_letter: "",
        resume_url: "",
        portfolio_url: "",
      });
      setSelectedOpportunity(null);
      fetchMyApplications();
    } catch (err) {
      setError("Failed to apply");
    }
  };

  const handleReviewApplication = async (
    applicationId: number,
    status: string,
    feedback: string
  ) => {
    try {
      await industrialApi.updateApplicationStatus(applicationId, {
        status,
        feedback,
      });
      if (selectedOpportunity) {
        fetchApplications(selectedOpportunity.id);
      }
    } catch (err) {
      setError("Failed to review application");
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    if (filter === "all") return true;
    return opportunity.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Industrial Attachments
        </h2>
        {user?.role === "trainer" && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Opportunity
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg ${
            filter === "active"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg ${
            filter === "completed"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Completed
        </button>
      </div>

      {/* My Applications (Student View) */}
      {user?.role === "user" && myApplications.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            My Applications
          </h3>
          <div className="space-y-2">
            {myApplications.map((app) => (
              <div
                key={app.id}
                className="flex justify-between items-center bg-white rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{app.company_name}</p>
                  <p className="text-sm text-gray-600">{app.position_title}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    app.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "accepted"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities List */}
      <div className="grid gap-6">
        {filteredOpportunities.map((opportunity) => (
          <div
            key={opportunity.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {opportunity.position_title}
                </h3>
                <p className="text-lg text-gray-600">
                  {opportunity.company_name}
                </p>
                <p className="text-gray-500">{opportunity.location}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  opportunity.status === "active"
                    ? "bg-green-100 text-green-800"
                    : opportunity.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {opportunity.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{opportunity.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-gray-900">
                  {opportunity.duration_weeks} weeks
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Start Date</p>
                <p className="text-gray-900">
                  {new Date(opportunity.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End Date</p>
                <p className="text-gray-900">
                  {new Date(opportunity.end_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stipend</p>
                <p className="text-gray-900">
                  {opportunity.stipend
                    ? `$${opportunity.stipend}/week`
                    : "Unpaid"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Requirements:
              </h4>
              <ul className="list-disc list-inside text-gray-700">
                {opportunity.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-4">
              {user?.role === "user" && opportunity.status === "active" && (
                <button
                  onClick={() => {
                    setSelectedOpportunity(opportunity);
                    setShowApplicationForm(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Now
                </button>
              )}
              {user?.role === "trainer" && (
                <button
                  onClick={() => {
                    setSelectedOpportunity(opportunity);
                    fetchApplications(opportunity.id);
                    setShowApplicationsModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Applications ({opportunity.max_students})
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Opportunity Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Create Industrial Attachment Opportunity
            </h3>
            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position Title
                  </label>
                  <input
                    type="text"
                    value={formData.position_title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position_title: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements (one per line)
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_weeks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_weeks: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_students}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_students: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stipend ($/week)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.stipend}
                    onChange={(e) =>
                      setFormData({ ...formData, stipend: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Opportunity
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationForm && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Apply for Industrial Attachment
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedOpportunity.position_title} at{" "}
              {selectedOpportunity.company_name}
            </p>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter
                </label>
                <textarea
                  value={applicationData.cover_letter}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      cover_letter: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Explain why you're interested in this opportunity and what you can contribute..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume URL (optional)
                </label>
                <input
                  type="url"
                  value={applicationData.resume_url}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      resume_url: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/resume.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portfolio URL (optional)
                </label>
                <input
                  type="url"
                  value={applicationData.portfolio_url}
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      portfolio_url: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/portfolio"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Modal */}
      {showApplicationsModal && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Applications for {selectedOpportunity.position_title}
            </h3>
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{application.student_name}</p>
                      <p className="text-sm text-gray-600">
                        {application.student_email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Applied:{" "}
                        {new Date(application.applied_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Cover Letter:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {application.cover_letter}
                    </p>
                  </div>

                  {(application.resume_url || application.portfolio_url) && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Links:</h4>
                      <div className="space-y-1">
                        {application.resume_url && (
                          <p>
                            <a
                              href={application.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Resume
                            </a>
                          </p>
                        )}
                        {application.portfolio_url && (
                          <p>
                            <a
                              href={application.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Portfolio
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {application.status === "pending" && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">
                        Review Application:
                      </h4>
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          placeholder="Feedback"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          id={`feedback-${application.id}`}
                        />
                        <button
                          onClick={() => {
                            const feedback = (
                              document.getElementById(
                                `feedback-${application.id}`
                              ) as HTMLInputElement
                            )?.value;
                            if (feedback) {
                              handleReviewApplication(
                                application.id,
                                "accepted",
                                feedback
                              );
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            const feedback = (
                              document.getElementById(
                                `feedback-${application.id}`
                              ) as HTMLInputElement
                            )?.value;
                            if (feedback) {
                              handleReviewApplication(
                                application.id,
                                "rejected",
                                feedback
                              );
                            }
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {application.feedback && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="font-semibold">Feedback:</p>
                      <p className="text-gray-700 mt-1">
                        {application.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowApplicationsModal(false)}
              className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrialAttachments;
