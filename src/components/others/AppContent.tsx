import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import Header from "../layout/Header";
import IntervieweeScreen from "../screen/interviewee/IntervieweeScreen";
import InterviewCompletionScreen from "../screen/interviewee/InterviewCompletionScreen";
import InterviewerDashboard from "../screen/interviewer/InterviewerDashboard";
import WelcomeBackModal from "../ui/model/WelcomeBackModal";
import PauseModal from "../ui/model/PauseModal";
import DeleteDatabaseModal from "../ui/model/DeleteDatabaseModal";
import SessionLoadingScreen from "../loader/SessionLoadingScreen";
import Button from "../ui/button/Button";
import { Trash2 } from "lucide-react";

const AppContent: React.FC = () => {
  const { questions, isCompleted, answers } = useSelector(
    (state: RootState) => state.interview
  );
  const [activeTab, setActiveTab] = useState<"interviewee" | "interviewer">(
    "interviewee"
  );
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ===== Handle session checking loading state ===== //
  useEffect(() => {
    if (activeTab === "interviewee") {
      // ===== Show loading for 2 seconds to check for active session ===== //
      const timer = setTimeout(() => {
        setIsCheckingSession(false);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsCheckingSession(false);
    }
  }, [activeTab]);

  // ===== Show loading screen while checking for active session ===== //
  if (isCheckingSession && activeTab === "interviewee") {
    return <SessionLoadingScreen />;
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) =>
          setActiveTab(tab as "interviewee" | "interviewer")
        }
      />

      {activeTab === "interviewee" &&
        (questions.length > 0 &&
        isCompleted &&
        answers.length >= questions.length ? (
          <InterviewCompletionScreen />
        ) : (
          <IntervieweeScreen />
        ))}

      {activeTab === "interviewer" && <InterviewerDashboard />}

      {/* ===== Clear DB Button  ===== */}
      <Button
        onClick={() => setShowDeleteConfirm(true)}
        variant="secondary"
        size="sm"
        className="fixed bottom-4 right-4 z-50 text-red-600 hover:text-red-700 hover:bg-red-50 shadow-lg"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Clear DB
      </Button>

      {/* ===== Modals ===== */}
      <WelcomeBackModal />
      <PauseModal />
      <DeleteDatabaseModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default AppContent;
