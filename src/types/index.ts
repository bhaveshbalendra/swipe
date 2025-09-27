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
}

export interface InterviewData {
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  startTime: string;
  endTime?: string;
  totalScore: number;
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
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export interface AppState {
  currentTab: "interviewee" | "interviewer";
  candidates: Candidate[];
  currentCandidate: Candidate | null;
  isInterviewActive: boolean;
  chatMessages: ChatMessage[];
  aiConfig: AIConfig;
}

export interface AIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  isEnabled: boolean;
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
