import React from 'react';
import { MyAssignments } from '../components/MyAssignments';

export const StudentAssignments: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Assignments</h1>
            <MyAssignments />
        </div>
    );
};