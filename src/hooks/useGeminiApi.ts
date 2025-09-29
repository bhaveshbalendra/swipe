import {
  useEvaluateAnswerMutation,
  useGenerateQuestionsQuery,
  useGenerateSummaryMutation,
} from "../store/api/geminiApi";
import type { Candidate } from "../types";

// Custom hook for easy access to Gemini API functionality
export const useGeminiApi = (candidate?: Candidate) => {
  // Generate interview questions
  const {
    data: questions,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: refetchQuestions,
  } = useGenerateQuestionsQuery(
    candidate ? { candidate } : (undefined as never),
    {
      skip: !candidate, // Skip the query if no candidate is provided
    }
  );

  // Evaluate candidate answers
  const [evaluateAnswer, { isLoading: isEvaluating, error: evaluationError }] =
    useEvaluateAnswerMutation();

  // Generate interview summary
  const [
    generateSummary,
    { isLoading: isGeneratingSummary, error: summaryError },
  ] = useGenerateSummaryMutation();

  return {
    // Questions
    questions,
    isLoadingQuestions,
    questionsError,
    refetchQuestions,

    // Answer Evaluation
    evaluateAnswer,
    isEvaluating,
    evaluationError,

    // Summary Generation
    generateSummary,
    isGeneratingSummary,
    summaryError,
  };
};

// Example usage in a component:
/*
import { useGeminiApi } from '../hooks/useGeminiApi';

const InterviewComponent = () => {
  const { 
    questions, 
    isLoadingQuestions, 
    evaluateAnswer, 
    generateSummary 
  } = useGeminiApi();

  const handleEvaluateAnswer = async (question: Question, answer: string) => {
    try {
      const result = await evaluateAnswer({ question, answer }).unwrap();
      console.log('Score:', result.score);
      console.log('Feedback:', result.feedback);
    } catch (error) {
      console.error('Evaluation failed:', error);
    }
  };

  const handleGenerateSummary = async (candidate: Candidate, answers: Answer[]) => {
    try {
      const result = await generateSummary({ candidate, answers }).unwrap();
      console.log('Summary Score:', result.score);
      console.log('Summary:', result.summary);
    } catch (error) {
      console.error('Summary generation failed:', error);
    }
  };

  return (
    <div>
      {isLoadingQuestions ? (
        <div>Loading questions...</div>
      ) : (
        <div>
          {questions?.map((question) => (
            <div key={question.id}>
              <h3>{question.text}</h3>
              <p>Difficulty: {question.difficulty}</p>
              <p>Time Limit: {question.timeLimit}s</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
*/
