import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  title = "Loading...",
  description,
  size = "md",
  fullScreen = false,
  className = "",
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  const spinnerContainerClasses = {
    sm: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4",
    md: "w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6",
    lg: "w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const titleSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={spinnerContainerClasses[size]}>
          <Loader2
            className={`${iconSizeClasses[size]} text-blue-600 animate-spin`}
          />
        </div>
        <h2
          className={`${titleSizeClasses[size]} font-semibold text-gray-900 mb-2`}
        >
          {title}
        </h2>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
