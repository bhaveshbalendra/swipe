import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Answer, type Candidate } from "../../types";

interface CandidateState {
  candidates: Candidate[];
}

const initialState: CandidateState = {
  candidates: [],
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Candidate> }>
    ) => {
      const index = state.candidates.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.candidates[index] = {
          ...state.candidates[index],
          ...action.payload.updates,
        };
      }
    },
    addAnswer: (
      state,
      action: PayloadAction<{ candidateId: string; answer: Answer }>
    ) => {
      console.log("addAnswer called with:", action.payload);
      console.log(
        "Current candidates:",
        state.candidates.map((c) => ({ id: c.id, name: c.name }))
      );

      const candidate = state.candidates.find(
        (c) => c.id === action.payload.candidateId
      );

      console.log(
        "Found candidate:",
        candidate ? { id: candidate.id, name: candidate.name } : "NOT FOUND"
      );

      if (candidate) {
        if (!candidate.interviewData) {
          candidate.interviewData = {
            questions: [],
            answers: [],
            currentQuestionIndex: 0,
            startTime: new Date().toISOString(),
            totalScore: 0,
          };
        }
        candidate.interviewData.answers.push(action.payload.answer);
        console.log(
          "Added answer to candidate:",
          candidate.id,
          "Total answers:",
          candidate.interviewData.answers.length
        );
      } else {
        console.error(
          "Candidate not found for ID:",
          action.payload.candidateId
        );
      }
    },
    updateAnswer: (
      state,
      action: PayloadAction<{
        candidateId: string;
        questionId: string;
        updates: Partial<Answer>;
      }>
    ) => {
      const candidate = state.candidates.find(
        (c) => c.id === action.payload.candidateId
      );
      if (candidate) {
        const answer = candidate.interviewData?.answers.find(
          (a) => a.questionId === action.payload.questionId
        );
        if (answer) {
          Object.assign(answer, action.payload.updates);
        }
      }
    },
    setCandidateInterviewStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: Candidate["status"];
      }>
    ) => {
      const candidate = state.candidates.find(
        (c) => c.id === action.payload.id
      );
      if (candidate) {
        candidate.status = action.payload.status;
      }
    },
    setCandidateScore: (
      state,
      action: PayloadAction<{
        id: string;
        score: number;
        summary: string;
      }>
    ) => {
      console.log("setCandidateScore called with:", action.payload);
      const candidate = state.candidates.find(
        (c) => c.id === action.payload.id
      );
      console.log(
        "Found candidate:",
        candidate ? { id: candidate.id, name: candidate.name } : "NOT FOUND"
      );

      if (candidate) {
        candidate.score = action.payload.score;
        candidate.summary = action.payload.summary;
        candidate.status = "completed";
        if (candidate.interviewData) {
          candidate.interviewData.endTime = new Date().toISOString();
        }
        console.log("Updated candidate score:", candidate.score);
      } else {
        console.error(
          "Candidate not found for setCandidateScore:",
          action.payload.id
        );
      }
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  addAnswer,
  updateAnswer,
  setCandidateInterviewStatus,
  setCandidateScore,
} = candidateSlice.actions;
export default candidateSlice.reducer;
