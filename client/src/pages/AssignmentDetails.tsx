import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Assignment } from "../types/assignments";
import { AssignmentSubmission } from "../components/AssignmentSubmission";
import { GradeSubmissions } from "../components/GradeSubmissions";
import { assignmentsApi } from "../utils/api";
import { toast } from "react-hot-toast";

const AssignmentDetails: React.FC = () => {
  const { courseId, assignmentId } = useParams<{
    courseId: string;
    assignmentId: string;
  }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrainer, setIsTrainer] = useState(false); // This should be determined from your auth context

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const assignments = await assignmentsApi.getAssignmentsForCourse(
          parseInt(courseId!)
        );
        const found = assignments.find((a) => a.id === parseInt(assignmentId!));
        if (found) {
          setAssignment(found);
        } else {
          toast.error("Assignment not found");
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        toast.error("Failed to load assignment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [courseId, assignmentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        Loading assignment details...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-8 text-red-600">Assignment not found</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {assignment.title}
        </h1>
        <p className="text-gray-600">{assignment.description}</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Due Date:</strong>{" "}
            {new Date(assignment.dueDate).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Maximum Score:</strong> {assignment.maxScore}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Late Submissions:</strong>{" "}
            {assignment.allowLateSubmission
              ? `Allowed (Penalty: ${assignment.latePenalty}%)`
              : "Not allowed"}
          </p>
        </div>
      </div>

      {isTrainer ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Student Submissions
          </h2>
          <GradeSubmissions assignmentId={parseInt(assignmentId!)} />
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Submit Assignment
          </h2>
          <AssignmentSubmission
            assignment={assignment}
            onSubmit={() => toast.success("Assignment submitted successfully")}
          />
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
