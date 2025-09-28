/**
 * API Configuration
 * Centralized configuration for all API endpoints and settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:7078/api/v1",
  ENDPOINTS: {
    HEALTH: "/health/",
    GENERATE_QUESTIONS: "/chat/generate-questions",
    SCORE_ANSWER: "/chat/score-answer",
    GENERATE_SUMMARY: "/chat/generate-summary",
    PARSE_RESUME: "/resume/parse",
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

export type ApiEndpoint = keyof typeof API_CONFIG.ENDPOINTS;
