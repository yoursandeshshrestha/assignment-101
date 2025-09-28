import React from "react";
import { Users, MessageSquare } from "lucide-react";
import Button from "../ui/button/Button";
import swipeLogo from "../../assets/swipe-logo.svg";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <>
      <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="w-full">
          {/* ===== Mobile Layout - Stacked ===== */}
          <div className="flex flex-col space-y-4 lg:hidden">
            {/* ===== Logo and Title Section ===== */}
            <div className="flex items-center space-x-3">
              <img
                src={swipeLogo}
                alt="Swipe Logo"
                className="h-12 w-32 sm:h-14 sm:w-36 border-r border-gray-300 pr-3"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-blue-600 truncate">
                  Swipe Internship Assignment
                </h1>
                <p className="text-gray-600 text-sm sm:text-base truncate">
                  AI-Powered Interview Assistant
                </p>
              </div>
            </div>

            {/* ===== Tab Navigation ===== */}
            <div className="flex space-x-2">
              <Button
                onClick={() => onTabChange("interviewee")}
                variant={activeTab === "interviewee" ? "primary" : "secondary"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Interviewee</span>
                <span className="sm:hidden">Interview</span>
              </Button>
              <Button
                onClick={() => onTabChange("interviewer")}
                variant={activeTab === "interviewer" ? "primary" : "secondary"}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Users className="w-4 h-4 mr-2" />
                Interviewer
              </Button>
            </div>
          </div>

          {/* ===== Desktop Layout - Horizontal ===== */}
          <div className="hidden lg:flex items-center justify-between">
            {/* ===== Left Side - Logo, Title and Description ===== */}
            <div className="flex items-center space-x-4">
              <img
                src={swipeLogo}
                alt="Swipe Logo"
                className="h-16 w-40 border-r border-gray-300 pr-4"
              />
              <div>
                <h1 className="text-3xl font-bold text-blue-600">
                  Swipe Internship Assignment
                </h1>
                <p className="text-gray-600 text-lg">
                  AI-Powered Interview Assistant
                </p>
              </div>
            </div>

            {/* ===== Right Side - Tab Navigation ===== */}
            <div className="flex space-x-2">
              <Button
                onClick={() => onTabChange("interviewee")}
                variant={activeTab === "interviewee" ? "primary" : "secondary"}
                size="md"
              >
                <MessageSquare className="w-5 h-5 mr-3" />
                Interviewee
              </Button>
              <Button
                onClick={() => onTabChange("interviewer")}
                variant={activeTab === "interviewer" ? "primary" : "secondary"}
                size="md"
              >
                <Users className="w-5 h-5 mr-3" />
                Interviewer
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
