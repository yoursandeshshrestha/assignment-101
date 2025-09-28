import React from "react";
import type { Candidate } from "../../../types";
import { X, Award, MessageSquare, Clock, CheckCircle } from "lucide-react";

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  questions?: Array<{
    id: string;
    text: string;
    difficulty: string;
    category: string;
  }>;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  questions = [],
}) => {
  // ===== Helper function to get score color ===== //
  const getScoreColor = (score?: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // ===== Helper function to get status color ===== //
  const getStatusColor = (status: Candidate["interviewStatus"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "not_started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ===== Helper function to get question text ===== //
  const getQuestionText = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    return question ? question.text : "Question not found";
  };

  // ===== Helper function to get question difficulty ===== //
  const getQuestionDifficulty = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    return question ? question.difficulty : "unknown";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* ===== Close Button - Outside Modal ===== */}
        <button
          onClick={onClose}
          className="absolute -top-10 -right-0 w-8 h-8 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center border-gray-200 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* ===== Header ===== */}
          <div className="flex items-center p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg font-medium text-blue-600">
                  {candidate.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {candidate.name}
                </h2>
                <p className="text-sm text-gray-500">Candidate Details</p>
              </div>
            </div>
          </div>

          {/* ===== Content ===== */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ===== Left Column - Profile Information ===== */}
              <div className="lg:col-span-1 space-y-6">
                {/* ===== Profile Information ===== */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Profile Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-gray-500">Full Name</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.email}
                      </p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {candidate.phone}
                      </p>
                      <p className="text-xs text-gray-500">Phone Number</p>
                    </div>
                  </div>
                </div>

                {/* ===== AI Summary ===== */}
                {candidate.summary && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      AI Summary
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {candidate.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* ===== Right Column - Interview Status & Details ===== */}
              <div className="lg:col-span-2 space-y-6">
                {/* ===== Interview Status =====   */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Interview Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          candidate.interviewStatus
                        )}`}
                      >
                        {candidate.interviewStatus.replace("_", " ")}
                      </span>
                    </div>
                    {candidate.startTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Started</span>
                        <span className="text-sm text-gray-900">
                          {new Date(candidate.startTime).toLocaleString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {candidate.endTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm text-gray-900">
                          {new Date(candidate.endTime).toLocaleString([], {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {candidate.finalScore && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Final Score
                        </span>
                        <span
                          className={`text-sm font-medium ${getScoreColor(
                            candidate.finalScore
                          )}`}
                        >
                          {candidate.finalScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Interview Details
                  </h3>

                  {candidate.interviewStatus === "not_started" ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Interview has not started yet
                      </p>
                    </div>
                  ) : candidate.interviewStatus === "in_progress" ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Interview is currently in progress
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Started:{" "}
                        {candidate.startTime
                          ? new Date(candidate.startTime).toLocaleString([], {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                  ) : candidate.chatHistory &&
                    candidate.chatHistory.length > 0 ? (
                    <div className="space-y-4">
                      {/* ===== Chat History ===== */}
                      <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Interview Chat History
                        </h4>
                        <div className="space-y-3">
                          {candidate.chatHistory.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${
                                message.type === "user"
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.type === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-900"
                                }`}
                              >
                                <div className="text-sm">{message.content}</div>
                                {message.isQuestion && message.difficulty && (
                                  <div className="text-xs mt-1 opacity-75">
                                    {message.difficulty} question
                                  </div>
                                )}
                                <div className="text-xs mt-1 opacity-75">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString([], {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ===== Interview Answers with Scores ===== */}
                      {candidate.interviewAnswers &&
                        candidate.interviewAnswers.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Detailed Question Analysis
                            </h4>
                            <div className="space-y-4">
                              {candidate.interviewAnswers.map(
                                (answer, index) => (
                                  <div
                                    key={answer.questionId}
                                    className="border-l-4 border-blue-200 pl-4"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Question {index + 1}
                                      </span>
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded-full ${
                                            getQuestionDifficulty(
                                              answer.questionId
                                            ) === "easy"
                                              ? "bg-green-100 text-green-800"
                                              : getQuestionDifficulty(
                                                  answer.questionId
                                                ) === "medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {getQuestionDifficulty(
                                            answer.questionId
                                          ).toUpperCase()}
                                        </span>
                                        <span
                                          className={`text-sm font-medium ${
                                            answer.score >= 80
                                              ? "text-green-600"
                                              : answer.score >= 60
                                              ? "text-yellow-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          Score: {answer.score}/100
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-800 mb-3 p-3 bg-gray-50 rounded-lg">
                                      <strong>Question:</strong>{" "}
                                      {getQuestionText(answer.questionId)}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                      <strong>Answer:</strong> {answer.answer}
                                    </div>
                                    {answer.feedback && (
                                      <div className="text-sm text-gray-500 mb-2">
                                        <strong>Feedback:</strong>{" "}
                                        {answer.feedback}
                                      </div>
                                    )}

                                    {/* Enhanced Scoring Details */}
                                    {answer.detailed_scores && (
                                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">
                                          Detailed Scores:
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div className="flex justify-between">
                                            <span>Technical Accuracy:</span>
                                            <span className="font-medium">
                                              {
                                                answer.detailed_scores
                                                  .technical_accuracy
                                              }
                                              /10
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Problem Solving:</span>
                                            <span className="font-medium">
                                              {
                                                answer.detailed_scores
                                                  .problem_solving
                                              }
                                              /10
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Communication:</span>
                                            <span className="font-medium">
                                              {
                                                answer.detailed_scores
                                                  .communication
                                              }
                                              /10
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Relevance:</span>
                                            <span className="font-medium">
                                              {answer.detailed_scores.relevance}
                                              /10
                                            </span>
                                          </div>
                                          <div className="flex justify-between col-span-2">
                                            <span>Depth of Knowledge:</span>
                                            <span className="font-medium">
                                              {
                                                answer.detailed_scores
                                                  .depth_of_knowledge
                                              }
                                              /10
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {answer.strengths &&
                                      answer.strengths.length > 0 && (
                                        <div className="mb-2 p-2 bg-green-50 rounded-lg">
                                          <h5 className="text-xs font-semibold text-green-700 mb-1">
                                            Strengths:
                                          </h5>
                                          <ul className="text-xs text-green-600 list-disc list-inside">
                                            {answer.strengths.map(
                                              (strength, idx) => (
                                                <li key={idx}>{strength}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {answer.areas_for_improvement &&
                                      answer.areas_for_improvement.length >
                                        0 && (
                                        <div className="mb-2 p-2 bg-yellow-50 rounded-lg">
                                          <h5 className="text-xs font-semibold text-yellow-700 mb-1">
                                            Areas for Improvement:
                                          </h5>
                                          <ul className="text-xs text-yellow-600 list-disc list-inside">
                                            {answer.areas_for_improvement.map(
                                              (area, idx) => (
                                                <li key={idx}>{area}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {answer.suggestions &&
                                      answer.suggestions.length > 0 && (
                                        <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                                          <h5 className="text-xs font-semibold text-blue-700 mb-1">
                                            Suggestions:
                                          </h5>
                                          <ul className="text-xs text-blue-600 list-disc list-inside">
                                            {answer.suggestions.map(
                                              (suggestion, idx) => (
                                                <li key={idx}>{suggestion}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    <div className="text-xs text-gray-400 mt-1">
                                      Time spent:{" "}
                                      {Math.round(answer.timeSpent / 60)}{" "}
                                      minutes
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* ===== Interview Results ===== */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Interview Results
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span
                              className={`font-semibold ${getScoreColor(
                                candidate.finalScore
                              )}`}
                            >
                              {candidate.finalScore}/100
                            </span>
                          </div>
                        </div>

                        {/* ===== Score Breakdown ===== */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {candidate.finalScore &&
                              candidate.finalScore >= 80
                                ? "Excellent"
                                : candidate.finalScore &&
                                  candidate.finalScore >= 60
                                ? "Good"
                                : "Needs Improvement"}
                            </div>
                            <div className="text-sm text-gray-600">
                              Overall Performance
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {candidate.startTime && candidate.endTime
                                ? Math.round(
                                    (new Date(candidate.endTime).getTime() -
                                      new Date(candidate.startTime).getTime()) /
                                      60000
                                  )
                                : "N/A"}
                              m
                            </div>
                            <div className="text-sm text-gray-600">
                              Total Time
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              6
                            </div>
                            <div className="text-sm text-gray-600">
                              Questions Asked
                            </div>
                          </div>
                        </div>

                        {/* ===== Performance Indicators ===== */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Technical Knowledge
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${candidate.finalScore || 0}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {candidate.finalScore || 0}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Communication
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (candidate.finalScore || 0) + 10,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {Math.min(
                                  (candidate.finalScore || 0) + 10,
                                  100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Problem Solving
                            </span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.max(
                                      (candidate.finalScore || 0) - 5,
                                      0
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {Math.max((candidate.finalScore || 0) - 5, 0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ===== Recommendations =====   */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {candidate.finalScore &&
                          candidate.finalScore >= 80 ? (
                            <div className="flex items-center space-x-2 text-green-700">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">
                                Strong candidate - recommend for next round
                              </span>
                            </div>
                          ) : candidate.finalScore &&
                            candidate.finalScore >= 60 ? (
                            <div className="flex items-center space-x-2 text-yellow-700">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">
                                Good candidate - consider for specific roles
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-700">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">
                                Needs improvement - consider additional training
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
