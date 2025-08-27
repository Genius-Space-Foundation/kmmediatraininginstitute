import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Star,
  Award,
  Globe,
  Target,
  Lightbulb,
  Sparkles,
  Zap,
  Shield,
  Play,
  MessageCircle,
  Download,
} from "lucide-react";
import Footer from "../components/Footer";

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
}

interface ApplicationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fullName: string;
  dateOfBirth: string;
  residentialAddress: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  telephone: string;

  // Educational Background
  levelOfEducation: string;
  nameOfSchool: string;
  yearAttendedFrom: string;
  yearAttendedTo: string;
  certificateObtained: string;
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "form" | "payment" | "complete"
  >("form");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ApplicationForm>();

  const fetchCourse = useCallback(async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.data.course);
    } catch (error) {
      toast.error("Failed to fetch course details");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName || "");
      setValue("lastName", user.lastName || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
      setValue(
        "fullName",
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      );
      setValue("residentialAddress", user.address || "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: ApplicationForm) => {
    if (!user) {
      toast.error("Please login to apply for courses");
      navigate("/login");
      return;
    }

    // Enhanced confirmation dialog with more details
    const confirmMessage = `
🎓 Course Application Confirmation

Course: ${course?.name}
Duration: ${course?.duration}
Application Fee: ₵100

Are you sure you want to proceed with your application?

You will be redirected to complete the payment of ₵100 for the application form.

Click "OK" to proceed with payment.
    `;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSubmitting(true);
    try {
      // Initialize payment first
      const paymentResponse = await api.post("/payments/initialize", {
        courseId: parseInt(id!),
        amount: 100,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || data.phone,
      });

      if (paymentResponse.data.success) {
        setPaymentData({
          ...data,
          paymentReference: paymentResponse.data.data.reference,
          authorizationUrl: paymentResponse.data.data.authorizationUrl,
        });
        setPaymentStep("payment");

        // Redirect to Paystack payment page
        window.location.href = paymentResponse.data.data.authorizationUrl;
      } else {
        toast.error(
          paymentResponse.data.message || "Payment initialization failed"
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (reference: string) => {
    setPaymentLoading(true);
    try {
      // Verify payment
      const verificationResponse = await api.post("/payments/verify", {
        reference,
      });

      if (verificationResponse.data.success) {
        // Submit application with payment confirmation
        await api.post("/registrations", {
          courseId: parseInt(id!),
          ...paymentData,
          notes: `Application submitted with payment reference: ${reference} on ${new Date().toLocaleString()}`,
        });

        setPaymentStep("complete");
        toast.success(
          "🎉 Payment successful! Application submitted successfully!",
          {
            duration: 5000,
            icon: "🎓",
          }
        );

        const successMessage = `
✅ Payment & Application Successful!

Course: ${course?.name}
Payment Reference: ${reference}
Application Fee: ₵100

📧 You will receive a confirmation email shortly
📱 Check your student dashboard for updates
⏰ Review process takes 24-48 hours

Would you like to go to your Student Dashboard now?
        `;

        if (window.confirm(successMessage)) {
          navigate("/dashboard");
        } else {
          navigate("/courses");
        }
      } else {
        toast.error("Payment verification failed");
        setPaymentStep("form");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Payment verification failed"
      );
      setPaymentStep("form");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Course not found
          </h2>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="btn btn-primary"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-8 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Courses</span>
          </button>

          {/* Course Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              Course Details
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {course.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">
                  {course.duration}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Duration
                </div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
                <User className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">
                  {course.maxStudents}
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Max Students
                </div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">4.8</div>
                <div className="text-xs text-gray-500 font-medium">Rating</div>
              </div>
              <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-900">
                  Certificate
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Included
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Course Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-gray-700 font-medium">
                      <strong>Created:</strong>{" "}
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 font-medium">
                      <strong>Status:</strong> Active and accepting applications
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl">
                    <Globe className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 font-medium">
                      <strong>Format:</strong> Online learning with flexible
                      schedule
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="h-6 w-6 mr-3 text-primary" />
                  Course Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-gray-700 font-medium">
                      <strong>Created:</strong>{" "}
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 font-medium">
                      <strong>Status:</strong> Active and accepting applications
                    </span>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Lightbulb className="h-6 w-6 mr-3 text-primary" />
                  What You'll Learn
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">
                      Comprehensive understanding of the subject matter
                    </span>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">
                      Practical skills and hands-on experience
                    </span>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">
                      Industry best practices and methodologies
                    </span>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">
                      Certificate upon successful completion
                    </span>
                  </div>
                </div>
              </div>

              {/* Course Features */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-primary" />
                  Course Features
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                    <Play className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Video Lectures
                      </h3>
                      <p className="text-sm text-gray-600">
                        High-quality video content
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                    <Download className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Downloadable Resources
                      </h3>
                      <p className="text-sm text-gray-600">
                        Access to course materials
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                    <MessageCircle className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Community Support
                      </h3>
                      <p className="text-sm text-gray-600">
                        Connect with fellow learners
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Lifetime Access
                      </h3>
                      <p className="text-sm text-gray-600">
                        Learn at your own pace
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                {/* Price Card */}
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 mb-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                      ${course.price}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Course Fee
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">
                        Certificate included
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">Lifetime access</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">Community support</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Course Application
                </h3>

                {!user ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/30 rounded-xl p-4">
                      <AlertCircle className="h-5 w-5 text-primary mb-2" />
                      <p className="text-primary text-sm font-medium">
                        Please login to apply for this course.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Login to Apply
                    </button>
                  </div>
                ) : !showApplicationForm ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                      <p className="text-green-800 text-sm font-medium">
                        You're logged in and ready to apply!
                      </p>
                    </div>
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Start Application
                    </button>
                  </div>
                ) : paymentStep === "payment" ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <h3 className="text-lg font-semibold text-blue-800 mb-2">
                        Redirecting to Payment Gateway
                      </h3>
                      <p className="text-blue-700 text-sm">
                        You are being redirected to Paystack to complete your
                        payment of ₵100.
                      </p>
                      <p className="text-blue-600 text-xs mt-2">
                        Please complete the payment to proceed with your
                        application.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaymentStep("form")}
                      className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                    >
                      Back to Application Form
                    </button>
                  </div>
                ) : paymentStep === "complete" ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        Payment Successful!
                      </h3>
                      <p className="text-green-700 text-sm">
                        Your application has been submitted successfully.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Personal Information
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            {...register("firstName", {
                              required: "First name is required",
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="John"
                          />
                          {errors.firstName && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            {...register("lastName", {
                              required: "Last name is required",
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="Doe"
                          />
                          {errors.lastName && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="john@example.com"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          {...register("phone", {
                            required: "Phone number is required",
                          })}
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="+1 (555) 123-4567"
                        />
                        {errors.phone && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name of Applicant *
                        </label>
                        <input
                          {...register("fullName", {
                            required: "Full name is required",
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth *
                        </label>
                        <input
                          {...register("dateOfBirth", {
                            required: "Date of birth is required",
                          })}
                          type="date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        />
                        {errors.dateOfBirth && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.dateOfBirth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Residential Address *
                        </label>
                        <input
                          {...register("residentialAddress", {
                            required: "Residential address is required",
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="Enter your residential address"
                        />
                        {errors.residentialAddress && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.residentialAddress.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nationality *
                          </label>
                          <input
                            {...register("nationality", {
                              required: "Nationality is required",
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="e.g., Ghanaian"
                          />
                          {errors.nationality && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.nationality.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Religion
                          </label>
                          <input
                            {...register("religion")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="e.g., Christian, Muslim"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Marital Status *
                          </label>
                          <select
                            {...register("maritalStatus", {
                              required: "Marital status is required",
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          >
                            <option value="">Select Marital Status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                          {errors.maritalStatus && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.maritalStatus.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Occupation *
                          </label>
                          <input
                            {...register("occupation", {
                              required: "Occupation is required",
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="e.g., Student, Teacher, Engineer"
                          />
                          {errors.occupation && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.occupation.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telephone Number
                        </label>
                        <input
                          {...register("telephone")}
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="Alternative phone number"
                        />
                      </div>
                    </div>

                    {/* Educational Background */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Educational Background
                      </h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Level of Education *
                        </label>
                        <select
                          {...register("levelOfEducation", {
                            required: "Level of education is required",
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        >
                          <option value="">Select Education Level</option>
                          <option value="primary">Primary School</option>
                          <option value="jhs">Junior High School</option>
                          <option value="shs">Senior High School</option>
                          <option value="vocational">
                            Vocational/Technical
                          </option>
                          <option value="diploma">Diploma</option>
                          <option value="bachelor">Bachelor's Degree</option>
                          <option value="master">Master's Degree</option>
                          <option value="phd">PhD</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.levelOfEducation && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.levelOfEducation.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name of School *
                        </label>
                        <input
                          {...register("nameOfSchool", {
                            required: "Name of school is required",
                          })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="Name of your last school"
                        />
                        {errors.nameOfSchool && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors.nameOfSchool.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year Attended (From) *
                          </label>
                          <input
                            {...register("yearAttendedFrom", {
                              required: "Year attended from is required",
                            })}
                            type="number"
                            min="1950"
                            max="2030"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="2018"
                          />
                          {errors.yearAttendedFrom && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.yearAttendedFrom.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year Attended (To) *
                          </label>
                          <input
                            {...register("yearAttendedTo", {
                              required: "Year attended to is required",
                            })}
                            type="number"
                            min="1950"
                            max="2030"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="2021"
                          />
                          {errors.yearAttendedTo && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors.yearAttendedTo.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certificate Obtained
                        </label>
                        <input
                          {...register("certificateObtained")}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                          placeholder="e.g., WASSCE, Diploma, Degree"
                        />
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-yellow-800">
                            Application Fee Required
                          </h4>
                          <p className="text-yellow-700 text-sm">
                            ₵100 application fee will be charged
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="space-y-4">
                      <button
                        type="submit"
                        disabled={submitting || !course.isActive}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                      >
                        {submitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span>Processing Payment...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>Pay ₵100 & Submit Application</span>
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </button>

                      {!course.isActive && (
                        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                          <AlertCircle className="h-5 w-5 text-red-500 mb-2" />
                          <p className="text-red-800 text-sm font-medium">
                            This course is currently inactive and not accepting
                            applications.
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowApplicationForm(false)}
                        className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        Back to Course Details
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who have already transformed their
              careers with our courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-primary hover:bg-gray-100 btn-lg group text-lg px-8 py-4 font-semibold"
              >
                <Zap className="h-5 w-5 mr-2" />
                <span>Get Started Today</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/courses"
                className="btn btn-outline btn-lg text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
              >
                Browse More Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
