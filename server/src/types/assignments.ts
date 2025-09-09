export interface Assignment {
    id: number;
    title: string;
    description?: string;
    courseId: number;
    dueDate: Date;
    maxScore: number;
    allowLateSubmission: boolean;
    latePenalty: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface StudentSubmission {
    id: number;
    assignmentId: number;
    studentId: number;
    submissionDate: Date;
    fileUrl?: string;
    fileName?: string;
    status: 'submitted' | 'graded' | 'late';
    grade?: number;
    feedback?: string;
    gradedBy?: number;
    gradedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}