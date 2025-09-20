import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { api } from "../utils/api";

interface CourseFeeInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseName: string;
  courseFee: number;
  onInstallmentPlanCreated?: () => void;
}

interface InstallmentPlan {
  id: number;
  totalCourseFee: number;
  totalInstallments: number;
  installmentAmount: number;
  paymentPlan: "weekly" | "monthly" | "quarterly";
  remainingBalance: number;
  paidInstallments: number;
  nextDueDate?: string;
  status: "active" | "completed" | "defaulted" | "cancelled";
}

const CourseFeeInstallmentModal: React.FC<CourseFeeInstallmentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  courseFee,
  onInstallmentPlanCreated,
}) => {
  const [installmentPlan, setInstallmentPlan] =
    useState<InstallmentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [formData, setFormData] = useState({
    totalInstallments: 3,
    paymentPlan: "monthly" as "weekly" | "monthly" | "quarterly",
  });

  useEffect(() => {
    if (isOpen) {
      fetchInstallmentPlan();
    }
  }, [isOpen, courseId]);

  const fetchInstallmentPlan = async () => {
    try {
      const response = await api.get(`/payments/installment-plan/${courseId}`);
      if (response.data.success) {
        setInstallmentPlan(response.data.data.installmentPlan);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("Error fetching installment plan:", error);
      }
    }
  };

  const handleCreateInstallmentPlan = async () => {
    setCreatingPlan(true);
    try {
      const installmentAmount = Math.ceil(
        courseFee / formData.totalInstallments
      );

      const response = await api.post("/payments/installment-plan", {
        courseId,
        totalCourseFee: courseFee,
        totalInstallments: formData.totalInstallments,
        paymentPlan: formData.paymentPlan,
      });

      if (response.data.success) {
        setInstallmentPlan(response.data.data.installmentPlan);
        toast.success("Installment plan created successfully!");
        onInstallmentPlanCreated?.();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create installment plan"
      );
    } finally {
      setCreatingPlan(false);
    }
  };

  const handlePayInstallment = async () => {
    if (!installmentPlan) return;

    setLoading(true);
    try {
      const response = await api.post("/payments/initialize", {
        courseId,
        amount: installmentPlan.installmentAmount,
        email: "", // Will be filled by the backend
        firstName: "", // Will be filled by the backend
        lastName: "", // Will be filled by the backend
        phone: "", // Will be filled by the backend
        paymentType: "installment",
        installmentNumber: installmentPlan.paidInstallments + 1,
        totalInstallments: installmentPlan.totalInstallments,
        installmentAmount: installmentPlan.installmentAmount,
        remainingBalance: installmentPlan.remainingBalance,
      });

      if (response.data.success) {
        // Redirect to payment gateway
        window.location.href = response.data.data.authorizationUrl;
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to initialize installment payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPaymentPlanText = (plan: string) => {
    switch (plan) {
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      default:
        return plan;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "completed":
        return "text-blue-600";
      case "defaulted":
        return "text-red-600";
      case "cancelled":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Course Fee Installment Plan
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {courseName}
          </h3>
          <p className="text-gray-600">
            Total Course Fee:{" "}
            <span className="font-semibold">GHC{courseFee.toLocaleString()}</span>
          </p>
        </div>

        {installmentPlan ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">
                Current Installment Plan
              </h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Payment Plan:</span>
                  <p className="font-medium">
                    {getPaymentPlanText(installmentPlan.paymentPlan)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total Installments:</span>
                  <p className="font-medium">
                    {installmentPlan.totalInstallments}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Installment Amount:</span>
                  <p className="font-medium">
                    GHC{installmentPlan.installmentAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Paid Installments:</span>
                  <p className="font-medium">
                    {installmentPlan.paidInstallments} /{" "}
                    {installmentPlan.totalInstallments}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Remaining Balance:</span>
                  <p className="font-medium text-red-600">
                    GHC{installmentPlan.remainingBalance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p
                    className={`font-medium ${getStatusColor(
                      installmentPlan.status
                    )}`}
                  >
                    {installmentPlan.status.charAt(0).toUpperCase() +
                      installmentPlan.status.slice(1)}
                  </p>
                </div>
              </div>

              {installmentPlan.nextDueDate && (
                <div className="mt-3">
                  <span className="text-gray-600">Next Due Date:</span>
                  <p className="font-medium">
                    {new Date(installmentPlan.nextDueDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {installmentPlan.status === "active" &&
              installmentPlan.remainingBalance > 0 && (
                <button
                  onClick={handlePayInstallment}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing..."
                    : `Pay Next Installment (GHC${installmentPlan.installmentAmount.toLocaleString()})`}
                </button>
              )}

            {installmentPlan.status === "completed" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✅ All installments have been paid successfully!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Create an installment plan to pay your course fee in manageable
                payments.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Installments
                </label>
                <select
                  value={formData.totalInstallments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalInstallments: parseInt(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2, 3, 4, 6, 8, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} installments
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Frequency
                </label>
                <select
                  value={formData.paymentPlan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentPlan: e.target.value as any,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Course Fee:</span>
                    <span className="font-medium">
                      GHC{courseFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Installments:</span>
                    <span className="font-medium">
                      {formData.totalInstallments}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Installment Amount:</span>
                    <span className="font-medium">
                      GHC{Math.ceil(
                        courseFee / formData.totalInstallments
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Frequency:</span>
                    <span className="font-medium">
                      {getPaymentPlanText(formData.paymentPlan)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateInstallmentPlan}
                disabled={creatingPlan}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingPlan ? "Creating Plan..." : "Create Installment Plan"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseFeeInstallmentModal;






