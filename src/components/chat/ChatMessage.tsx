import { memo, useMemo } from "react";
import { getScoreColor, getDifficultyColor } from "../../utils/colors";
import { formatTime } from "../../utils/dateFormatting";

interface ChatMessageProps {
  id: string;
  type: "bot" | "user";
  content: string;
  timestamp: string;
  isQuestion?: boolean;
  difficulty?: string;
  questionId?: string;
  score?: number;
  feedback?: string;
  detailed_scores?: {
    technical_accuracy: number;
    problem_solving: number;
    communication: number;
    relevance: number;
    depth_of_knowledge: number;
  };
  strengths?: string[];
  areas_for_improvement?: string[];
  suggestions?: string[];
}

const ChatMessage = memo<ChatMessageProps>(
  ({
    type,
    content,
    timestamp,
    isQuestion = false,
    difficulty,
    score,
    feedback,
    detailed_scores,
    strengths,
    areas_for_improvement,
    suggestions,
  }) => {
    const formattedTime = useMemo(() => {
      return formatTime(timestamp);
    }, [timestamp]);

    const difficultyColorClasses = useMemo(() => {
      return getDifficultyColor(difficulty);
    }, [difficulty]);

    const scoreColorClasses = useMemo(() => {
      return getScoreColor(score);
    }, [score]);

    return (
      <div
        className={`flex ${type === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`flex items-start space-x-2 max-w-3xl ${
            type === "user" ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          {/* ===== Avatar ===== */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              type === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {type === "user" ? "U" : "B"}
          </div>

          {/* ===== Message Content ===== */}
          <div
            className={`rounded-2xl px-4 py-3 max-w-full ${
              type === "user"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200"
            }`}
          >
            {/* ===== Question Badge ===== */}
            {isQuestion && difficulty && type === "bot" && (
              <div className="flex items-center space-x-2 mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColorClasses}`}
                >
                  {difficulty.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">Question</span>
              </div>
            )}

            {/* ===== Score Display ===== */}
            {score !== undefined && type === "bot" && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Score:
                  </span>
                  <span className={`text-sm font-bold ${scoreColorClasses}`}>
                    {score}/100
                  </span>
                </div>
                {feedback && (
                  <p className="text-xs text-gray-600 mt-1">{feedback}</p>
                )}

                {/* Enhanced Scoring Details */}
                {detailed_scores && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">
                      Detailed Scores:
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span>Technical:</span>
                        <span className="font-medium">
                          {detailed_scores.technical_accuracy}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Problem Solving:</span>
                        <span className="font-medium">
                          {detailed_scores.problem_solving}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Communication:</span>
                        <span className="font-medium">
                          {detailed_scores.communication}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relevance:</span>
                        <span className="font-medium">
                          {detailed_scores.relevance}/10
                        </span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span>Depth:</span>
                        <span className="font-medium">
                          {detailed_scores.depth_of_knowledge}/10
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {strengths && strengths.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-green-600 mb-1">
                      Strengths:
                    </div>
                    <ul className="text-xs text-green-600 list-disc list-inside">
                      {strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {areas_for_improvement && areas_for_improvement.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-yellow-600 mb-1">
                      Areas for Improvement:
                    </div>
                    <ul className="text-xs text-yellow-600 list-disc list-inside">
                      {areas_for_improvement.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions && suggestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-blue-600 mb-1">
                      Suggestions:
                    </div>
                    <ul className="text-xs text-blue-600 list-disc list-inside">
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ===== Message Text ===== */}
            <p className="text-sm whitespace-pre-wrap break-words">{content}</p>

            {/* ===== Timestamp ===== */}
            <div className="flex items-center space-x-1 mt-1">
              <p
                className={`text-xs ${
                  type === "user" ? "text-blue-100" : "text-gray-400"
                }`}
              >
                {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
