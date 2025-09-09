import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SubmissionGradingPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-4">Grade Submission</h1>
        <p>Submission ID: {submissionId}</p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <input 
            type="number" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            placeholder="Enter grade"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-md" 
            rows={4} 
            placeholder="Enter feedback"
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <button 
            onClick={() => navigate(`/trainer/submissions/${submissionId}`)} 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
          >
            Save Grade
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionGradingPage;