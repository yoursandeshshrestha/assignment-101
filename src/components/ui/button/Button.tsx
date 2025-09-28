import React, { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  props,
  ref
) {
  const {
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    icon,
    type = "button",
    className = "",
    ...rest
  } = props;

  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-300 ease-in-out cursor-pointer";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 h-12 text-xl",
    lg: "px-8 py-4 text-lg",
  };

  const disabledClasses =
    disabled || loading ? "opacity-50 cursor-not-allowed" : "";
  const gapClasses = icon ? "gap-2" : "";

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${gapClasses} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});

export default Button;
