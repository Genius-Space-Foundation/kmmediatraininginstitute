import React, { useState } from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showText = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-16 h-16 sm:w-20 sm:h-20",
  };

  const textSizes = {
    sm: "text-sm sm:text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl sm:text-3xl",
  };

  // Try multiple logo sources
  const logoSources = [
    "/images/logo.jpeg",
    "/logo.jpeg",
    "/images/logo.png",
    "/logo.png",
  ];

  const handleImageError = () => {
    setImageError(true);
  };

  // If image failed to load, show SVG fallback
  if (imageError) {
    return (
      <div
        className={`flex items-center space-x-2 sm:space-x-3 group ${className}`}
      >
        <div
          className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-blue-600 flex items-center justify-center`}
        >
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="currentColor" />
            <text
              x="50"
              y="50"
              fontFamily="Arial, sans-serif"
              fontSize="24"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
            >
              KM
            </text>
          </svg>
        </div>
        {showText && (
          <div className="flex flex-col">
            <span
              className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors ${textSizes[size]}`}
            >
              KM Media
            </span>
            <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
              Training Institute
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center space-x-2 sm:space-x-3 group ${className}`}
    >
      <div
        className={`${sizeClasses[size]} rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}
      >
        <img
          src={logoSources[0]}
          alt="KM Media Logo"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors ${textSizes[size]}`}
          >
            KM Media
          </span>
          <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
            Training Institute
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
