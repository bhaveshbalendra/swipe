import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { geminiInstance } from "../../config/geminiConfig";
import type { AppState, Candidate, ChatMessage } from "../../types";

const initialState: AppState = {
  currentTab: "interviewee",
  candidates: [],
  currentCandidate: null,
  isInterviewActive: false,
  chatMessages: [],
  geminiInstance: geminiInstance(),
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCurrentTab: (
      state,
      action: PayloadAction<"interviewee" | "interviewer" | "validation">
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
  },
});

export const {
  setCurrentTab,
  setCurrentCandidate,
  setIsInterviewActive,
  addChatMessage,
  clearChatMessages,
} = appSlice.actions;

export default appSlice.reducer;
