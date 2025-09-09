import React, { useState, useEffect } from 'react';
import { StudentSubmission } from '../types/assignments';
import { assignmentsApi } from '../utils/api';
import { toast } from 'react-hot-toast';

interface GradeSubmissionsProps {
    assignmentId: number;
}

export const GradeSubmissions: React.FC<GradeSubmissionsProps> = ({ assignmentId }) => {
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [grading, setGrading] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        fetchSubmissions();
    }, [assignmentId]);

    const fetchSubmissions = async () => {
        try {
            const data = await assignmentsApi.getSubmissionsForAssignment(assignmentId);
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleGradeSubmit = async (submissionId: number, grade: number, feedback: string) => {
        setGrading(prev => ({ ...prev, [submissionId]: true }));

        try {
            await assignmentsApi.gradeSubmission(submissionId, { grade, feedback });
            toast.success('Submission graded successfully');
            fetchSubmissions(); // Refresh the list
        } catch (error) {
            console.error('Error grading submission:', error);
            toast.error('Failed to grade submission');
        } finally {
            setGrading(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8">Loading submissions...</div>;
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No submissions found for this assignment.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {submissions.map((submission) => (
                <div
                    key={submission.id}
                    className="bg-white shadow rounded-lg p-6 border border-gray-200"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h4 className="text-lg font-medium text-gray-900">
                                {submission.studentName}
                            </h4>
                            <p className="text-sm text-gray-500">
                                Submitted: {new Date(submission.submissionDate).toLocaleString()}
                            </p>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.status === 'late'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : submission.status === 'graded'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {submission.fileUrl && (
                            <a
                                href={submission.fileUrl}
                                download={submission.fileName}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Download Submission
                            </a>
                        )}
                    </div>

                    {submission.status !== 'graded' ? (
                        <GradeForm
                            submissionId={submission.id}
                            onSubmit={handleGradeSubmit}
                            isGrading={grading[submission.id] || false}
                        />
                    ) : (
                        <div className="mt-4">
                            <div className="text-sm text-gray-900">
                                <strong>Grade:</strong> {submission.grade}/100
                            </div>
                            {submission.feedback && (
                                <div className="mt-2">
                                    <strong className="text-sm text-gray-900">Feedback:</strong>
                                    <p className="mt-1 text-sm text-gray-500">{submission.feedback}</p>
                                </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                                Graded by: {submission.gradedBy} on {new Date(submission.gradedAt!).toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

interface GradeFormProps {
    submissionId: number;
    onSubmit: (submissionId: number, grade: number, feedback: string) => Promise<void>;
    isGrading: boolean;
}

const GradeForm: React.FC<GradeFormProps> = ({ submissionId, onSubmit, isGrading }) => {
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericGrade = parseInt(grade);
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
            toast.error('Grade must be a number between 0 and 100');
            return;
        }
        onSubmit(submissionId, numericGrade, feedback);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
                <label htmlFor={`grade-${submissionId}`} className="block text-sm font-medium text-gray-700">
                    Grade (0-100)
                </label>
                <input
                    type="number"
                    id={`grade-${submissionId}`}
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div>
                <label htmlFor={`feedback-${submissionId}`} className="block text-sm font-medium text-gray-700">
                    Feedback
                </label>
                <textarea
                    id={`feedback-${submissionId}`}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isGrading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isGrading ? 'Submitting Grade...' : 'Submit Grade'}
                </button>
            </div>
        </form>
    );
};