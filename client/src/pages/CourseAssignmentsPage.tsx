import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AssignmentForm } from '../components/AssignmentForm';
import { AssignmentList } from '../components/AssignmentList';
import { GradeSubmissions } from '../components/GradeSubmissions';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export const CourseAssignmentsPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
    const { user } = useAuth();
    const isTrainer = user?.role === 'trainer';

    const handleAssignmentCreated = () => {
        setShowNewAssignmentModal(false);
    };

    if (!courseId) {
        return <div>Invalid course ID</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Course Assignments</h1>
                {isTrainer && (
                    <button
                        onClick={() => setShowNewAssignmentModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create New Assignment
                    </button>
                )}
            </div>

            <AssignmentList
                courseId={parseInt(courseId)}
                onAssignmentSelect={isTrainer ? setSelectedAssignmentId : undefined}
            />

            <Modal
                open={showNewAssignmentModal}
                onClose={() => setShowNewAssignmentModal(false)}
                ariaLabel="Create New Assignment"
            >
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Assignment</h2>
                    <AssignmentForm
                        courseId={parseInt(courseId)}
                        onSubmit={handleAssignmentCreated}
                        onCancel={() => setShowNewAssignmentModal(false)}
                    />
                </div>
            </Modal>

            <Modal
                open={selectedAssignmentId !== null}
                onClose={() => setSelectedAssignmentId(null)}
                ariaLabel="Grade Submissions"
            >
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Submissions</h2>
                    {selectedAssignmentId && (
                        <GradeSubmissions assignmentId={selectedAssignmentId} />
                    )}
                </div>
            </Modal>
        </div>
    );
};