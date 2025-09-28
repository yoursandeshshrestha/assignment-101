import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { resumeService } from "../../../services/resumeService";
import type { ResumeData } from "../../../types";
import ResumeUploadScreen from "./ResumeUploadScreen";
import InterviewChat from "./InterviewChat";

const IntervieweeScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ResumeData | null>(null);
  const [showInterview, setShowInterview] = useState(false);

  // ===== Check Redux state for active or paused interview ===== //
  const { isActive, questions, isCompleted } = useSelector(
    (state: RootState) => state.interview
  );

  // ===== Handle file select ===== //
  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

    setIsProcessing(true);

    try {
      // ===== Use the existing resume service to parse the resume ===== //
      const parsedData = await resumeService.parseResume(file);

      setExtractedData(parsedData);
      // ===== Go directly to chat interface - chatbot will collect missing fields ===== //
      setShowInterview(true);
    } catch (err) {
      console.error("Resume parsing error:", err);
      alert("Failed to parse resume. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== Show interview chat if interview has started (either from new upload or existing session) ===== //
  // Consider both active and paused sessions as sessions that should show the chat interface
  const hasActiveOrPausedSession =
    questions.length > 0 && (isActive || (!isActive && !isCompleted));

  if (showInterview || hasActiveOrPausedSession) {
    return <InterviewChat extractedData={extractedData} />;
  }

  // ===== Show upload screen ===== //
  return (
    <ResumeUploadScreen
      isProcessing={isProcessing}
      onFileSelect={handleFileSelect}
    />
  );
};

export default IntervieweeScreen;
