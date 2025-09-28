import { indexedDBService } from "./indexedDBService";
import type { Candidate } from "../types";

/**
 * Service to handle synchronization between interview state and candidates
 * This ensures the interviewer dashboard stays updated with real-time interview status
 */
class CandidateSyncService {
  /**
   * Create or update a candidate when interview starts
   */
  async syncInterviewStart(candidateInfo: {
    name: string;
    email: string;
    phone: string;
    resumeText?: string;
  }): Promise<Candidate> {
    const candidateId = `candidate_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const candidate: Candidate = {
      id: candidateId,
      name: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      resumeText: candidateInfo.resumeText,
      interviewStatus: "in_progress",
      startTime: new Date().toISOString(),
      chatHistory: [],
      interviewAnswers: [],
    };

    await indexedDBService.setItem("candidates", candidateId, candidate);
    return candidate;
  }

  /**
   * Create or update a candidate when interview starts with a specific ID
   */
  async syncInterviewStartWithId(
    candidateId: string,
    candidateInfo: {
      name: string;
      email: string;
      phone: string;
      resumeText?: string;
    }
  ): Promise<Candidate> {
    const candidate: Candidate = {
      id: candidateId,
      name: candidateInfo.name,
      email: candidateInfo.email,
      phone: candidateInfo.phone,
      resumeText: candidateInfo.resumeText,
      interviewStatus: "in_progress",
      startTime: new Date().toISOString(),
      chatHistory: [],
      interviewAnswers: [],
    };

    await indexedDBService.setItem("candidates", candidateId, candidate);
    return candidate;
  }

  /**
   * Update candidate status when interview is paused
   */
  async syncInterviewPause(candidateId: string): Promise<void> {
    const candidate = (await indexedDBService.getItem(
      "candidates",
      candidateId
    )) as Candidate | null;
    if (candidate) {
      candidate.interviewStatus = "paused";
      candidate.pauseTime = new Date().toISOString();
      await indexedDBService.setItem("candidates", candidateId, candidate);
    }
  }

  /**
   * Update candidate status when interview is resumed
   */
  async syncInterviewResume(candidateId: string): Promise<void> {
    const candidate = (await indexedDBService.getItem(
      "candidates",
      candidateId
    )) as Candidate | null;
    if (candidate) {
      candidate.interviewStatus = "in_progress";
      candidate.resumeTime = new Date().toISOString();
      await indexedDBService.setItem("candidates", candidateId, candidate);
    }
  }

  /**
   * Update candidate with chat history and progress
   */
  async syncInterviewProgress(
    candidateId: string,
    chatHistory: Array<{
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
    }>,
    currentQuestionIndex: number,
    answers: Array<{
      questionId: string;
      answer: string;
      score: number;
      feedback: string;
      timeSpent: number;
      timestamp: string;
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
    }>
  ): Promise<void> {
    const candidate = (await indexedDBService.getItem(
      "candidates",
      candidateId
    )) as Candidate | null;
    if (candidate) {
      candidate.chatHistory = chatHistory;
      candidate.currentQuestionIndex = currentQuestionIndex;
      candidate.interviewAnswers = answers;
      candidate.lastActivityTime = new Date().toISOString();
      await indexedDBService.setItem("candidates", candidateId, candidate);
    }
  }

  /**
   * Complete the interview and update candidate with final results
   */
  async syncInterviewComplete(
    candidateId: string,
    finalScore: number,
    summary: string,
    chatHistory: Array<{
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
    }>,
    answers: Array<{
      questionId: string;
      answer: string;
      score: number;
      feedback: string;
      timeSpent: number;
      timestamp: string;
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
    }>
  ): Promise<void> {
    let candidate = (await indexedDBService.getItem(
      "candidates",
      candidateId
    )) as Candidate | null;

    // If candidate not found by ID, try to find by email from chatHistory
    if (!candidate && chatHistory.length > 0) {
      const allCandidates = await this.getAllCandidates();
      // Try to find candidate by matching recent activity or email
      candidate =
        allCandidates.find(
          (c) =>
            c.interviewStatus === "in_progress" &&
            c.startTime &&
            new Date(c.startTime).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Within last 24 hours
        ) || null;

      if (candidate) {
        candidateId = candidate.id; // Update the candidateId for the sync
      }
    }

    if (candidate) {
      candidate.interviewStatus = "completed";
      candidate.finalScore = finalScore;
      candidate.summary = summary;
      candidate.chatHistory = chatHistory;
      candidate.interviewAnswers = answers;
      candidate.endTime = new Date().toISOString();
      await indexedDBService.setItem("candidates", candidateId, candidate);
    }
  }

  /**
   * Get candidate by ID
   */
  async getCandidate(candidateId: string): Promise<Candidate | null> {
    return (await indexedDBService.getItem(
      "candidates",
      candidateId
    )) as Candidate | null;
  }

  /**
   * Get all candidates with real-time status
   */
  async getAllCandidates(): Promise<Candidate[]> {
    const candidates = (await indexedDBService.getAllItems(
      "candidates"
    )) as Candidate[];
    return candidates.filter(
      (candidate) =>
        candidate && candidate.name && candidate.email && candidate.id
    );
  }

  /**
   * Find candidate by email (for existing interviews)
   */
  async findCandidateByEmail(email: string): Promise<Candidate | null> {
    const candidates = await this.getAllCandidates();
    return candidates.find((candidate) => candidate.email === email) || null;
  }

  /**
   * Clean up duplicate candidates (remove old sessionId-based candidates)
   */
  async cleanupDuplicateCandidates(): Promise<void> {
    const candidates = await this.getAllCandidates();
    const candidatesByEmail = new Map<string, Candidate[]>();

    // Group candidates by email
    candidates.forEach((candidate) => {
      if (!candidatesByEmail.has(candidate.email)) {
        candidatesByEmail.set(candidate.email, []);
      }
      candidatesByEmail.get(candidate.email)!.push(candidate);
    });

    // For each email, keep only the most recent candidate
    for (const [, emailCandidates] of candidatesByEmail) {
      if (emailCandidates.length > 1) {
        // Sort by startTime (most recent first)
        emailCandidates.sort((a, b) => {
          const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return timeB - timeA;
        });

        // Keep the first (most recent) and remove the rest
        const toRemove = emailCandidates.slice(1);

        for (const candidate of toRemove) {
          await indexedDBService.removeItem("candidates", candidate.id);
        }
      }
    }
  }
}

export const candidateSyncService = new CandidateSyncService();
