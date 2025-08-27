import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  ArrowRight,
  GraduationCap,
  Shield,
  Globe,
  Zap,
  Play,
  TrendingUp,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Sparkles,
  Target,
  Lightbulb,
  BookOpen as BookOpenIcon,
} from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Footer from "../components/Footer";
import EnquiryForm from "../components/EnquiryForm";
import Modal from "../components/Modal";
import { api, storiesApi, type Story } from "../utils/api";

interface Course {
  id: number;
  name: string;
  description: string;
  duration: string;
  price: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  category: "Tech" | "Media" | "Vocational";
}

const Home: React.FC = () => {
  const [enquiryOpen, setEnquiryOpen] = React.useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic background images for hero
  const heroImages = [
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  ];
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, storiesResponse] = await Promise.all([
          api.get("/courses"),
          storiesApi.getFeaturedStories(),
        ]);

        // Handle courses response structure
        const courses = coursesResponse.data?.data?.courses || [];
        setCourses(courses.slice(0, 6));

        // Handle stories response structure (featured stories returns direct array)
        const stories = Array.isArray(storiesResponse)
          ? storiesResponse
          : (storiesResponse as any)?.stories || [];
        setFeaturedStories(stories.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryConfig = {
    success_story: { icon: Award, color: "text-green-600", bg: "bg-green-50" },
    event: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    fun_fact: { icon: Lightbulb, color: "text-yellow-600", bg: "bg-yellow-50" },
    tip: { icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
    behind_scenes: { icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
    industry_news: { icon: TrendingUp, color: "text-red-600", bg: "bg-red-50" },
    activity: { icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
  };

  const getCategoryConfig = (category: string) => {
    return (
      categoryConfig[category as keyof typeof categoryConfig] ||
      categoryConfig.activity
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dynamic Background */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5 min-h-screen flex items-center"
        style={{
          backgroundImage: `linear-gradient(rgba(30,41,59,0.7),rgba(255,255,255,0.8)), url('${heroImages[bgIndex]}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="flex flex-col items-center justify-center text-center animate-fade-in">
            <div className="flex items-center justify-center mb-4 sm:mb-6 bg-white/20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 border border-white/30">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white mr-2" />
              <span className="text-white font-medium text-sm sm:text-base">
                Leading Media Training Institute
              </span>
            </div>
            <h1 className="text-responsive-4xl sm:text-responsive-5xl font-bold text-white drop-shadow-lg mb-4 sm:mb-6 leading-tight">
              Transform Your Future with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Expert Training
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed drop-shadow">
              Discover professional courses designed to advance your career.
              Join thousands of learners who trust us for quality education and
              expert instruction.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
              <Link
                to="/courses"
                className="btn btn-primary btn-lg group text-responsive-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-target"
              >
                <span>Explore Courses</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="btn btn-outline btn-lg text-responsive-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 touch-target"
              >
                Get Started
              </Link>
              <button
                className="btn btn-secondary btn-lg text-responsive-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 touch-target"
                onClick={() => setEnquiryOpen(true)}
                type="button"
              >
                Enquire Now
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-white/80">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">
                  500+ Active Students
                </span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">50+ Expert Courses</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">95% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        ariaLabel="Enquiry Form"
      >
        <EnquiryForm onSuccess={() => setEnquiryOpen(false)} />
      </Modal>

      {/* Featured Courses Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 animate-slide-up">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3 sm:mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              Featured Courses
            </div>
            <h2 className="text-responsive-3xl sm:text-responsive-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Popular Courses
            </h2>
            <p className="text-responsive-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our most popular courses designed by industry experts
              to help you succeed in your career journey.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="responsive-grid">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group card hover-lift overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative h-48 sm:h-56 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-primary/60" />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-gray-700">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {course.name}
                    </h3>
                    <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {course.duration}
                      </div>
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        {course.maxStudents} students
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        ${course.price}
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="btn btn-primary btn-sm group touch-target"
                      >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/courses" className="btn btn-outline btn-lg group">
              View All Courses
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Stories Section */}
      {featuredStories && featuredStories.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-slide-up">
              <div className="inline-flex items-center px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Latest Stories
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Recent Activities & News
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stay updated with our latest stories, events, and insights from
                the media industry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredStories &&
                featuredStories.map((story) => {
                  const categoryConfig = getCategoryConfig(
                    story.category || "default"
                  );
                  const CategoryIcon = categoryConfig.icon;
                  return (
                    <div
                      key={story.id}
                      className="group card hover-lift overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
                    >
                      {story.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={story.featuredImage}
                            alt={story.title || "Story"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center mb-3">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryConfig.bg} ${categoryConfig.color}`}
                          >
                            <CategoryIcon className="h-3 w-3 mr-1" />
                            {(story.category || "default")
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {story.title || "Untitled Story"}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {story.excerpt || "No excerpt available"}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {story.author
                              ? `${story.author.firstName || ""} ${
                                  story.author.lastName || ""
                                }`.trim() || "Unknown Author"
                              : `${story.firstName || ""} ${
                                  story.lastName || ""
                                }`.trim() || "Unknown Author"}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {story.createdAt
                              ? formatDate(story.createdAt)
                              : "No date"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {story.viewCount || 0}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {story.likeCount || 0}
                            </div>
                          </div>
                          <Link
                            to={`/stories/${story.id}`}
                            className="btn btn-primary btn-sm group"
                          >
                            Read More
                            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="text-center mt-12">
              <Link to="/stories" className="btn btn-outline btn-lg group">
                View All Stories
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Why Choose Us
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose KM Media Training Institute?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide cutting-edge courses with industry experts to help you
              succeed in your career journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="card hover-lift p-8 text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Expert Instructors
              </h3>
              <p className="text-gray-600 text-lg">
                Learn from industry professionals with years of experience in
                their fields.
              </p>
            </div>

            <div className="card hover-lift p-8 text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Flexible Learning
              </h3>
              <p className="text-gray-600 text-lg">
                Study at your own pace with 24/7 access to course materials and
                resources.
              </p>
            </div>

            <div className="card hover-lift p-8 text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Certificates
              </h3>
              <p className="text-gray-600 text-lg">
                Earn recognized certificates upon completion to boost your
                professional credentials.
              </p>
            </div>

            <div className="card hover-lift p-8 text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Community
              </h3>
              <p className="text-gray-600 text-lg">
                Connect with fellow learners and build your professional
                network.
              </p>
            </div>

            <div className="card hover-lift p-8 text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Secure Platform
              </h3>
              <p className="text-gray-600 text-lg">
                Your data and progress are protected with enterprise-grade
                security.
              </p>
            </div>

            <div className="card hover-lift p-8 text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Global Access
              </h3>
              <p className="text-gray-600 text-lg">
                Access courses from anywhere in the world with our cloud-based
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-scale-in">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                500+
              </div>
              <div className="text-gray-600 text-lg">Active Students</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                50+
              </div>
              <div className="text-gray-600 text-lg">Expert Courses</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                95%
              </div>
              <div className="text-gray-600 text-lg">Success Rate</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                24/7
              </div>
              <div className="text-gray-600 text-lg">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
              <Star className="h-4 w-4 mr-2" />
              Student Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our community of successful learners who have
              transformed their careers with us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card hover-lift p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                "The courses at KM Media helped me transition into a new career.
                The instructors are amazing and the content is top-notch!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold text-lg">SJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    Sarah Johnson
                  </div>
                  <div className="text-gray-600">Software Developer</div>
                </div>
              </div>
            </div>

            <div className="card hover-lift p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                "Excellent platform with high-quality courses. The community
                support and flexible learning schedule made all the difference."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold text-lg">MC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    Michael Chen
                  </div>
                  <div className="text-gray-600">Data Analyst</div>
                </div>
              </div>
            </div>

            <div className="card hover-lift p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                "I've taken several courses here and each one exceeded my
                expectations. The practical projects really helped me apply what
                I learned."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold text-lg">ER</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    Emily Rodriguez
                  </div>
                  <div className="text-gray-600">UX Designer</div>
                </div>
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
              Ready to Start Your Learning Journey?
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
                <span>Start Learning Today</span>
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/courses"
                className="btn btn-outline btn-lg text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
