import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store";
import {
  startInterview,
  submitAnswer,
  updateTimeRemaining,
  completeInterview,
  pauseInterview,
  setCandidateInfo,
  addChatMessage,
  syncInterviewProgress,
} from "../../../store/slices/interviewSlice";
import { aiService } from "../../../services/aiService";
import type { InterviewAnswer, ResumeData } from "../../../types";
import Button from "../../ui/button/Button";
import WelcomeBackModal from "../../ui/model/WelcomeBackModal";
import PauseModal from "../../ui/model/PauseModal";
import LoadingSpinner from "../../ui/loader/LoadingSpinner";
import ChatMessage from "../../chat/ChatMessage";
import { useInterviewTimer } from "../../../hooks/useInterviewTimer";
import {
  validateEmail,
  validatePhone,
  validateName,
} from "../../../utils/validation";
import { sanitizeTextInput } from "../../../utils/sanitization";
import { Check, Clock, Pause, AlertTriangle, Send } from "lucide-react";

interface InterviewChatProps {
  extractedData?: ResumeData | null;
}

const InterviewChat: React.FC<InterviewChatProps> = ({ extractedData }) => {
  const dispatch = useDispatch();
  const {
    isActive,
    currentQuestion,
    timeRemaining,
    questions,
    answers,
    currentQuestionIndex,
    showWelcomeBackModal,
    chatHistory,
    candidateId,
  } = useSelector((state: RootState) => state.interview);

  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [shownQuestions, setShownQuestions] = useState<Set<string>>(new Set());
  const [isCollectingInfo, setIsCollectingInfo] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const hasStartedRef = useRef(false);
  const [collectedInfo, setCollectedInfo] = useState<{
    name: string;
    email: string;
    phone: string;
  }>({
    name: extractedData?.name || "",
    email: extractedData?.email || "",
    phone: extractedData?.phone || "",
  });

  // ===== Custom hooks ===== //
  const { formatTime: timerFormatTime } = useInterviewTimer();

  // ===== Helper function to check if a message already exists in chat history ===== //
  const messageExists = useCallback(
    (messageId: string) => {
      return chatHistory.some((msg) => msg.id === messageId);
    },
    [chatHistory]
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const collectedInfoRef = useRef(collectedInfo);
  const hasRestoredHistoryRef = useRef(false);

  // ===== Update collectedInfo when extractedData changes ===== //
  useEffect(() => {
    if (extractedData) {
      const newInfo = {
        name: extractedData.name || "",
        email: extractedData.email || "",
        phone: extractedData.phone || "",
      };
      setCollectedInfo(newInfo);
      collectedInfoRef.current = newInfo;
    }
  }, [extractedData]);

  // ===== Update ref when collectedInfo changes ===== //
  useEffect(() => {
    collectedInfoRef.current = collectedInfo;
  }, [collectedInfo]);

  // ===== Ask for missing field ===== //
  const askForMissingField = useCallback(
    (field: string) => {
      const fieldMessages: { [key: string]: string } = {
        name: "What is your full name?",
        email: "What is your email address?",
        phone: "What is your phone number?",
      };

      const botMessageId = `ask-${field}-${Date.now()}`;
      if (!messageExists(botMessageId)) {
        const botMessage = {
          id: botMessageId,
          type: "bot" as const,
          content: fieldMessages[field],
          timestamp: new Date().toISOString(),
        };
        dispatch(addChatMessage(botMessage));
      }
    },
    [messageExists, dispatch]
  );

  // ===== Validate field ===== //
  const validateField = useCallback((field: string, value: string): boolean => {
    let validation;

    switch (field) {
      case "name":
        validation = validateName(value);
        break;
      case "email":
        validation = validateEmail(value);
        break;
      case "phone":
        validation = validatePhone(value);
        break;
      default:
        return true;
    }

    if (!validation.isValid) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: validation.errorMessage || "Invalid input",
      }));
      return false;
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    }
  }, []);

  // ===== Show validation error ===== //
  const showValidationError = useCallback(
    (field: string, errorMessage: string) => {
      const errorMessageId = `error-${field}-${Date.now()}`;
      if (!messageExists(errorMessageId)) {
        const errorMessageObj = {
          id: errorMessageId,
          type: "bot" as const,
          content: `${errorMessage} Please try again.`,
          timestamp: new Date().toISOString(),
        };
        dispatch(addChatMessage(errorMessageObj));
      }
    },
    [dispatch, messageExists]
  );

  // ===== Handle input change ===== //
  const handleInputChange = useCallback(
    (value: string) => {
      // ===== Sanitize input for security ===== //
      const sanitizedValue = sanitizeTextInput(value);

      // ===== Basic input validation ===== //
      let finalValue = sanitizedValue;
      if (sanitizedValue.length > 2000) {
        console.warn("Input too long, truncating");
        finalValue = sanitizedValue.substring(0, 2000);
      }

      // ===== If we're collecting phone number, only allow numeric characters ===== //
      if (isCollectingInfo && missingFields[0] === "phone") {
        // ===== Remove all non-numeric characters ===== //
        const numericOnly = finalValue.replace(/\D/g, "");
        setAnswer(numericOnly);
      } else {
        setAnswer(finalValue);
      }

      // ===== Real-time validation for collecting info ===== //
      if (isCollectingInfo && missingFields.length > 0) {
        const currentField = missingFields[0];
        const trimmedValue = finalValue.trim();

        // ===== Only validate if there's actual content ===== //
        if (trimmedValue.length > 0) {
          const isValid = validateField(currentField, trimmedValue);

          // ===== Clear validation errors for this field if it becomes valid ===== //
          if (isValid) {
            setValidationErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[currentField];
              return newErrors;
            });
          }
        } else {
          // ===== Clear validation errors when field is empty ===== //
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[currentField];
            return newErrors;
          });
        }
      }
    },
    [isCollectingInfo, missingFields, validateField]
  );

  // ===== Start actual interview ===== //
  const startActualInterview = useCallback(async () => {
    setIsGeneratingQuestions(true);
    setShownQuestions(new Set());

    // ===== Add interview start message ===== //
    const startMessageId = `interview-start-${Date.now()}`;
    if (!messageExists(startMessageId)) {
      const startMessage = {
        id: startMessageId,
        type: "bot" as const,
        content:
          "Perfect! Now let's begin the interview. I'll be asking you 6 questions today - 2 easy, 2 medium, and 2 hard questions. Let me prepare some questions for you...",
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage(startMessage));
    }

    try {
      const generatedQuestions = await aiService.generateInterviewQuestions();
      dispatch(startInterview(generatedQuestions));
    } catch (error) {
      console.error("Error starting interview:", error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, [dispatch, messageExists]);

  // ===== Start interview flow ===== //
  const startInterviewFlow = useCallback(async () => {
    // ===== Check for missing fields first ===== //
    const missing: string[] = [];
    const currentInfo = collectedInfoRef.current;
    if (!currentInfo.name.trim()) missing.push("name");
    if (!currentInfo.email.trim()) missing.push("email");
    if (!currentInfo.phone.trim()) missing.push("phone");

    if (missing.length > 0) {
      setIsCollectingInfo(true);
      setMissingFields(missing);

      // ===== Add welcome message and start collecting missing info ===== //
      const welcomeMessageId = `welcome-${Date.now()}`;
      if (!messageExists(welcomeMessageId)) {
        const welcomeMessage = {
          id: welcomeMessageId,
          type: "bot" as const,
          content:
            "Hello! I'm your AI interviewer. I noticed some information is missing from your resume. Let me collect that first before we start the interview.",
          timestamp: new Date().toISOString(),
        };
        dispatch(addChatMessage(welcomeMessage));
      }

      // ===== Ask for the first missing field ===== //
      askForMissingField(missing[0]);
    } else {
      // ===== All info is available, store candidate info and start the interview ===== //
      dispatch(
        setCandidateInfo({
          name: currentInfo.name,
          email: currentInfo.email,
          phone: currentInfo.phone,
          resumeText: extractedData?.text,
        })
      );
      startActualInterview();
    }
  }, [
    startActualInterview,
    askForMissingField,
    messageExists,
    dispatch,
    extractedData?.text,
  ]);

  // ===== Handle pause ===== //
  const handlePause = useCallback(() => {
    dispatch(pauseInterview());
  }, [dispatch]);

  // ===== Handle submit answer ===== //
  const handleSubmitAnswer = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    // ===== Add user's answer to chat history ===== //
    const userAnswerId = `answer-${Date.now()}`;
    if (!messageExists(userAnswerId)) {
      const userAnswer = {
        id: userAnswerId,
        type: "user" as const,
        content: answer.trim() || "No answer provided",
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage(userAnswer));
    }

    // ===== If we're collecting information, handle that first ===== //
    if (isCollectingInfo) {
      const currentField = missingFields[0];
      const trimmedAnswer = answer.trim();

      // ===== Validate the current field ===== //
      const isValid = validateField(currentField, trimmedAnswer);

      if (!isValid) {
        // ===== Show error message and ask for the same field again ===== //
        const errorMessage = validationErrors[currentField];
        if (errorMessage) {
          showValidationError(currentField, errorMessage);
        }
        setIsSubmitting(false);
        setAnswer("");
        return;
      }

      // ===== If validation passes, update collected info ===== //
      const updatedInfo = {
        ...collectedInfo,
        [currentField]: trimmedAnswer,
      };
      setCollectedInfo(updatedInfo);

      // ===== Remove the current field from missing fields ===== //
      const remainingFields = missingFields.slice(1);
      setMissingFields(remainingFields);

      if (remainingFields.length > 0) {
        // ===== Ask for the next missing field ===== //
        setTimeout(() => askForMissingField(remainingFields[0]), 1000);
      } else {
        // ===== All fields collected, store candidate info and start the interview ===== //
        setIsCollectingInfo(false);

        // ===== Store candidate information in Redux store with updated info ===== //
        dispatch(
          setCandidateInfo({
            name: updatedInfo.name,
            email: updatedInfo.email,
            phone: updatedInfo.phone,
            resumeText: extractedData?.text,
          })
        );

        setTimeout(() => startActualInterview(), 1000);
      }

      setIsSubmitting(false);
      setAnswer("");
      return;
    }

    // ===== Handle interview answer submission ===== //
    if (!currentQuestion) {
      setIsSubmitting(false);
      return;
    }

    try {
      // ===== Score the answer ===== //
      const scoringResult = await aiService.scoreAnswer(
        currentQuestion,
        answer
      );

      const answerData: InterviewAnswer = {
        questionId: currentQuestion.id,
        answer: answer.trim() || "No answer provided",
        score: scoringResult.score,
        feedback: scoringResult.feedback,
        timeSpent: timeRemaining
          ? currentQuestion.timeLimit - timeRemaining
          : 0,
        timestamp: new Date().toISOString(),
        detailed_scores: scoringResult.detailed_scores,
        strengths: scoringResult.strengths,
        areas_for_improvement: scoringResult.areas_for_improvement,
        suggestions: scoringResult.suggestions,
      };

      dispatch(submitAnswer(answerData));
      setAnswer("");

      // ===== Check if interview is complete ===== //
      if (currentQuestionIndex + 1 >= questions.length) {
        setTimeout(() => {
          dispatch(completeInterview());
        }, 1000);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentQuestion,
    isSubmitting,
    answer,
    timeRemaining,
    currentQuestionIndex,
    questions,
    dispatch,
    isCollectingInfo,
    missingFields,
    askForMissingField,
    startActualInterview,
    validateField,
    showValidationError,
    validationErrors,
    messageExists,
    collectedInfo,
    extractedData?.text,
  ]);

  // ===== Auto-scroll to bottom when new messages arrive ===== //
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ===== Timer effect ===== //
  useEffect(() => {
    if (!isActive || !timeRemaining || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      const newTime = timeRemaining - 1;
      dispatch(updateTimeRemaining(newTime));

      if (newTime <= 0) {
        handleSubmitAnswer();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining, dispatch, handleSubmitAnswer]);

  // ===== Initialize interview flow when component mounts with extracted data ===== //
  useEffect(() => {
    if (
      extractedData &&
      !isActive &&
      questions.length === 0 &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      startInterviewFlow();
    }
  }, [extractedData, isActive, questions.length, startInterviewFlow]);

  // ===== Use effect to restore chat history ===== //
  useEffect(() => {
    // ===== Skip if no questions or not active ===== //
    if (!isActive || questions.length === 0) return;

    // ===== Check if we need to restore chat history (resumed session) ===== //
    const needsHistoryRestoration =
      chatHistory.length === 0 &&
      !hasRestoredHistoryRef.current &&
      (currentQuestionIndex > 0 || answers.length > 0);

    // ===== Check if we need to add current question (new or resumed session) ===== //
    const needsCurrentQuestion =
      currentQuestion && !shownQuestions.has(currentQuestion.id);

    if (needsHistoryRestoration) {
      hasRestoredHistoryRef.current = true;

      // ===== Add welcome message (only if not already exists) ===== //
      const welcomeMessageId = `welcome-${Date.now()}`;
      if (!messageExists(welcomeMessageId)) {
        const welcomeMessage = {
          id: welcomeMessageId,
          type: "bot" as const,
          content: "Welcome back! Let's continue your interview.",
          timestamp: new Date().toISOString(),
        };
        dispatch(addChatMessage(welcomeMessage));
      }

      // ===== Add all previous questions and answers (excluding current question) ===== //
      for (let i = 0; i < currentQuestionIndex; i++) {
        const question = questions[i];
        const answer = answers[i];

        // ===== Add question (only if not already exists) ===== //
        const questionMessageId = `question-${question.id}-restored`;
        if (!messageExists(questionMessageId)) {
          const questionMessage = {
            id: questionMessageId,
            type: "bot" as const,
            content: question.text,
            timestamp: new Date().toISOString(),
            isQuestion: true,
            difficulty: question.difficulty,
            questionId: question.id,
          };
          dispatch(addChatMessage(questionMessage));
        }

        // ===== Add answer if exists (only if not already exists) ===== //
        if (answer) {
          const answerMessageId = `answer-${question.id}-restored`;
          if (!messageExists(answerMessageId)) {
            const answerMessage = {
              id: answerMessageId,
              type: "user" as const,
              content: answer.answer,
              timestamp: new Date().toISOString(),
            };
            dispatch(addChatMessage(answerMessage));
          }
        }
      }

      // ===== Mark all previous questions as shown ===== //
      const shownSet = new Set<string>();
      for (let i = 0; i < currentQuestionIndex; i++) {
        if (questions[i]) {
          shownSet.add(questions[i].id);
        }
      }
      setShownQuestions(shownSet);
    }

    // ===== Add current question if needed ===== //
    if (needsCurrentQuestion) {
      const currentQuestionMessageId = `question-${currentQuestion.id}-current`;
      if (!messageExists(currentQuestionMessageId)) {
        const questionMessage = {
          id: currentQuestionMessageId,
          type: "bot" as const,
          content: currentQuestion.text,
          timestamp: new Date().toISOString(),
          isQuestion: true,
          difficulty: currentQuestion.difficulty,
          questionId: currentQuestion.id,
        };
        dispatch(addChatMessage(questionMessage));
      }
      setShownQuestions((prev) => new Set([...prev, currentQuestion.id]));
    }
  }, [
    isActive,
    questions.length,
    currentQuestionIndex,
    answers.length,
    currentQuestion,
    chatHistory.length,
    shownQuestions,
    messageExists,
    dispatch,
    answers,
    questions,
  ]);

  // ===== Sync interview progress to candidate periodically ===== //
  useEffect(() => {
    if (!isActive || !candidateId) return;

    const syncInterval = setInterval(() => {
      dispatch(syncInterviewProgress());
    }, 5000); // ===== Sync every 5 seconds ===== //

    return () => clearInterval(syncInterval);
  }, [isActive, candidateId, dispatch]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isGeneratingQuestions) {
    return (
      <LoadingSpinner
        title="Preparing Your Interview"
        description="AI is generating personalized questions for you..."
        size="lg"
        className="flex-1"
      />
    );
  }

  if (!isActive && !showWelcomeBackModal && !isCollectingInfo) {
    // ===== Check if interview is completed using Redux state ===== //
    const isCompleted =
      answers.length >= questions.length && questions.length > 0;

    if (!isCompleted) {
      // ===== If not completed, don't show completion screen ===== //
      return null;
    }

    const displayAnswers = answers;
    const averageScore =
      displayAnswers.length > 0
        ? Math.round(
            displayAnswers.reduce(
              (sum: number, a: { score: number }) => sum + a.score,
              0
            ) / displayAnswers.length
          )
        : 0;

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Check className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Interview Complete!
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            Thank you for completing the interview. Your responses have been
            recorded and will be reviewed.
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Interview Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Questions answered: {displayAnswers.length}</p>
              <p>Average score: {averageScore}%</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="text-xs text-red-600 hover:text-red-800 underline block"
              >
                Clear Interview Data (for testing)
              </button>
              <button
                onClick={() => {
                  // ===== Test session data is now managed by Redux/IndexedDB ===== //
                  window.location.reload();
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline block"
              >
                Create Test Completed Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== Show welcome back modal if paused ===== //
  if (showWelcomeBackModal) {
    return <WelcomeBackModal />;
  }

  return (
    <>
      <WelcomeBackModal />
      <PauseModal />
      <div className="flex-1 flex flex-col h-screen bg-gray-50">
        {/* ===== Chat Header ===== */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  AI Interviewer
                </h2>
                <p className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                      currentQuestion?.difficulty || ""
                    )}`}
                  >
                    {currentQuestion?.difficulty?.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentQuestion?.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span
                    className={`text-sm font-mono ${
                      timeRemaining && timeRemaining <= 10
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    {timeRemaining ? timerFormatTime(timeRemaining) : "0:00"}
                  </span>
                </div>
                <Button
                  onClick={handlePause}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Chat Messages - Scrollable Area ===== */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {chatHistory.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                isQuestion={message.isQuestion}
                difficulty={message.difficulty}
                questionId={message.questionId}
                score={message.score}
                feedback={message.feedback}
              />
            ))}

            {isSubmitting && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">
                      Evaluating your answer...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ===== Input Area - Fixed at bottom ===== */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            {timeRemaining && timeRemaining <= 10 && (
              <div className="flex items-center space-x-2 mb-3 text-red-600 bg-red-50 p-3 rounded-lg">
                <span className="text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Time running out! Submit your answer soon.
                </span>
              </div>
            )}

            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={
                      isCollectingInfo
                        ? `Please provide your ${
                            missingFields[0] || "information"
                          }...`
                        : "Type your answer here..."
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                      isCollectingInfo &&
                      missingFields.length > 0 &&
                      validationErrors[missingFields[0]]
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    rows={3}
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitAnswer();
                      }
                    }}
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-400">
                    {answer.length}
                  </div>
                </div>
                {/* ===== Show validation error message ===== */}
                {isCollectingInfo &&
                  missingFields.length > 0 &&
                  validationErrors[missingFields[0]] && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {validationErrors[missingFields[0]]}
                    </div>
                  )}
              </div>
              <Button
                onClick={handleSubmitAnswer}
                disabled={
                  isSubmitting ||
                  !answer.trim() ||
                  (isCollectingInfo &&
                    missingFields.length > 0 &&
                    !!validationErrors[missingFields[0]])
                }
                variant="primary"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isCollectingInfo ? "Processing..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isCollectingInfo ? "Submit" : "Send"}
                  </>
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>
                {answers.length} of {questions.length} questions completed
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewChat;
