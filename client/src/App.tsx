import React, { Suspense, lazy } from "react";
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
import FirebaseTest from "./components/FirebaseTest";
// Lazy-loaded pages
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const StudentCourseView = lazy(() => import("./pages/StudentCourseView"));
const TrainerCourseView = lazy(() => import("./pages/TrainerCourseView"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const TrainerEditCourse = lazy(() => import("./pages/TrainerEditCourse"));
const StudentAssignments = lazy(() => import("./pages/StudentAssignments"));
const CourseAssignments = lazy(() => import("./pages/CourseAssignments"));
const AssignmentDetails = lazy(() => import("./pages/AssignmentDetails"));
const TrainerEditProfile = lazy(() => import("./pages/TrainerEditProfile"));
const TrainerCourseManagement = lazy(
  () => import("./pages/TrainerCourseManagement")
);
const CourseManagement = lazy(() => import("./pages/CourseManagement"));
const SubmissionDetailPage = lazy(() => import("./pages/SubmissionDetailPage"));
const SubmissionGradingPage = lazy(
  () => import("./pages/SubmissionGradingPage")
);
const AdminCourses = lazy(() => import("./pages/AdminCourses"));
const AdminAddCourse = lazy(() => import("./pages/AdminAddCourse"));
const AdminRegistrations = lazy(() => import("./pages/AdminRegistrations"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminStories = lazy(() => import("./pages/AdminStories"));
const AdminAddStory = lazy(() => import("./pages/AdminAddStory"));
const AdminTrainers = lazy(() => import("./pages/AdminTrainers"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Stories = lazy(() => import("./pages/Stories"));
const StoryDetail = lazy(() => import("./pages/StoryDetail"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const EnhancedLearningDashboard = lazy(
  () => import("./pages/EnhancedLearningDashboard")
);

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
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-gray-600">Loading...</div>
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route
              path="/student/courses/:id"
              element={<StudentCourseView />}
            />
            <Route
              path="/enhanced-learning/:courseId"
              element={
                <PrivateRoute>
                  <EnhancedLearningDashboard />
                </PrivateRoute>
              }
            />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<StoryDetail />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            <Route path="/firebase-test" element={<FirebaseTest />} />

            {/* Assignment Routes */}
            <Route
              path="/assignments"
              element={
                <PrivateRoute>
                  <StudentAssignments />
                </PrivateRoute>
              }
            />
            <Route
              path="/courses/:courseId/assignments"
              element={
                <PrivateRoute>
                  <CourseAssignments />
                </PrivateRoute>
              }
            />
            <Route
              path="/courses/:courseId/assignments/:assignmentId"
              element={
                <PrivateRoute>
                  <AssignmentDetails />
                </PrivateRoute>
              }
            />

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
              path="/trainer/courses/:id/materials"
              element={
                <TrainerRoute>
                  <CourseManagement />
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
            <Route
              path="/trainer/submissions/:submissionId"
              element={
                <TrainerRoute>
                  <SubmissionDetailPage />
                </TrainerRoute>
              }
            />
            <Route
              path="/trainer/submissions/:submissionId/grade"
              element={
                <TrainerRoute>
                  <SubmissionGradingPage />
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
              path="/admin/payments"
              element={
                <AdminRoute>
                  <AdminPayments />
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
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">
                      404
                    </h1>
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
        </Suspense>
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
