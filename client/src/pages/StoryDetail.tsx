import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  User,
  Clock,
  Share2,
  Send,
  Award,
  Lightbulb,
  CalendarDays,
  TrendingUp,
  Building,
  Activity,
  Users,
  BookOpen,
} from "lucide-react";
import { storiesApi, type Story, type Comment } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

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

const StoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (id) {
      fetchStory();
      fetchComments();
      if (user) {
        checkLikeStatus();
      }
    }
  }, [id, user]);

  const fetchStory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await storiesApi.getStory(Number(id));
      setStory(response.story);
    } catch (error) {
      console.error("Error fetching story:", error);
      navigate("/stories");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await storiesApi.getStoryComments(Number(id), {
        page: currentPage,
        limit: 10,
      });
      setComments(response.comments);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [id, currentPage]);

  const checkLikeStatus = useCallback(async () => {
    try {
      const response = await storiesApi.checkStoryLike(Number(id));
      setLiked(response.liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await storiesApi.likeStory(Number(id));
      setLiked(response.liked);
      if (story) {
        setStory({
          ...story,
          likeCount: response.liked ? story.likeCount + 1 : story.likeCount - 1,
        });
      }
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      await storiesApi.addComment(Number(id), newComment);
      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Story not found
          </h2>
          <p className="text-gray-600 mb-6">
            The story you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/stories")}
            className="btn bg-primary text-white hover:bg-primary/90"
          >
            Back to Stories
          </button>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryConfig(story.category);
  const IconComponent = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/stories")}
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story Header */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden mb-8">
          {story.featuredImage && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={story.featuredImage}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {categoryInfo.label}
                </span>
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {categoryInfo.label}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {formatDate(story.publishedAt || story.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {story.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {story.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <User className="mr-2 h-4 w-4" />
                By {story.firstName} {story.lastName}
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  {story.viewCount} views
                </span>
                <button
                  onClick={handleLike}
                  className={`flex items-center transition-colors ${
                    liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <Heart
                    className={`mr-1 h-4 w-4 ${liked ? "fill-current" : ""}`}
                  />
                  {story.likeCount} likes
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center text-gray-500 hover:text-primary transition-colors"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {story.content}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="mr-2 h-6 w-6" />
              Comments ({comments.length})
            </h2>
          </div>

          {/* Add Comment */}
          {user && (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-6 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {!user && (
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl text-center">
              <p className="text-gray-600 mb-4">
                Please log in to leave a comment
              </p>
              <button
                onClick={() => navigate("/login")}
                className="btn bg-primary text-white hover:bg-primary/90"
              >
                Log In
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.firstName} {comment.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>

          {/* Pagination for Comments */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
