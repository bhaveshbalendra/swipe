import { useGeminiApi } from "./useGeminiApi";
import { useGeminiInstance } from "./useGeminiInstance";

// Combined hook that provides all AI service functionality
export const useAIService = () => {
  const geminiApi = useGeminiApi();
  const geminiInstance = useGeminiInstance();

  // Extract loading states
  const isGeneratingQuestions = geminiApi.isLoadingQuestions;
  const isEvaluating = geminiApi.isEvaluating;
  const isGeneratingSummary = geminiApi.isGeneratingSummary;

  // Extract error states
  const hasError = !!(
    geminiApi.questionsError ||
    geminiApi.evaluationError ||
    geminiApi.summaryError
  );

  const getErrorMessage = () => {
    if (geminiApi.questionsError) return "Failed to generate questions";
    if (geminiApi.evaluationError) return "Failed to evaluate answer";
    if (geminiApi.summaryError) return "Failed to generate summary";
    return "An error occurred";
  };

  // Check if API key is configured
  const hasApiKey = !!(
    localStorage.getItem("gemini_api_key") ||
    (typeof window !== "undefined" &&
      (window as { env?: { VITE_GEMINI_API_KEY?: string } }).env
        ?.VITE_GEMINI_API_KEY)
  );

  return {
    // Gemini API methods
    ...geminiApi,

    // Gemini instance
    geminiInstance,

    // Loading states
    isGeneratingQuestions,
    isEvaluating,
    isGeneratingSummary,

    // Error states
    hasError,
    getErrorMessage,

    // Configuration
    hasApiKey,
  };
};
