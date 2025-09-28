import React from "react";
import whatWeExtractImage from "../../../assets/what_we_extract.png";
import Button from "../../ui/button/Button";

interface ResumeUploadScreenProps {
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
}

const ResumeUploadScreen: React.FC<ResumeUploadScreenProps> = ({
  isProcessing,
  onFileSelect,
}) => {
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    const fileInput = document.getElementById(
      "resume-upload"
    ) as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Upload your <span className="font-black">resume</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get started with your AI-powered interview experience
          </p>

          <Button
            onClick={handleClick}
            variant="primary"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Upload Resume"}
          </Button>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-center">
          <img
            src={whatWeExtractImage}
            alt="What we extract from your resume"
            className="max-w-sm h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadScreen;
