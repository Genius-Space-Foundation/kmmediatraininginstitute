import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { api } from "../utils/api";
import { CheckCircle, XCircle, Loader } from "lucide-react";

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");

    if (!reference && !trxref) {
      setStatus("failed");
      setMessage("No payment reference found");
      return;
    }

    const paymentRef = reference || trxref;

    if (paymentRef) {
      verifyPayment(paymentRef);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await api.post("/payments/verify", { reference });

      if (response.data.success && response.data.data?.status === "success") {
        setStatus("success");
        setMessage("Payment verified successfully!");

        // Show success toast
        toast.success(
          "🎉 Payment successful! Your course application has been automatically submitted.",
          {
            duration: 5000,
          }
        );

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setStatus("failed");
        setMessage("Payment verification failed");
        toast.error("Payment verification failed");
      }
    } catch (error: any) {
      setStatus("failed");
      setMessage(
        error.response?.data?.message || "Payment verification failed"
      );
      toast.error("Payment verification failed");
    }
  };

  const getStatusContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <Loader className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your course application has been automatically submitted and is
              now pending review.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                What's Next?
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Complete your profile information in your dashboard</li>
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Check your student dashboard for updates</li>
                <li>• Review process takes 24-48 hours</li>
              </ul>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        );

      case "failed":
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {message || "Something went wrong with your payment."}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">What to do?</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Check your payment method and try again</li>
                <li>• Contact support if the problem persists</li>
                <li>• Your application form data is saved</li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/courses")}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {getStatusContent()}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
