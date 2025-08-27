import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import TrainerRoute from "./components/TrainerRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import StudentCourseView from "./pages/StudentCourseView";
import TrainerCourseView from "./pages/TrainerCourseView";
import StudentDashboard from "./pages/ModernStudentDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
// import TrainerAddCourse from "./pages/TrainerAddCourse"; // Removed - trainers don't create courses
import TrainerEditCourse from "./pages/TrainerEditCourse";
import TrainerEditProfile from "./pages/TrainerEditProfile";
import TrainerCourseManagement from "./pages/TrainerCourseManagement";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourses from "./pages/AdminCourses";
import AdminAddCourse from "./pages/AdminAddCourse";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminStories from "./pages/AdminStories";
import AdminAddStory from "./pages/AdminAddStory";
import AdminTrainers from "./pages/AdminTrainers";
import AboutUs from "./pages/AboutUs";
import Stories from "./pages/Stories";
import StoryDetail from "./pages/StoryDetail";
import PaymentCallback from "./pages/PaymentCallback";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const isTrainerPage = location.pathname.startsWith("/trainer");
  const isStudentDashboard = location.pathname === "/dashboard";
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show navbar for all pages except admin, trainer, student dashboard, and auth pages */}
      {!isAdminPage && !isTrainerPage && !isStudentDashboard && !isAuthPage && (
        <Navbar />
      )}

      <main
        className={
          isAdminPage || isTrainerPage || isStudentDashboard || isAuthPage
            ? "min-h-screen"
            : "container mx-auto px-4 py-8"
        }
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/student/courses/:id" element={<StudentCourseView />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />

          {/* Protected Student Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/courses/:id"
            element={
              <PrivateRoute>
                <StudentCourseView />
              </PrivateRoute>
            }
          />
          <Route
            path="/trainer/courses/:id"
            element={
              <TrainerRoute>
                <TrainerCourseView />
              </TrainerRoute>
            }
          />

          {/* Protected Trainer Routes */}
          <Route
            path="/trainer"
            element={
              <TrainerRoute>
                <TrainerDashboard />
              </TrainerRoute>
            }
          />
          <Route
            path="/trainer/courses"
            element={
              <TrainerRoute>
                <TrainerDashboard />
              </TrainerRoute>
            }
          />
          {/* Removed trainer course creation - courses are assigned by admin */}
          <Route
            path="/trainer/courses/:courseId/edit"
            element={
              <TrainerRoute>
                <TrainerEditCourse />
              </TrainerRoute>
            }
          />
          <Route
            path="/trainer/courses/:courseId/manage"
            element={
              <TrainerRoute>
                <TrainerCourseManagement />
              </TrainerRoute>
            }
          />
          <Route
            path="/trainer/profile/edit"
            element={
              <TrainerRoute>
                <TrainerEditProfile />
              </TrainerRoute>
            }
          />
          <Route
            path="/trainer/students"
            element={
              <TrainerRoute>
                <TrainerDashboard />
              </TrainerRoute>
            }
          />
          <Route
            path="/trainer/analytics"
            element={
              <TrainerRoute>
                <TrainerDashboard />
              </TrainerRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AdminCourses />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <AdminRoute>
                <AdminAddCourse />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/registrations"
            element={
              <AdminRoute>
                <AdminRegistrations />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stories"
            element={
              <AdminRoute>
                <AdminStories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/stories/new"
            element={
              <AdminRoute>
                <AdminAddStory />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/trainers"
            element={
              <AdminRoute>
                <AdminTrainers />
              </AdminRoute>
            }
          />

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                    Page Not Found
                  </h2>
                  <p className="text-gray-500 mb-8">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
