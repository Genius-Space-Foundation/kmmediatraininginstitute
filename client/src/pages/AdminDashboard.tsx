import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import DashboardOverview from "../components/DashboardOverview";

interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  rejectedRegistrations: number;
  completedRegistrations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeUsers: number;
  systemHealth: number;
  totalStories: number;
  publishedStories: number;
  totalComments: number;
  averageRating: number;
  // Enhanced payment stats
  totalPayments?: number;
  successfulPayments?: number;
  failedPayments?: number;
  pendingPayments?: number;
  applicationFees?: number;
  courseFees?: number;
  installmentPayments?: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AdminRoute component already handles role validation
    // No need for additional role checking here
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch course stats
      const coursesResponse = await api.get("/courses/admin/stats");
      const coursesStats = coursesResponse.data.data;

      // Fetch registration stats
      const registrationsResponse = await api.get("/registrations/admin/stats");
      const registrationStats = registrationsResponse.data.data;

      // Fetch payment stats (actual payment data)
      const paymentsResponse = await api.get("/payments/admin/stats");
      const paymentStats = paymentsResponse.data.data;

      // Fetch user stats (placeholder - would need user stats endpoint)
      const userStats = {
        totalUsers: 150,
        activeUsers: 89,
        newUsersThisMonth: 23,
      };

      // Fetch story stats (placeholder - would need story stats endpoint)
      const storyStats = {
        totalStories: 5,
        publishedStories: 5,
        totalComments: 0,
        averageRating: 4.5,
      };

      setStats({
        totalCourses: coursesStats.totalCourses,
        totalUsers: userStats.totalUsers,
        totalRegistrations: registrationStats.totalRegistrations,
        pendingRegistrations: registrationStats.pendingRegistrations,
        approvedRegistrations: registrationStats.approvedRegistrations,
        rejectedRegistrations: registrationStats.rejectedRegistrations,
        completedRegistrations: registrationStats.completedRegistrations,
        totalRevenue: paymentStats.totalRevenue || 0,
        monthlyRevenue: paymentStats.monthlyRevenue || 0,
        activeUsers: userStats.activeUsers,
        systemHealth: 98,
        totalStories: storyStats.totalStories,
        publishedStories: storyStats.publishedStories,
        totalComments: storyStats.totalComments,
        averageRating: storyStats.averageRating,
        // Enhanced payment stats
        totalPayments: paymentStats.totalPayments || 0,
        successfulPayments: paymentStats.successfulPayments || 0,
        failedPayments: paymentStats.failedPayments || 0,
        pendingPayments: paymentStats.pendingPayments || 0,
        applicationFees: paymentStats.applicationFees || 0,
        courseFees: paymentStats.courseFees || 0,
        installmentPayments: paymentStats.installmentPayments || 0,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load dashboard data";
      toast.error(errorMessage);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-responsive-2xl sm:text-responsive-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-responsive-base sm:text-lg text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Welcome back! Here's what's happening with your learning center.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-responsive-sm sm:text-base touch-target"
            >
              <span className="hidden sm:inline">Refresh Data</span>
              <span className="sm:hidden">Refresh</span>
            </button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <DashboardOverview stats={stats} loading={loading} />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
