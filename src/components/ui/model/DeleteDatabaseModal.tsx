import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import Button from "../button/Button";
import { indexedDBService } from "../../../services/indexedDBService";
import BaseModal from "../modal/BaseModal";

interface DeleteDatabaseModalProps {
  show: boolean;
  onClose: () => void;
}

const DeleteDatabaseModal: React.FC<DeleteDatabaseModalProps> = ({
  show,
  onClose,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteDatabase = async () => {
    setIsDeleting(true);
    try {
      // ===== First try to clear all data ===== //
      try {
        await indexedDBService.clearAllData();
      } catch (clearError) {
        console.warn(
          "Failed to clear data, trying to delete entire database:",
          clearError
        );
      }

      // ===== Then delete the entire database ===== //
      try {
        await indexedDBService.deleteDatabase();
      } catch (deleteError) {
        console.warn("Failed to delete database:", deleteError);
      }

      // ===== Wait a moment before reloading ===== //
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to delete database:", error);
      alert("Failed to delete database. Please try again.");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!show) {
    return null;
  }

  return (
    <BaseModal
      isOpen={show}
      onClose={handleClose}
      title="Delete Database"
      subtitle="This action cannot be undone"
      size="md"
      closeButtonPosition="outside"
      showCloseButton={!isDeleting}
    >
      {/* ===== Warning Info ===== */}
      <div className="bg-red-50 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-3">
          <div className="text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Warning: This will permanently delete all data
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• All interview sessions will be lost</li>
              <li>• All candidate data will be deleted</li>
              <li>• All application settings will be reset</li>
              <li>• The page will reload after deletion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== Action Button ===== */}
      <div className="space-y-2">
        <Button
          onClick={handleDeleteDatabase}
          variant="primary"
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Database
            </>
          )}
        </Button>
      </div>
    </BaseModal>
  );
};

export default DeleteDatabaseModal;
