import React from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "skeleton";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        );

      case "pulse":
        return (
          <div
            className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}
          ></div>
        );

      case "skeleton":
        return (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        );

      default:
        return (
          <Loader2
            className={`${sizeClasses[size]} animate-spin text-blue-600`}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      {text && <p className="mt-2 text-sm text-gray-600 text-center">{text}</p>}
    </div>
  );
};

// Full page loading component
export const FullPageLoader: React.FC<{ text?: string }> = ({
  text = "Loading...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
};

// Skeleton loading component for content
export const SkeletonLoader: React.FC<{
  lines?: number;
  className?: string;
  variant?: "text" | "card" | "list";
}> = ({ lines = 3, className = "", variant = "text" }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        );

      case "list":
        return (
          <div className="space-y-3">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 animate-pulse"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div
                key={index}
                className={`h-4 bg-gray-200 rounded animate-pulse ${
                  index === lines - 1 ? "w-3/4" : "w-full"
                }`}
              ></div>
            ))}
          </div>
        );
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
};

// Button loading state
export const ButtonLoader: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return <Loader2 className={`${sizeClasses[size]} animate-spin`} />;
};

export default LoadingSpinner;

