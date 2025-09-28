import React from "react";
import { getScoreColor } from "../../../utils/colors";

interface ScoreDisplayProps {
  score?: number;
  showLabel?: boolean;
  className?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  showLabel = true,
  className = "",
}) => {
  const colorClasses = getScoreColor(score);
  const displayScore = score ? `${score}/100` : "N/A";

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && <span className="text-sm text-gray-600">Score:</span>}
      <span className={`text-sm font-semibold ${colorClasses}`}>
        {displayScore}
      </span>
    </div>
  );
};

export default ScoreDisplay;
