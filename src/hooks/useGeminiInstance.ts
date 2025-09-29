import type { RootState } from "../store";
import type { AppState } from "../types";
import { useAppSelector } from "./useAppSelector";

const useGeminiInstance = () => {
  const { geminiInstance } = useAppSelector(
    (state: RootState) => state.app
  ) as AppState;
  return geminiInstance;
};

export { useGeminiInstance };
