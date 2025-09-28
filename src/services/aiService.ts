import type { InterviewQuestion } from "../types";
import { apiClient } from "./apiClient";
import { API_CONFIG } from "../config/api";

export interface AIResponse {
  questions?: InterviewQuestion[];
  score?: number;
  feedback?: string;
  summary?: string;
}

class AIService {
  private async callBackendAPI(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return await apiClient.post(endpoint, data);
  }

  async generateInterviewQuestions(): Promise<InterviewQuestion[]> {
    try {
      // First test if backend is reachable
      const isHealthy = await apiClient.healthCheck();
      if (!isHealthy) {
        throw new Error(
          "Backend server is not running. Please start the backend with: python3 app.py"
        );
      }

      const result = await this.callBackendAPI(
        API_CONFIG.ENDPOINTS.GENERATE_QUESTIONS,
        {}
      );
      return result.questions as InterviewQuestion[];
    } catch (error) {
      console.error("❌ Error generating questions:", error);
      return this.getMockQuestions();
    }
  }

  async scoreAnswer(
    question: InterviewQuestion,
    answer: string
  ): Promise<{
    score: number;
    feedback: string;
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
  }> {
    try {
      // Make direct API call for scoring since backend returns enhanced response
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCORE_ANSWER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question, answer }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Scoring failed");
      }

      return {
        score: result.score as number,
        feedback: result.feedback as string,
        detailed_scores: result.detailed_scores,
        strengths: result.strengths,
        areas_for_improvement: result.areas_for_improvement,
        suggestions: result.suggestions,
      };
    } catch (error) {
      console.error("❌ Error scoring answer:", error);
      return {
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        feedback:
          "AI scoring temporarily unavailable. This is a placeholder score.",
      };
    }
  }

  async generateCandidateSummary(candidate: {
    name: string;
    email: string;
    answers: { answer: string; score: number }[];
    questions: { text: string }[];
    finalScore?: number;
  }): Promise<string> {
    try {
      // Make direct API call for summary since backend returns {success: true, summary: "..."}
      // but apiClient.processResponse expects {success: true, data: {...}}
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_SUMMARY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ candidate }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Summary generation failed");
      }

      return result.summary as string;
    } catch (error) {
      console.error("❌ Error generating summary:", error);
      return "AI summary generation temporarily unavailable. Please review the interview responses manually.";
    }
  }

  private getMockQuestions(): InterviewQuestion[] {
    return [
      {
        id: "1",
        text: "What is React and how does it work?",
        difficulty: "easy",
        timeLimit: 20,
        category: "Frontend",
      },
      {
        id: "2",
        text: "Explain the difference between state and props in React.",
        difficulty: "easy",
        timeLimit: 20,
        category: "Frontend",
      },
      {
        id: "3",
        text: "How would you optimize a React application for performance?",
        difficulty: "medium",
        timeLimit: 60,
        category: "Frontend",
      },
      {
        id: "4",
        text: "Describe your experience with Node.js and Express.",
        difficulty: "medium",
        timeLimit: 60,
        category: "Backend",
      },
      {
        id: "5",
        text: "Design a scalable architecture for a real-time chat application.",
        difficulty: "hard",
        timeLimit: 120,
        category: "System Design",
      },
      {
        id: "6",
        text: "How would you handle authentication and authorization in a microservices architecture?",
        difficulty: "hard",
        timeLimit: 120,
        category: "Backend",
      },
    ];
  }
}

export const aiService = new AIService();
