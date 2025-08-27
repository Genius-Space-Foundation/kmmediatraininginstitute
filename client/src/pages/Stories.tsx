import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { storiesApi, type Story } from "../utils/api";
import {
  Heart,
  Eye,
  Clock,
  User,
  Tag,
  BookOpen,
  Search,
  Filter,
  Award,
  CalendarDays,
  Lightbulb,
  TrendingUp,
  Building,
  Activity,
  Users,
} from "lucide-react";

const categoryConfig = {
  success_story: {
    label: "Success Stories",
    icon: Award,
    color: "bg-green-100 text-green-700",
  },
  event: {
    label: "Events",
    icon: CalendarDays,
    color: "bg-blue-100 text-blue-700",
  },
  fun_fact: {
    label: "Fun Facts",
    icon: Lightbulb,
    color: "bg-yellow-100 text-yellow-700",
  },
  tip: {
    label: "Tips & Tricks",
    icon: TrendingUp,
    color: "bg-purple-100 text-purple-700",
  },
  behind_scenes: {
    label: "Behind the Scenes",
    icon: Building,
    color: "bg-indigo-100 text-indigo-700",
  },
  industry_news: {
    label: "Industry News",
    icon: Activity,
    color: "bg-red-100 text-red-700",
  },
  activity: {
    label: "Activities",
    icon: Users,
    color: "bg-orange-100 text-orange-700",
  },
};

const Stories: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stories, setStories] = useState<Story[]>([]);
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 9,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await storiesApi.getStories(params);
      setStories(response.stories || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchStories();
    fetchFeaturedStories();
  }, [fetchStories]);

  const fetchFeaturedStories = async () => {
    try {
      const response = await storiesApi.getFeaturedStories();
      // Featured stories API returns direct array, not wrapped in stories property
      const stories = Array.isArray(response)
        ? response
        : (response as any)?.stories || [];
      setFeaturedStories(stories);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set("search", searchTerm);
    if (selectedCategory) newSearchParams.set("category", selectedCategory);
    setSearchParams(newSearchParams);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
    setCurrentPage(1);
    const newSearchParams = new URLSearchParams();
    if (searchTerm) newSearchParams.set("search", searchTerm);
    if (selectedCategory !== category)
      newSearchParams.set("category", category);
    setSearchParams(newSearchParams);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryConfig = (category: string) => {
    return (
      categoryConfig[category as keyof typeof categoryConfig] || {
        label: category,
        icon: BookOpen,
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary/80">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-8">
              <BookOpen className="mr-2 h-4 w-4" />
              Stories & Updates
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Discover Our <span className="text-yellow-300">Stories</span>
            </h1>

            <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto mb-8">
              Stay connected with our community through success stories, events,
              tips, and behind-the-scenes content that inspires and educates.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      {featuredStories && featuredStories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Featured Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Don't miss these inspiring and engaging stories from our
                community
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {featuredStories &&
                featuredStories.slice(0, 3).map((story) => {
                  const categoryInfo = getCategoryConfig(
                    story.category || "default"
                  );
                  const IconComponent = categoryInfo.icon;

                  return (
                    <div
                      key={story.id}
                      className="group bg-white rounded-3xl shadow-soft hover-lift border border-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/stories/${story.id}`)}
                    >
                      {story.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={story.featuredImage}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                            >
                              <IconComponent className="mr-1 h-3 w-3" />
                              {categoryInfo.label}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                          >
                            <IconComponent className="mr-1 h-3 w-3" />
                            {categoryInfo.label}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(story.publishedAt || story.createdAt)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                          {story.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {story.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="mr-1 h-4 w-4" />
                            {`${story.firstName || ""} ${
                              story.lastName || ""
                            }`.trim() || "Unknown Author"}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="mr-1 h-4 w-4" />
                              {story.viewCount || 0}
                            </span>
                            <span className="flex items-center">
                              <Heart className="mr-1 h-4 w-4" />
                              {story.likeCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Stories */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-white rounded-xl shadow-soft border border-gray-100 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </button>

                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryFilter(selectedCategory)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                  >
                    {getCategoryConfig(selectedCategory).label}
                    <span className="ml-1">×</span>
                  </button>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {stories.length > 0 && (
                  <span>
                    Showing {(currentPage - 1) * 9 + 1} -{" "}
                    {Math.min(currentPage * 9, stories.length)} of{" "}
                    {totalPages * 9} stories
                  </span>
                )}
              </div>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="mt-6 p-6 bg-white rounded-2xl shadow-soft border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Categories
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const IconComponent = config.icon;
                    const isSelected = selectedCategory === key;

                    return (
                      <button
                        key={key}
                        onClick={() => handleCategoryFilter(key)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <IconComponent className="h-6 w-6 mb-2" />
                        <span className="text-xs font-medium text-center">
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stories && stories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {stories.map((story) => {
                  const categoryInfo = getCategoryConfig(
                    story.category || "default"
                  );
                  const IconComponent = categoryInfo.icon;

                  return (
                    <div
                      key={story.id}
                      className="group bg-white rounded-3xl shadow-soft hover-lift border border-gray-100 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/stories/${story.id}`)}
                    >
                      {story.featuredImage && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={story.featuredImage}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute top-4 left-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                            >
                              <IconComponent className="mr-1 h-3 w-3" />
                              {categoryInfo.label}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                          >
                            <IconComponent className="mr-1 h-3 w-3" />
                            {categoryInfo.label}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDate(story.publishedAt || story.createdAt)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                          {story.title}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {story.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="mr-1 h-4 w-4" />
                            {`${story.firstName || ""} ${
                              story.lastName || ""
                            }`.trim() || "Unknown Author"}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Eye className="mr-1 h-4 w-4" />
                              {story.viewCount || 0}
                            </span>
                            <span className="flex items-center">
                              <Heart className="mr-1 h-4 w-4" />
                              {story.likeCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isActive = page === currentPage;

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-xl border transition-colors ${
                            isActive
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stories found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filter criteria"
                  : "Check back soon for new stories and updates"}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setCurrentPage(1);
                  }}
                  className="btn bg-primary text-white hover:bg-primary/90"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Stay Connected with Our Community
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get inspired by success stories, stay updated with events, and
            discover valuable tips to enhance your learning journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/courses")}
              className="btn btn-lg bg-white text-primary hover:bg-gray-100 font-semibold"
            >
              Explore Our Courses
            </button>
            <button
              onClick={() => navigate("/about")}
              className="btn btn-lg border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold"
            >
              Learn More About Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stories;
