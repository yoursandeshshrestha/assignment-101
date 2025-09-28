import { memo, useMemo } from "react";
import { Mail, Phone, Calendar, Award } from "lucide-react";
import type { Candidate } from "../../../types";
import { formatDate } from "../../../utils/dateFormatting";
import StatusBadge from "../../ui/status/StatusBadge";
import ScoreDisplay from "../../ui/score/ScoreDisplay";

interface CandidateRowProps {
  candidate: Candidate;
  onViewDetails: (candidate: Candidate) => void;
  isSelected?: boolean;
}

const CandidateRow = memo<CandidateRowProps>(
  ({ candidate, onViewDetails, isSelected = false }) => {
    const statusToDisplay = useMemo(() => {
      if (candidate.interviewStatus === "in_progress" && candidate.pauseTime) {
        return "paused";
      }
      return candidate.interviewStatus;
    }, [candidate.interviewStatus, candidate.pauseTime]);

    const formattedDate = useMemo(() => {
      if (candidate.endTime) {
        return formatDate(candidate.endTime);
      }
      if (candidate.startTime) {
        return formatDate(candidate.startTime);
      }
      return "N/A";
    }, [candidate.endTime, candidate.startTime]);

    const handleViewDetails = useMemo(() => {
      return () => onViewDetails(candidate);
    }, [onViewDetails, candidate]);

    return (
      <tr
        className={`hover:bg-gray-50 transition-colors duration-150 focus:outline-none ${
          isSelected ? "bg-blue-50" : ""
        }`}
      >
        <td className="px-6 py-5 whitespace-nowrap focus:outline-none">
          <div className="flex items-center">
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {candidate.name}
              </div>
              <div className="text-sm text-gray-500">ID: {candidate.id}</div>
            </div>
          </div>
        </td>

        <td className="px-6 py-5 whitespace-nowrap focus:outline-none">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <div className="text-sm font-medium text-gray-900">
              {candidate.email}
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <div className="text-sm text-gray-500">{candidate.phone}</div>
          </div>
        </td>

        <td className="px-6 py-5 whitespace-nowrap focus:outline-none">
          <StatusBadge status={statusToDisplay} />
        </td>

        <td className="px-6 py-5 whitespace-nowrap focus:outline-none">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-gray-400" />
            <ScoreDisplay score={candidate.finalScore} showLabel={false} />
          </div>
        </td>

        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 focus:outline-none">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </td>

        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium focus:outline-none">
          <button
            onClick={handleViewDetails}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            View Details
          </button>
        </td>
      </tr>
    );
  }
);

CandidateRow.displayName = "CandidateRow";

export default CandidateRow;
