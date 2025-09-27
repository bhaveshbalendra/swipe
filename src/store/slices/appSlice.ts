import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AIConfig, AppState, Candidate, ChatMessage } from "../../types";

const initialState: AppState = {
  currentTab: "interviewee",
  candidates: [],
  currentCandidate: null,
  isInterviewActive: false,
  chatMessages: [],
  aiConfig: {
    apiKey: "",
    model: "gemini-1.5-flash",
    temperature: 0.7,
    isEnabled: false,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCurrentTab: (
      state,
      action: PayloadAction<"interviewee" | "interviewer">
    ) => {
      state.currentTab = action.payload;
    },
    setCurrentCandidate: (state, action: PayloadAction<Candidate | null>) => {
      state.currentCandidate = action.payload;
    },
    setIsInterviewActive: (state, action: PayloadAction<boolean>) => {
      state.isInterviewActive = action.payload;
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
    updateAIConfig: (state, action: PayloadAction<Partial<AIConfig>>) => {
      state.aiConfig = { ...state.aiConfig, ...action.payload };
    },
  },
});

export const {
  setCurrentTab,
  setCurrentCandidate,
  setIsInterviewActive,
  addChatMessage,
  clearChatMessages,
  updateAIConfig,
} = appSlice.actions;

export default appSlice.reducer;
