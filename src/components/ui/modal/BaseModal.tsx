import React from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeButtonPosition?: "inside" | "outside";
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
  showCloseButton = true,
  closeButtonPosition = "inside",
}) => {
  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
  };

  const closeButtonClasses = {
    inside:
      "absolute top-3 right-3 w-6 h-6 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center shadow-sm border border-gray-200 transition-colors z-10",
    outside:
      "absolute -top-10 -right-0 w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center border-gray-200 transition-colors z-20 cursor-pointer",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className={closeButtonClasses[closeButtonPosition]}
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
        )}

        <div
          className={`bg-white rounded-2xl shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
            <div className="text-left">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
