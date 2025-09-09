import React, { useEffect, useState } from 'react';
import { Assignment } from '../types/assignments';
import { assignmentsApi } from '../utils/api';
import { toast } from 'react-hot-toast';

interface AssignmentListProps {
    courseId: number;
    onAssignmentSelect?: (id: number) => void;
}

export const AssignmentList: React.FC<AssignmentListProps> = ({ courseId, onAssignmentSelect }) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const data = await assignmentsApi.getAssignmentsForCourse(courseId);
                setAssignments(data);
            } catch (error) {
                console.error('Error fetching assignments:', error);
                toast.error('Failed to load assignments');
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [courseId]);

    if (loading) {
        return <div className="flex justify-center py-8">Loading assignments...</div>;
    }

    if (assignments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No assignments found for this course.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.map((assignment) => (
                <div
                    key={assignment.id}
                    className="bg-white shadow rounded-lg p-4 border border-gray-200"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{assignment.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                                Max Score: {assignment.maxScore}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <div>
                            {assignment.allowLateSubmission ? (
                                <span className="text-green-600">
                                    Late submissions allowed (Penalty: {assignment.latePenalty}%)
                                </span>
                            ) : (
                                <span className="text-red-600">No late submissions</span>
                            )}
                        </div>

                        <div className="text-gray-500">
                            Created: {new Date(assignment.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};