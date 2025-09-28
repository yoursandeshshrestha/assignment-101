import React from "react";
import { getStatusColor } from "../../../utils/colors";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  const statusText = status.replace("_", " ");
  const colorClasses = getStatusColor(status);

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${colorClasses} ${className}`}
    >
      {statusText}
    </span>
  );
};

export default StatusBadge;
