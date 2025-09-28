import type { InterviewQuestion, Candidate, ResumeData } from "../types";

// Mock interview questions
export const mockQuestions: InterviewQuestion[] = [
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
    difficulty: "medium",
    timeLimit: 60,
    category: "Frontend",
  },
  {
    id: "3",
    text: "How would you optimize a React application for performance?",
    difficulty: "hard",
    timeLimit: 120,
    category: "Frontend",
  },
];

// Mock candidate data
export const mockCandidate: Candidate = {
  id: "candidate-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "1234567890",
  interviewStatus: "completed",
  finalScore: 85,
  startTime: "2024-01-01T10:00:00Z",
  endTime: "2024-01-01T11:00:00Z",
  answers: [
    {
      questionId: "1",
      answer: "React is a JavaScript library for building user interfaces.",
      score: 90,
      feedback: "Great answer!",
      timeSpent: 15,
      timestamp: "2024-01-01T10:15:00Z",
      detailed_scores: {
        technical_accuracy: 9,
        problem_solving: 9,
        communication: 9,
        relevance: 9,
        depth_of_knowledge: 9,
      },
      strengths: ["Clear explanation"],
      areas_for_improvement: [],
      suggestions: [],
    },
  ],
  summary: "Excellent candidate with strong technical knowledge.",
};

// Mock resume data
export const mockResumeData: ResumeData = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "1234567890",
  text: "John Doe\nSoftware Engineer\njohn.doe@example.com\n1234567890\n\nExperience:\n- 5 years React development\n- Node.js backend experience\n- Full-stack development",
};

// Mock API responses
export const mockApiResponses = {
  questions: {
    success: true,
    questions: mockQuestions,
  },
  score: {
    success: true,
    score: 85,
    feedback: "Good understanding of React concepts.",
    detailed_scores: {
      technical_accuracy: 17,
      problem_solving: 16,
      communication: 18,
      relevance: 19,
      depth_of_knowledge: 15,
    },
    strengths: ["Clear explanation", "Good examples"],
    areas_for_improvement: ["More technical depth"],
    suggestions: ["Practice more coding problems"],
  },
  summary: {
    success: true,
    summary:
      "John demonstrates solid technical knowledge and clear communication skills.",
  },
  resume: {
    success: true,
    data: mockResumeData,
  },
};

// Mock file objects for testing
export const createMockFile = (
  name: string,
  type: string,
  content: string = ""
) => {
  const file = new File([content], name, { type });
  return file;
};

// Mock validation test cases
export const validationTestCases = {
  validEmails: [
    "john.doe@example.com",
    "user123@gmail.com",
    "test-user@company.org",
    "admin@subdomain.example.co.uk",
  ],
  invalidEmails: ["invalid-email", "user@", "@domain.com", "user@domain"],
  validPhones: ["1234567890", "9876543210", "5551234567"],
  invalidPhones: [
    "123456789",
    "1234567890123456",
    "0000000000",
    "1111111111",
    "1234567",
  ],
  validNames: ["John Doe", "Jane Smith", "Mary Johnson", "Robert Brown"],
  invalidNames: ["John", "a", "123", "John123"],
};
