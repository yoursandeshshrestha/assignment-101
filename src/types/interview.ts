export interface InterviewQuestion {
  id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number; // ===== in seconds ===== //
  category: string;
}

export interface DetailedScores {
  technical_accuracy: number;
  problem_solving: number;
  communication: number;
  relevance: number;
  depth_of_knowledge: number;
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
  score: number;
  feedback: string;
  timeSpent: number; // ===== in seconds ===== //
  timestamp: string;
  detailed_scores?: DetailedScores;
  strengths?: string[];
  areas_for_improvement?: string[];
  suggestions?: string[];
}
