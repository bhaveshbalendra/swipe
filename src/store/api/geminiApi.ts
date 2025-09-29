import { GoogleGenAI } from "@google/genai";
import { createApi } from "@reduxjs/toolkit/query/react";
import { gemini } from "../../config/envConfig";
import { type Answer, type Candidate, type Question } from "../../types";
import { logger } from "../../utils/logger";

// Custom base query that handles Gemini API calls with centralized error handling
const geminiBaseQuery = async (arg: { prompt: string }) => {
  const geminiInstance = new GoogleGenAI({ apiKey: gemini.GEMINI_API_KEY });
  try {
    logger.debug(
      "Making Gemini API request with prompt:",
      arg.prompt.substring(0, 100) + "..."
    );

    const result = await geminiInstance.models.generateContent({
      model: gemini.GEMINI_MODEL,
      contents: arg.prompt,
    });

    const response = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    logger.debug("Gemini API response received successfully");
    return { data: response };
  } catch (error) {
    // Enhanced error handling
    logger.error("Gemini API error occurred:", error);
    let errorStatus = "FETCH_ERROR";
    let errorMessage = String(error);
    let errorCode: string | undefined;

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorStatus = "CUSTOM_ERROR";
        errorMessage = "Google Gemini API key not configured or invalid";
        errorCode = "API_KEY_ERROR";
      } else if (error.message.includes("quota")) {
        errorStatus = "CUSTOM_ERROR";
        errorMessage = "API quota exceeded. Please try again later";
        errorCode = "QUOTA_EXCEEDED";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorStatus = "FETCH_ERROR";
        errorMessage = "Network error. Please check your connection";
        errorCode = "NETWORK_ERROR";
      } else if (error.message.includes("timeout")) {
        errorStatus = "TIMEOUT_ERROR";
        errorMessage = "Request timed out. Please try again";
        errorCode = "TIMEOUT_ERROR";
      }
    }

    return {
      error: {
        status: errorStatus,
        error: errorMessage,
        data: { message: errorMessage, code: errorCode },
      },
    };
  }
};

export const geminiApi = createApi({
  reducerPath: "geminiApi",
  baseQuery: geminiBaseQuery,
  tagTypes: ["Questions", "Evaluation", "Summary"],
  endpoints: (builder) => ({
    generateQuestions: builder.query<Question[], { candidate: Candidate }>({
      queryFn: async ({ candidate }) => {
        const result = await geminiBaseQuery({
          prompt: `
          Generate 6 technical interview questions EXCLUSIVELY based on the candidate's resume, skills, experience, and projects.
          
          CANDIDATE PROFILE:
          - Name: ${candidate.name}
          - Resume: ${candidate.resumeText}
          - Skills/Experience: Extract from resume
          - Projects: Extract from resume
          
          CRITICAL REQUIREMENTS:
          - Generate questions ONLY from their resume content and mentioned technologies
          - Questions MUST be based on their ACTUAL skills, experience, and projects
          - Do NOT use generic questions - everything must be personalized
          - Do NOT overcomplicate questions - keep them appropriate for the time limit
          - Match question complexity to their experience level
          - NEVER ask about technologies they haven't mentioned in their resume
          
          QUESTION DISTRIBUTION:
          - 2 Easy questions (20 seconds each) - Basic concepts from their resume technologies
          - 2 Medium questions (60 seconds each) - Practical implementation based on their projects
          - 2 Hard questions (120 seconds each) - Advanced topics relevant to their experience
          
          MANDATORY GUIDELINES:
          - Base questions ONLY on their resume content and mentioned technologies
          - Keep questions focused and not overly complex for the time limit
          - Ensure questions are answerable within the given time constraints
          - Focus ONLY on technologies and concepts they've actually worked with
          - Extract specific technologies, frameworks, and tools from their resume
          - Create questions about their specific projects and experiences
          - Avoid any generic or theoretical questions
          - If resume is insufficient, return an error message asking for more details
          - NEVER use default or generic questions
          - Every question MUST be personalized to their experience
          
          Return the questions in this JSON format:
          [
            {
              "id": "1",
              "text": "Question text here",
              "difficulty": "easy|medium|hard",
              "timeLimit": 20|60|120,
              "category": "Category name"
            }
          ]
        `,
        });

        if (result.error) {
          return { error: result.error };
        }

        const response = result.data;
        try {
          logger.debug(
            "Transforming questions response, length:",
            response.length
          );
          // Extract JSON from the response
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]) as Question[];
            logger.debug("Successfully parsed questions:", questions.length);
            return {
              data: questions.map((q: Question, index: number) => ({
                ...q,
                id: (index + 1).toString(),
              })),
            };
          }

          // Check if response indicates insufficient resume content
          if (
            response.toLowerCase().includes("insufficient") ||
            response.toLowerCase().includes("not enough") ||
            response.toLowerCase().includes("more details") ||
            response.toLowerCase().includes("resume is too short")
          ) {
            logger.error("Resume content insufficient for question generation");
            return {
              error: {
                status: "CUSTOM_ERROR",
                error:
                  "Resume content is insufficient to generate personalized questions. Please ensure your resume contains detailed technical skills, experience, and projects.",
                data: {
                  message: "INSUFFICIENT_RESUME",
                  code: "INSUFFICIENT_RESUME",
                },
              },
            };
          }

          // If parsing fails, return error instead of fallback
          logger.error("Failed to extract JSON from questions response");
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                "Failed to generate personalized questions from resume. Please try again or ensure your resume contains sufficient technical information.",
              data: { message: "PARSE_ERROR", code: "PARSE_ERROR" },
            },
          };
        } catch (error) {
          logger.error("Error parsing questions:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error:
                "Failed to generate personalized questions from resume. Please ensure your resume contains sufficient technical information.",
              data: { message: "PARSE_ERROR", code: "PARSE_ERROR" },
            },
          };
        }
      },
      providesTags: ["Questions"],
    }),

    evaluateAnswer: builder.mutation<
      { score: number; feedback: string },
      { question: Question; answer: string }
    >({
      queryFn: async ({
        question,
        answer,
      }: {
        question: Question;
        answer: string;
      }) => {
        const result = await geminiBaseQuery({
          prompt: `
          Evaluate this technical interview answer and provide a score and ONE-LINE feedback only.
          
          Question: ${question.text}
          Difficulty: ${question.difficulty}
          Category: ${question.category}
          Time Limit: ${question.timeLimit} seconds
          
          Candidate's Answer: ${answer}
          
          Please provide:
          1. A score from 0-100 based on:
             - Technical accuracy
             - Completeness of answer
             - Understanding of concepts
             - Practical knowledge
             - Communication clarity
          
          2. ONE-LINE feedback only (maximum 20 words):
             - Brief assessment of the answer
             - No detailed explanations
             - No suggestions for improvement
             - Just a simple, concise comment
          
          Return your response in this JSON format:
          {
            "score": 85,
            "feedback": "Brief one-line assessment here..."
          }
        `,
        });

        if (result.error) {
          return { error: result.error };
        }

        const response = result.data;
        try {
          logger.debug(
            "Transforming evaluation response, length:",
            response.length
          );
          // Extract JSON from the response
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const evaluation = JSON.parse(jsonMatch[0]);
            logger.debug(
              "Successfully parsed evaluation with score:",
              evaluation.score
            );
            return {
              data: {
                score: Math.max(0, Math.min(100, evaluation.score || 0)),
                feedback: evaluation.feedback || "No feedback provided.",
              },
            };
          }

          // Fallback evaluation
          logger.warn(
            "Failed to extract JSON from evaluation response, using fallback"
          );
          return { data: getFallbackEvaluation() };
        } catch (error) {
          logger.error("Error parsing evaluation:", error);
          return { data: getFallbackEvaluation() };
        }
      },
      invalidatesTags: ["Evaluation"],
    }),

    generateSummary: builder.mutation<
      { score: number; summary: string },
      { candidate: Candidate; answers: Answer[] }
    >({
      queryFn: async ({
        candidate,
        answers,
      }: {
        candidate: Candidate;
        answers: Answer[];
      }) => {
        const totalScore = answers.reduce(
          (sum: number, answer: Answer) => sum + (answer.score || 0),
          0
        );
        const averageScore = Math.round(totalScore / answers.length);

        const result = await geminiBaseQuery({
          prompt: `
            Generate a comprehensive interview summary for this candidate.
            
            Candidate: ${candidate.name}
            Email: ${candidate.email}
            Phone: ${candidate.phone}
            
            Interview Results:
            ${answers
              .map(
                (answer: Answer, index: number) => `
            Question ${index + 1}: ${answer.questionId}
            Score: ${answer.score}/100
            Feedback: ${answer.feedback}
            `
              )
              .join("\n")}
            
            Average Score: ${averageScore}/100
            
            Please provide:
            1. Overall assessment of technical skills
            2. Strengths demonstrated
            3. Areas for improvement
            4. Recommendation for hiring
            5. Specific technical competencies observed
            
            Make it professional and detailed, suitable for hiring decisions.
          `,
        });

        if (result.error) {
          return { error: result.error };
        }

        const response = result.data;
        logger.debug("Transforming summary response, length:", response.length);
        logger.debug("Generated summary with average score:", averageScore);

        return { data: { score: averageScore, summary: response } };
      },
      invalidatesTags: ["Summary"],
    }),
  }),
});

// No fallback questions - all questions must be generated from resume

const getFallbackEvaluation = () => ({
  score: 75,
  feedback:
    "Good answer! Consider providing more specific examples and technical details.",
});

export const {
  useGenerateQuestionsQuery,
  useEvaluateAnswerMutation,
  useGenerateSummaryMutation,
} = geminiApi;
