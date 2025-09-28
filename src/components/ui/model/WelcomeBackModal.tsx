import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Play } from "lucide-react";
import type { RootState } from "../../../store";
import { resumeInterview } from "../../../store/slices/interviewSlice";
import BaseModal from "../modal/BaseModal";

const WelcomeBackModal: React.FC = () => {
  const dispatch = useDispatch();
  const { showWelcomeBackModal } = useSelector(
    (state: RootState) => state.interview
  );
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ===== Reset countdown when modal opens ===== //
  useEffect(() => {
    if (showWelcomeBackModal) {
      setCountdown(3);
    }
  }, [showWelcomeBackModal]);

  // ===== Auto-resume countdown ===== //
  useEffect(() => {
    if (!showWelcomeBackModal) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      dispatch(resumeInterview());
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showWelcomeBackModal, countdown, dispatch]);

  // ===== Handle resume ===== //
  const handleResume = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dispatch(resumeInterview());
  };

  // ===== Handle close ===== //
  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    dispatch(resumeInterview());
  };

  // ===== Show modal only when showWelcomeBackModal is true ===== //
  if (!showWelcomeBackModal) {
    return null;
  }

  return (
    <BaseModal
      isOpen={showWelcomeBackModal}
      onClose={handleClose}
      title="Welcome Back!"
      subtitle="Resuming your interview"
      size="md"
    >
      {/* ===== Countdown Timer ===== */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <Play className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-medium text-blue-800">
            Resuming Interview
          </span>
        </div>
        <div className="text-left">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {countdown}
          </div>
          <p className="text-sm text-blue-700">
            Interview will resume automatically in {countdown} second
            {countdown !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ===== Resume Button =====   */}
      <div className="space-y-2">
        <button
          onClick={handleResume}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Play className="w-4 h-4 mr-2" />
          Resume Now
        </button>
      </div>
    </BaseModal>
  );
};

export default WelcomeBackModal;
