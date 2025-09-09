import React, { useState } from 'react';
import { Assignment } from '../types/assignments';
import { assignmentsApi } from '../utils/api';
import { toast } from 'react-hot-toast';

interface AssignmentSubmissionProps {
    assignment: Assignment;
    onSubmit: () => void;
}

export const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({ assignment, onSubmit }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file to submit');
            return;
        }

        setUploading(true);

        try {
            // First upload the file
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const { fileUrl } = await response.json();

            // Then submit the assignment
            await assignmentsApi.submitAssignment(assignment.id, {
                fileUrl,
                fileName: file.name
            });

            toast.success('Assignment submitted successfully');
            onSubmit();
        } catch (error) {
            console.error('Error submitting assignment:', error);
            toast.error('Failed to submit assignment');
        } finally {
            setUploading(false);
        }
    };

    const isDueDatePassed = new Date(assignment.dueDate) < new Date();
    const canSubmit = !isDueDatePassed || assignment.allowLateSubmission;

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Assignment</h3>

            {isDueDatePassed && !assignment.allowLateSubmission ? (
                <div className="text-red-600 mb-4">
                    The due date has passed and late submissions are not allowed.
                </div>
            ) : isDueDatePassed && assignment.allowLateSubmission ? (
                <div className="text-yellow-600 mb-4">
                    Note: This will be marked as a late submission with a {assignment.latePenalty}% penalty.
                </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                        Assignment File
                    </label>
                    <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                        disabled={!canSubmit || uploading}
                    />
                </div>

                {file && (
                    <div className="text-sm text-gray-500">
                        Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${canSubmit
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                        disabled={!canSubmit || uploading || !file}
                    >
                        {uploading ? 'Submitting...' : 'Submit Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
};