import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Play } from "lucide-react";
import type { RootState } from "../../../store";
import {
  resumeInterview,
  setShowPauseModal,
} from "../../../store/slices/interviewSlice";
import Button from "../button/Button";
import BaseModal from "../modal/BaseModal";

const PauseModal: React.FC = () => {
  const dispatch = useDispatch();
  const { showPauseModal, questions, currentQuestionIndex } = useSelector(
    (state: RootState) => state.interview
  );

  const handleResume = () => {
    dispatch(resumeInterview());
  };

  const handleClose = () => {
    dispatch(setShowPauseModal(false));
  };

  // ===== Show modal only when showPauseModal is true ===== //
  if (!showPauseModal) {
    return null;
  }

  return (
    <BaseModal
      isOpen={showPauseModal}
      onClose={handleClose}
      title="Interview Paused"
      subtitle="Your progress has been saved"
      size="md"
      closeButtonPosition="outside"
    >
      {/* ===== Progress Info ===== */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="text-left">
          <div className="text-sm text-gray-600 mb-2">
            Progress: {currentQuestionIndex} of {questions.length} questions
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(currentQuestionIndex / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== Resume Button ===== */}
      <div className="space-y-2">
        <Button
          onClick={handleResume}
          variant="primary"
          size="lg"
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          Resume Interview
        </Button>
      </div>

      {/* ===== Info ===== */}
      <div className="mt-3 p-2 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700 text-left">
          <strong>Note:</strong> The timer will resume from where it was paused.
        </p>
      </div>
    </BaseModal>
  );
};

export default PauseModal;
