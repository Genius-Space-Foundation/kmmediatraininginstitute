import React, { useState } from 'react';
import { Assignment } from '../types/assignments';
import { assignmentsApi } from '../utils/api';
import { toast } from 'react-hot-toast';

interface AssignmentFormProps {
    courseId: number;
    onSubmit: () => void;
    onCancel: () => void;
}

export const AssignmentForm: React.FC<AssignmentFormProps> = ({ courseId, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        maxScore: 100,
        allowLateSubmission: false,
        latePenalty: 0
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await assignmentsApi.createAssignment({
                ...formData,
                courseId,
                maxScore: Number(formData.maxScore),
                latePenalty: Number(formData.latePenalty)
            });
            toast.success('Assignment created successfully');
            onSubmit();
        } catch (error) {
            toast.error('Failed to create assignment');
            console.error('Error creating assignment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                    Due Date
                </label>
                <input
                    type="datetime-local"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700">
                    Maximum Score
                </label>
                <input
                    type="number"
                    id="maxScore"
                    name="maxScore"
                    value={formData.maxScore}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="allowLateSubmission"
                    name="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="allowLateSubmission" className="ml-2 block text-sm text-gray-700">
                    Allow Late Submission
                </label>
            </div>

            {formData.allowLateSubmission && (
                <div>
                    <label htmlFor="latePenalty" className="block text-sm font-medium text-gray-700">
                        Late Penalty (%)
                    </label>
                    <input
                        type="number"
                        id="latePenalty"
                        name="latePenalty"
                        value={formData.latePenalty}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Assignment'}
                </button>
            </div>
        </form>
    );
};