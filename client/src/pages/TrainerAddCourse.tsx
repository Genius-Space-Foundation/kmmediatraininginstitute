import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  FaArrowLeft,
  FaBook,
  FaFileAlt,
  FaTasks,
  FaQuestionCircle,
} from "react-icons/fa";

const TrainerAddCourse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Trainers can no longer create courses - they are assigned by admins
  const handleGoBack = () => {
    navigate("/trainer/courses");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Course Assignment
          </h1>
          <p className="text-slate-600 mt-2">
            Courses are assigned by administrators
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBook className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Courses Are Assigned by Administrators
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              As a trainer, you cannot create new courses directly. Courses are
              created and assigned to you by administrators. Once assigned, you
              can manage the course content, materials, assignments, and
              quizzes.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                What you can do with assigned courses:
              </h3>
              <ul className="text-left text-blue-800 space-y-2 max-w-md mx-auto">
                <li className="flex items-center">
                  <FaBook className="w-4 h-4 mr-2 text-blue-600" />
                  Update course descriptions and content
                </li>
                <li className="flex items-center">
                  <FaFileAlt className="w-4 h-4 mr-2 text-blue-600" />
                  Upload course materials
                </li>
                <li className="flex items-center">
                  <FaTasks className="w-4 h-4 mr-2 text-blue-600" />
                  Create and manage assignments
                </li>
                <li className="flex items-center">
                  <FaQuestionCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Create and manage quizzes
                </li>
              </ul>
            </div>
            <button
              onClick={handleGoBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              View Assigned Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerAddCourse;
