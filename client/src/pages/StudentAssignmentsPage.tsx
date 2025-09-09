import React from 'react';
import { MyAssignments } from '../components/MyAssignments';

export const StudentAssignmentsPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">My Assignments</h1>
                <p className="mt-2 text-sm text-gray-500">
                    View all your assignment submissions and grades
                </p>
            </div>

            <MyAssignments />
        </div>
    );
};