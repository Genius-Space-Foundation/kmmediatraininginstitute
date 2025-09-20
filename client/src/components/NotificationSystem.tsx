import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export interface NotificationItem {
  id: string;
  type: "assignment" | "grade" | "payment" | "course" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
}

interface NotificationSystemProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  className?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "high") return notification.priority === "high";
    return true;
  });

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-5 w-5 ${
      priority === "high"
        ? "text-red-500"
        : priority === "medium"
        ? "text-yellow-500"
        : "text-blue-500"
    }`;

    switch (type) {
      case "assignment":
        return <AlertTriangle className={iconClass} />;
      case "grade":
        return <CheckCircle className={iconClass} />;
      case "payment":
        return <Check className={iconClass} />;
      case "course":
        return <Info className={iconClass} />;
      case "system":
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      // Navigate to action URL or trigger action
      console.log("Navigate to:", notification.actionUrl);
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
    toast.success("Notification deleted");
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === "unread"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter("high")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === "high"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  High ({highPriorityCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      notification.read ? "opacity-75" : ""
                    } ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(
                          notification.type,
                          notification.priority
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${
                              notification.read
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => handleDelete(e, notification.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationSystem;










