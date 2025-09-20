import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { capstoneApi } from "../utils/api";

interface CapstoneProject {
  id: number;
  course_id: number;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  due_date: string;
  max_team_size: number;
  status: string;
  created_at: string;
  course_title?: string;
  trainer_name?: string;
}

interface CapstoneSubmission {
  id: number;
  project_id: number;
  student_id: number;
  submission_text: string;
  team_members?: string[];
  status: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

const CapstoneProjects: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  const [submissions, setSubmissions] = useState<CapstoneSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<CapstoneProject | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    objectives: "",
    requirements: "",
    due_date: "",
    max_team_size: 1,
  });

  const [submissionData, setSubmissionData] = useState({
    submission_text: "",
    team_members: "",
  });

  useEffect(() => {
    fetchProjects();
    if (user?.role === "user") {
      fetchSubmissions();
    }
  }, [courseId, user]);

  const fetchProjects = async () => {
    try {
      const data = await capstoneApi.getCapstoneProjects(Number(courseId));
      setProjects(data);
    } catch (err) {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      if (selectedProject?.id) {
        const data = await capstoneApi.getCapstoneSubmissions(
          selectedProject.id
        );
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        course_id: parseInt(courseId!),
        objectives: formData.objectives.split("\n").filter((obj) => obj.trim()),
        requirements: formData.requirements
          .split("\n")
          .filter((req) => req.trim()),
      };

      const data = await capstoneApi.createCapstoneProject(projectData);
      setProjects([data, ...projects]);
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        objectives: "",
        requirements: "",
        due_date: "",
        max_team_size: 1,
      });
    } catch (err) {
      setError("Failed to create project");
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const submissionPayload = {
        ...submissionData,
        project_id: selectedProject.id,
        team_members: submissionData.team_members
          ? submissionData.team_members
              .split(",")
              .map((member) => member.trim())
          : undefined,
      };

      await capstoneApi.submitCapstoneProject(submissionPayload);
      setShowSubmissionForm(false);
      setSubmissionData({ submission_text: "", team_members: "" });
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      setError("Failed to submit project");
    }
  };

  const handleGradeSubmission = async (
    submissionId: number,
    grade: number,
    feedback: string
  ) => {
    try {
      await capstoneApi.gradeCapstoneSubmission(submissionId, {
        grade,
        feedback,
      });
      fetchSubmissions();
    } catch (err) {
      setError("Failed to grade submission");
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status === filter;
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
        <h2 className="text-2xl font-bold text-gray-900">Capstone Projects</h2>
        {user?.role === "trainer" && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Project
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

      {/* Projects List */}
      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.title}
                </h3>
                <p className="text-gray-600">
                  Due: {new Date(project.due_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Max Team Size: {project.max_team_size}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  project.status === "active"
                    ? "bg-green-100 text-green-800"
                    : project.status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {project.status}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{project.description}</p>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Objectives:</h4>
              <ul className="list-disc list-inside text-gray-700">
                {project.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Requirements:
              </h4>
              <ul className="list-disc list-inside text-gray-700">
                {project.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-4">
              {user?.role === "user" && project.status === "active" && (
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowSubmissionForm(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Project
                </button>
              )}
              {user?.role === "trainer" && (
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    fetchSubmissions();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Submissions
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Create Capstone Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objectives (one per line)
                </label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) =>
                    setFormData({ ...formData, objectives: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Objective 1&#10;Objective 2&#10;Objective 3"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_team_size}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_team_size: parseInt(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
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

      {/* Submission Modal */}
      {showSubmissionForm && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Submit Capstone Project
            </h3>
            <p className="text-gray-600 mb-4">
              Project: {selectedProject.title}
            </p>
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Text
                </label>
                <textarea
                  value={submissionData.submission_text}
                  onChange={(e) =>
                    setSubmissionData({
                      ...submissionData,
                      submission_text: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Describe your project, implementation details, challenges faced, and solutions..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Members (comma-separated)
                </label>
                <input
                  type="text"
                  value={submissionData.team_members}
                  onChange={(e) =>
                    setSubmissionData({
                      ...submissionData,
                      team_members: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe, Jane Smith"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmissionForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {selectedProject && user?.role === "trainer" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Submissions for {selectedProject.title}
            </h3>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        Student: {submission.student_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        Submitted:{" "}
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        submission.status === "submitted"
                          ? "bg-yellow-100 text-yellow-800"
                          : submission.status === "graded"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Submission:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {submission.submission_text}
                    </p>
                  </div>

                  {submission.team_members &&
                    submission.team_members.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Team Members:</h4>
                        <p className="text-gray-700">
                          {submission.team_members.join(", ")}
                        </p>
                      </div>
                    )}

                  {submission.status === "submitted" && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Grade Submission:</h4>
                      <div className="flex space-x-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Grade (0-100)"
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          id={`grade-${submission.id}`}
                        />
                        <input
                          type="text"
                          placeholder="Feedback"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          id={`feedback-${submission.id}`}
                        />
                        <button
                          onClick={() => {
                            const grade = (
                              document.getElementById(
                                `grade-${submission.id}`
                              ) as HTMLInputElement
                            )?.value;
                            const feedback = (
                              document.getElementById(
                                `feedback-${submission.id}`
                              ) as HTMLInputElement
                            )?.value;
                            if (grade && feedback) {
                              handleGradeSubmission(
                                submission.id,
                                parseInt(grade),
                                feedback
                              );
                            }
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Grade
                        </button>
                      </div>
                    </div>
                  )}

                  {submission.grade && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="font-semibold">
                        Grade: {submission.grade}/100
                      </p>
                      {submission.feedback && (
                        <p className="text-gray-700 mt-1">
                          {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedProject(null)}
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

export default CapstoneProjects;
