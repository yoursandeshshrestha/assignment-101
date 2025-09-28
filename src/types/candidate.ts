import type { InterviewAnswer } from "./interview";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  resumeText?: string;
  interviewStatus: "not_started" | "in_progress" | "paused" | "completed";
  finalScore?: number;
  summary?: string;
  startTime?: string;
  endTime?: string;
  pauseTime?: string;
  resumeTime?: string;
  lastActivityTime?: string;
  currentQuestionIndex?: number;
  chatHistory?: Array<{
    id: string;
    type: "bot" | "user";
    content: string;
    timestamp: string;
    isQuestion?: boolean;
    difficulty?: string;
    questionId?: string;
    score?: number;
    feedback?: string;
    detailed_scores?: {
      technical_accuracy: number;
      problem_solving: number;
      communication: number;
      relevance: number;
      depth_of_knowledge: number;
    };
    strengths?: string[];
    areas_for_improvement?: string[];
    suggestions?: string[];
  }>;
  interviewAnswers?: InterviewAnswer[];
  answers?: InterviewAnswer[];
}
