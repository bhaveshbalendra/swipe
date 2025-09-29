import type { GoogleGenAI } from "@google/genai";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  score: number;
  status: "pending" | "in-progress" | "completed";
  interviewData?: InterviewData;
  createdAt: string;
  // Additional fields for compatibility
  resumeUrl?: string;
  finalScore?: number;
  summary?: string;
  startTime?: string;
  endTime?: string;
  interviewStatus?: string;
  answers?: Answer[];
  questions?: Question[];
}

export interface InterviewData {
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  startTime: string;
  endTime?: string;
  totalScore: number;
  isActive?: boolean;
  pausedQuestionId?: string; // Track which question was paused
  pausedAt?: string; // Track when the question was paused
}

export interface Question {
  id: string;
  text: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  category: string;
}

export interface Answer {
  questionId: string;
  text: string;
  score: number;
  feedback: string;
  timestamp: string;
  timeSpent?: number;
  submittedAt?: string;
}

export interface ChatMessage {
  id: string;
  text?: string;
  content?: string;
  isUser: boolean;
  timestamp: string;
  type?: string;
  questionId?: string;
}

export interface AppState {
  currentTab: "interviewee" | "interviewer" | "validation";
  candidates: Candidate[];
  currentCandidate: Candidate | null;
  isInterviewActive: boolean;
  chatMessages: ChatMessage[];
  geminiInstance: GoogleGenAI;
}

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  text: string;
  skills?: string[];
  experience?: string[];
  education?: string[];
  summary?: string;
}
