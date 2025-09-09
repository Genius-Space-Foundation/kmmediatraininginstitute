import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const SubmissionDetailPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-4">Submission Detail</h1>
        <p>Submission ID: {submissionId}</p>
        <button 
          onClick={() => navigate('/trainer')} 
          className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SubmissionDetailPage;