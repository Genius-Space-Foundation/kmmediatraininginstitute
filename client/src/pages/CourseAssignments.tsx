import React, { useState } from 'react';
import { AssignmentForm } from '../components/AssignmentForm';
import { AssignmentList } from '../components/AssignmentList';
import { useParams } from 'react-router-dom';

export const CourseAssignments: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [showForm, setShowForm] = useState(false);

    const handleAssignmentCreated = () => {
        setShowForm(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Course Assignments</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Create Assignment
                </button>
            </div>

            {showForm && (
                <div className="mb-8">
                    <AssignmentForm
                        courseId={parseInt(courseId!)}
                        onSubmit={handleAssignmentCreated}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            <AssignmentList courseId={parseInt(courseId!)} />
        </div>
    );
};