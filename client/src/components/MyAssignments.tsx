import React, { useState, useEffect } from 'react';
import { StudentSubmission } from '../types/assignments';
import { assignmentsApi } from '../utils/api';
import { toast } from 'react-hot-toast';

export const MyAssignments: React.FC = () => {
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await assignmentsApi.getMySubmissions();
                setSubmissions(data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
                toast.error('Failed to load your submissions');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return <div className="flex justify-center py-8">Loading your submissions...</div>;
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                You haven't submitted any assignments yet.
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
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {submission.assignmentTitle}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
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
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Download
                            </a>
                        )}
                    </div>

                    {submission.status === 'graded' && (
                        <div className="mt-4 border-t pt-4">
                            <div className="flex items-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {submission.grade}/100
                                </div>
                                <div className="ml-4 text-sm text-gray-500">
                                    Graded on: {new Date(submission.gradedAt!).toLocaleDateString()}
                                </div>
                            </div>

                            {submission.feedback && (
                                <div className="mt-3">
                                    <h4 className="text-sm font-medium text-gray-900">Feedback:</h4>
                                    <p className="mt-1 text-sm text-gray-500">{submission.feedback}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};