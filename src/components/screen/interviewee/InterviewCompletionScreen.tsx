import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Download, RotateCcw } from "lucide-react";
import type { RootState } from "../../../store";
import { resetInterview } from "../../../store/slices/interviewSlice";
import { aiService } from "../../../services/aiService";
import { candidateSyncService } from "../../../services/candidateSyncService";
import LoadingSpinner from "../../ui/loader/LoadingSpinner";
import congoImage from "../../../assets/congo.png";

const InterviewCompletionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    questions,
    answers,
    sessionId,
    startTime,
    endTime,
    candidateInfo,
    chatHistory,
    candidateId,
  } = useSelector((state: RootState) => state.interview);
  const hasAddedCandidateRef = useRef(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // ===== Calculate statistics ===== //
  const totalQuestions = questions.length;
  const answeredQuestions = answers.length;
  const averageScore =
    answeredQuestions > 0
      ? Math.round(
          answers.reduce((sum, answer) => sum + answer.score, 0) /
            answeredQuestions
        )
      : 0;

  // ===== Calculate total time spent (actual interview duration from start to end) ===== //
  const timeSpentMinutes =
    startTime && endTime
      ? Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
        )
      : 0;

  // ===== Calculate total duration allocated for all questions based on assignment requirements ===== //
  // 2 Easy (20s) + 2 Medium (60s) + 2 Hard (120s) = 400 seconds = 6.67 minutes
  const totalQuestionDuration = 7; // 7 minutes rounded up

  // ===== Generate AI summary and update existing candidate when component mounts (only once) ===== //
  useEffect(() => {
    if (candidateInfo && candidateId && !hasAddedCandidateRef.current) {
      const generateSummaryAndUpdateCandidate = async () => {
        setIsGeneratingSummary(true);

        try {
          // ===== Generate AI summary ===== //
          const summary = await aiService.generateCandidateSummary({
            name: candidateInfo.name,
            email: candidateInfo.email,
            answers: answers,
            questions: questions,
            finalScore: averageScore,
          });


          // ===== Update the existing candidate with completion data ===== //
          await candidateSyncService.syncInterviewComplete(
            candidateId,
            averageScore,
            summary,
            chatHistory,
            answers
          );

          hasAddedCandidateRef.current = true;
        } catch (error) {
          console.error("Error generating summary:", error);
          // ===== Fallback to basic summary ===== //
          const fallbackSummary = `Completed interview with ${averageScore}% average score. Answered ${answeredQuestions}/${totalQuestions} questions in ${timeSpentMinutes} minutes.`;

          // ===== Update the existing candidate with fallback summary ===== //
          await candidateSyncService.syncInterviewComplete(
            candidateId,
            averageScore,
            fallbackSummary,
            chatHistory,
            answers
          );

          hasAddedCandidateRef.current = true;
        } finally {
          setIsGeneratingSummary(false);
        }
      };

      generateSummaryAndUpdateCandidate();
    }
  }, [
    candidateInfo,
    candidateId,
    answers,
    questions,
    averageScore,
    answeredQuestions,
    totalQuestions,
    timeSpentMinutes,
    startTime,
    endTime,
    chatHistory,
  ]);

  // ===== Handle download results ===== //
  const handleDownloadResults = () => {
    const results = {
      sessionId,
      startTime,
      endTime: new Date().toISOString(),
      totalQuestions,
      answeredQuestions,
      averageScore,
      totalTimeSpent: timeSpentMinutes,
      interviewDuration: totalQuestionDuration,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit,
      })),
      answers: answers.map((a) => ({
        questionId: a.questionId,
        answer: a.answer,
        score: a.score,
        feedback: a.feedback,
        timeSpent: a.timeSpent,
        timestamp: a.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-results-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartNewInterview = () => {
    // ===== Reset the interview state to start fresh ===== //
    dispatch(resetInterview());
  };

  // ===== Show loading spinner if generating summary ===== //
  if (isGeneratingSummary) {
    return (
      <LoadingSpinner
        title="Generating Your Summary"
        description="AI is analyzing your interview responses..."
        size="lg"
        className="flex-1 bg-white"
      />
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-white">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-12">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* ===== Left Side - Congo Image and Success Message ===== */}
            <div className="flex-1 text-center lg:text-left">
              <div className="mb-8">
                <img
                  src={congoImage}
                  alt="Congratulations"
                  className="w-96 h-96 mx-auto lg:mx-0 object-contain"
                />
              </div>

              {/* ===== Action Buttons ===== */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button
                  onClick={handleDownloadResults}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Results
                </button>

                <button
                  onClick={handleStartNewInterview}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start New Interview
                </button>
              </div>
            </div>

            {/* ===== Right Side - Statistics and Details ===== */}
            <div className="flex-1 space-y-8">
              {/* ===== Statistics Grid ===== */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {answeredQuestions}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Questions Answered
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {averageScore}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Average Score
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {timeSpentMinutes}m
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Time Spent
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {totalQuestionDuration}m
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Duration
                  </div>
                </div>
              </div>

              {/* ===== Session Details =====  */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Session Details
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">
                      Start Time:
                    </span>
                    <span className="text-gray-900">
                      {startTime
                        ? new Date(startTime).toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-700">End Time:</span>
                    <span className="text-gray-900">
                      {endTime
                        ? new Date(endTime).toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCompletionScreen;
