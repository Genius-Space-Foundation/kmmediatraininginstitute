export interface Assignment {
    id: number;
    title: string;
    description?: string;
    courseId: number;
    dueDate: string;
    maxScore: number;
    allowLateSubmission: boolean;
    latePenalty: number;
    createdAt: string;
    updatedAt: string;
}

export interface StudentSubmission {
    id: number;
    assignmentId: number;
    studentId: number;
    submissionDate: string;
    fileUrl?: string;
    fileName?: string;
    status: 'submitted' | 'graded' | 'late';
    grade?: number;
    feedback?: string;
    gradedBy?: number;
    gradedAt?: string;
    createdAt: string;
    updatedAt: string;
    studentName?: string;
    assignmentTitle?: string;
}