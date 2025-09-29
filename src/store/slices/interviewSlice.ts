import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  type ChatMessage,
  type InterviewData,
  type Question,
} from "../../types";

interface InterviewState {
  currentSession?: InterviewData;
  questions: Question[];
  chatMessages: ChatMessage[];
  isPaused: boolean;
  timeRemaining: number;
  lastPauseTime?: string; // Track when the session was last paused
  sessionStartTime?: string; // Track when the current question started
  pausedTimeRemaining?: number; // Store the remaining time when paused
}

const initialState: InterviewState = {
  questions: [],
  chatMessages: [],
  isPaused: false,
  timeRemaining: 0,
  lastPauseTime: undefined,
  sessionStartTime: undefined,
  pausedTimeRemaining: undefined,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    startInterview: (
      state,
      action: PayloadAction<{ candidateId: string; questions: Question[] }>
    ) => {
      const now = new Date().toISOString();
      state.currentSession = {
        questions: action.payload.questions,
        answers: [],
        currentQuestionIndex: 0,
        startTime: now,
        totalScore: 0,
        endTime: undefined,
        isActive: true, // Add isActive flag
      };
      state.questions = action.payload.questions;
      state.chatMessages = [];
      state.isPaused = false;
      state.sessionStartTime = now;
      state.lastPauseTime = undefined;
      if (action.payload.questions.length > 0) {
        state.timeRemaining = action.payload.questions[0].timeLimit;
      }
    },
    pauseInterview: (state) => {
      if (state.currentSession) {
        const now = new Date().toISOString();
        state.currentSession.endTime = now;
        state.currentSession.pausedAt = now;
        state.currentSession.pausedQuestionId =
          state.questions[state.currentSession.currentQuestionIndex]?.id;
        state.lastPauseTime = now;
        state.pausedTimeRemaining = state.timeRemaining; // Store the current remaining time
        state.isPaused = true;
      }
    },
    resumeInterview: (state) => {
      if (state.currentSession && state.lastPauseTime) {
        // Don't add pause duration to totalScore, just resume the timer
        state.currentSession.endTime = undefined;
        state.currentSession.pausedAt = undefined;
        state.currentSession.pausedQuestionId = undefined;
        state.lastPauseTime = undefined;
        state.isPaused = false;
        state.sessionStartTime = new Date().toISOString();
        // Restore the paused time if available
        if (state.pausedTimeRemaining !== undefined) {
          state.timeRemaining = state.pausedTimeRemaining;
          state.pausedTimeRemaining = undefined;
        }
      }
    },
    nextQuestion: (state) => {
      if (state.currentSession) {
        state.currentSession.currentQuestionIndex += 1;
        if (
          state.currentSession.currentQuestionIndex < state.questions.length
        ) {
          state.timeRemaining =
            state.questions[
              state.currentSession.currentQuestionIndex
            ].timeLimit;
          state.sessionStartTime = new Date().toISOString();
        }
      }
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },
    updateTimeRemaining: (
      state,
      action: PayloadAction<number | ((prev: number) => number)>
    ) => {
      if (typeof action.payload === "function") {
        state.timeRemaining = action.payload(state.timeRemaining);
      } else {
        state.timeRemaining = action.payload;
      }
    },
    syncTimerOnResume: (state) => {
      if (state.currentSession && state.sessionStartTime && !state.isPaused) {
        const now = Date.now();
        const startTime = new Date(state.sessionStartTime).getTime();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);

        if (
          state.currentSession.currentQuestionIndex < state.questions.length
        ) {
          const currentQuestion =
            state.questions[state.currentSession.currentQuestionIndex];
          const remainingTime = Math.max(
            0,
            currentQuestion.timeLimit - elapsedSeconds
          );
          state.timeRemaining = remainingTime;
        }
      }
    },
    endInterview: (state) => {
      if (state.currentSession) {
        state.currentSession.endTime = new Date().toISOString();
        state.currentSession.isActive = false; // Set isActive to false
        state.currentSession.pausedAt = undefined;
        state.currentSession.pausedQuestionId = undefined;
        state.currentSession = undefined;
      }
      state.questions = [];
      state.chatMessages = [];
      state.isPaused = false;
      state.timeRemaining = 0;
      state.lastPauseTime = undefined;
      state.sessionStartTime = undefined;
      state.pausedTimeRemaining = undefined;
    },
  },
});

export const {
  startInterview,
  pauseInterview,
  resumeInterview,
  nextQuestion,
  addChatMessage,
  updateTimeRemaining,
  syncTimerOnResume,
  endInterview,
} = interviewSlice.actions;
export default interviewSlice.reducer;
