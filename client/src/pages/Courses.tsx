import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Star,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Filter,
  Laptop,
  Camera,
  Hammer,
  Sparkles,
  CheckCircle,
  X,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Globe,
  Shield,
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
  category: "Tech" | "Media" | "Vocational";
}

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data.data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = useCallback(() => {
    let filtered = courses.filter((course) => course.isActive);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter((course) => {
        switch (priceFilter) {
          case "free":
            return course.price === 0;
          case "low":
            return course.price > 0 && course.price <= 500;
          case "medium":
            return course.price > 500 && course.price <= 1000;
          case "high":
            return course.price > 1000;
          default:
            return true;
        }
      });
    }

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "duration":
          return a.duration.localeCompare(b.duration);
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, priceFilter, sortBy]);

  // Group courses by category
  const groupedCourses: { [key: string]: Course[] } = {
    Tech: [],
    Media: [],
    Vocational: [],
  };
  filteredCourses.forEach((course) => {
    if (groupedCourses[course.category]) {
      groupedCourses[course.category].push(course);
    }
  });

  // Tab keys and labels
  const tabOptions = [
    {
      key: "Tech",
      label: "Tech Programs",
      icon: <Laptop className="h-5 w-5 mr-2" />,
      description: "Programming, Web Development, Data Science",
      color: "from-blue-500 to-cyan-500",
    },
    {
      key: "Media",
      label: "Media Programs",
      icon: <Camera className="h-5 w-5 mr-2" />,
      description: "Digital Marketing, Content Creation, Design",
      color: "from-purple-500 to-pink-500",
    },
    {
      key: "Vocational",
      label: "Vocational Programs",
      icon: <Hammer className="h-5 w-5 mr-2" />,
      description: "Practical Skills, Trade Programs, Certifications",
      color: "from-orange-500 to-red-500",
    },
  ];
  const [activeTab, setActiveTab] = useState<string>("Tech");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const getPriceCategory = (price: number) => {
    if (price === 0)
      return {
        label: "Free",
        color: "bg-green-100 text-green-800",
        bg: "bg-green-50",
      };
    if (price <= 500)
      return {
        label: "Budget",
        color: "bg-blue-100 text-blue-800",
        bg: "bg-blue-50",
      };
    if (price <= 1000)
      return {
        label: "Standard",
        color: "bg-yellow-100 text-yellow-800",
        bg: "bg-yellow-50",
      };
    return {
      label: "Premium",
      color: "bg-purple-100 text-purple-800",
      bg: "bg-purple-50",
    };
  };

  const getDurationIcon = (duration: string) => {
    if (duration.toLowerCase().includes("week"))
      return <Calendar className="h-4 w-4" />;
    if (duration.toLowerCase().includes("month"))
      return <TrendingUp className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilter("all");
    setSortBy("name");
  };

  const hasActiveFilters =
    searchTerm || priceFilter !== "all" || sortBy !== "name";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-16 sm:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3 sm:mb-4">
              <BookOpen className="h-4 w-4 mr-2" />
              Explore Our Courses
            </div>
            <h1 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Discover Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Learning Path
              </span>
            </h1>
            <p className="text-responsive-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose from our comprehensive range of professional courses
              designed to help you advance your career and acquire new skills.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-0 rounded-2xl shadow-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {courses.filter((c) => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Available Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </button>
              )}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredCourses.length}</span>{" "}
                course
                {filteredCourses.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free Courses</option>
                    <option value="low">Under GHC500</option>
                    <option value="medium">GHC500 - GHC1000</option>
                    <option value="high">Over GHC1000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Sort by Duration</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            {tabOptions.map((tab) => (
              <button
                key={tab.key}
                className={`flex flex-col items-center gap-2 px-8 py-6 rounded-2xl font-semibold text-base shadow-lg border transition-all duration-300 focus:outline-none min-w-[200px]
                  ${
                    activeTab === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white border-transparent scale-105 shadow-xl`
                      : "bg-white text-gray-700 border-gray-200 hover:shadow-xl hover:scale-105"
                  }
                `}
                onClick={() => setActiveTab(tab.key)}
              >
                <div
                  className={`p-3 rounded-xl ${
                    activeTab === tab.key ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  {tab.icon}
                </div>
                <div className="text-center">
                  <div className="font-bold">{tab.label}</div>
                  <div
                    className={`text-xs mt-1 ${
                      activeTab === tab.key ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCourses.length > 0 &&
          groupedCourses[activeTab] &&
          groupedCourses[activeTab].length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "space-y-6"
              }
            >
              {groupedCourses[activeTab].map((course, index) => {
                const priceCategory = getPriceCategory(course.price);
                return (
                  <div
                    key={course.id}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 animate-fade-in ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Course Header with Gradient */}
                    <div
                      className={`relative bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 p-6 ${
                        viewMode === "list" ? "w-1/3" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                          <BookOpen className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ${course.price}
                          </div>
                          <div
                            className={`text-xs px-3 py-1.5 rounded-full font-medium ${priceCategory.color}`}
                          >
                            {priceCategory.label}
                          </div>
                        </div>
                      </div>

                      {/* Course Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-md">
                          Active
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div
                      className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}
                    >
                      {/* Course Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {course.name}
                      </h3>

                      {/* Course Description */}
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-sm">
                        {course.description}
                      </p>

                      {/* Course Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          {getDurationIcon(course.duration)}
                          <span className="font-medium">{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            Max {course.maxStudents}
                          </span>
                        </div>
                      </div>

                      {/* Course Features */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">4.8</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Award className="h-4 w-4 text-primary" />
                            <span className="font-medium">Certificate</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/courses/${course.id}`}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or filters to find what
                you're looking for.
              </p>
              <button onClick={clearFilters} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          )}
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
                to="/about"
                className="btn btn-outline btn-lg text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
