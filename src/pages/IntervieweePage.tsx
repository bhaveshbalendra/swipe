import {
  CheckCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Modal, Steps, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AIStatus from "../components/AIStatus";
import APIConfig from "../components/APIConfig";
import ChatInterface from "../components/ChatInterface";
import MissingFieldsCollector from "../components/MissingFieldsCollector";
import ResumeUpload from "../components/ResumeUpload";
import { gemini } from "../config/envConfig";
import { useGeminiApi } from "../hooks/useGeminiApi";
import type { RootState } from "../store";
import { store } from "../store";
import { setCurrentCandidate } from "../store/slices/appSlice";
import {
  addAnswer,
  addCandidate,
  setCandidateInterviewStatus,
  setCandidateScore,
  updateCandidate,
} from "../store/slices/candidateSlice";
import {
  addChatMessage,
  endInterview,
  nextQuestion,
  pauseInterview,
  resumeInterview,
  startInterview,
  syncTimerOnResume,
  updateTimeRemaining,
} from "../store/slices/interviewSlice";
import type { Answer, Candidate, ChatMessage, ParsedResume } from "../types";

const { Title, Text } = Typography;

const IntervieweePage: React.FC = () => {
  const dispatch = useDispatch();
  const currentCandidate = useSelector(
    (state: RootState) => state.app.currentCandidate
  );

  // Also get the candidate from the candidates list to ensure we have the latest data
  const candidates = useSelector(
    (state: RootState) => state.candidates.candidates
  );
  const latestCandidate = currentCandidate
    ? candidates.find((c) => c.id === currentCandidate.id) || currentCandidate
    : null;
  const currentSession = useSelector(
    (state: RootState) => state.interview.currentSession
  );
  const questions = useSelector(
    (state: RootState) => state.interview.questions
  );
  const chatMessages = useSelector(
    (state: RootState) => state.interview.chatMessages
  );
  const timeRemaining = useSelector(
    (state: RootState) => state.interview.timeRemaining
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isEvaluatingLocal, setIsEvaluatingLocal] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [hasShownWelcomeBack, setHasShownWelcomeBack] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const handleAnswerSubmitRef = useRef<(answerText: string) => void>(() => {});
  const timerRef = useRef<number | null>(null);
  const [localTimeRemaining, setLocalTimeRemaining] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);

  const {
    questions: generatedQuestions,
    evaluateAnswer,
    generateSummary,
    isEvaluating,
    isLoadingQuestions,
    refetchQuestions,
  } = useGeminiApi(currentCandidate || undefined);

  // Debug: Monitor currentCandidate changes
  useEffect(() => {
    console.log("currentCandidate changed:", {
      id: currentCandidate?.id,
      score: currentCandidate?.score,
      status: currentCandidate?.status,
      hasInterviewData: !!currentCandidate?.interviewData,
      answersCount: currentCandidate?.interviewData?.answers?.length || 0,
    });
  }, [currentCandidate]);

  // Debug: Monitor latestCandidate changes
  useEffect(() => {
    console.log("latestCandidate changed:", {
      id: latestCandidate?.id,
      score: latestCandidate?.score,
      status: latestCandidate?.status,
      hasInterviewData: !!latestCandidate?.interviewData,
      answersCount: latestCandidate?.interviewData?.answers?.length || 0,
    });
  }, [latestCandidate]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - pause the interview only if not evaluating
        if (currentSession && currentSession.isActive && !isEvaluatingLocal) {
          dispatch(pauseInterview());
          setIsPageVisible(false);
        }
      } else {
        // Page is visible - resume the interview
        if (currentSession && currentSession.isActive) {
          dispatch(resumeInterview());
          dispatch(syncTimerOnResume());
          setIsPageVisible(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentSession, dispatch, isEvaluatingLocal]);

  // Handle beforeunload to pause interview when closing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession && currentSession.isActive) {
        dispatch(pauseInterview());
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentSession, dispatch]);

  useEffect(() => {
    // Check for existing session on component mount - only show if user is returning
    // Only show welcome back if there's an active session with actual progress (not just started)
    // Show welcome back if there's a paused question (user left during a question)
    if (
      currentSession &&
      currentSession.isActive &&
      !hasShownWelcomeBack &&
      currentSession.pausedQuestionId && // Only show if there's actually a paused question
      chatMessages.length > 0 // Make sure there are actual chat messages
    ) {
      setShowWelcomeBack(true);
      setHasShownWelcomeBack(true);
    }
  }, [currentSession, hasShownWelcomeBack, chatMessages.length]); // Include chatMessages.length in dependencies

  // Initialize local timer when session starts
  useEffect(() => {
    if (currentSession && currentSession.isActive && timeRemaining > 0) {
      console.log("Initializing timer with timeRemaining:", timeRemaining);
      setLocalTimeRemaining(timeRemaining);
    } else if (!currentSession || !currentSession.isActive) {
      setLocalTimeRemaining(0);
    }
  }, [currentSession, timeRemaining]);

  // Update local timer when timeRemaining changes (including when resuming)
  useEffect(() => {
    if (currentSession && currentSession.isActive && timeRemaining >= 0) {
      console.log("Updating local timer with timeRemaining:", timeRemaining);
      setLocalTimeRemaining(timeRemaining);
    }
  }, [timeRemaining, currentSession]);

  // Sync timer when resuming from pause
  useEffect(() => {
    if (currentSession && currentSession.isActive && isPageVisible) {
      dispatch(syncTimerOnResume());
    }
  }, [currentSession, isPageVisible, dispatch]);

  // Timer countdown using local state - only start when session starts and page is visible
  useEffect(() => {
    console.log(
      "Timer useEffect triggered - currentSession:",
      !!currentSession,
      "isActive:",
      currentSession?.isActive,
      "isPageVisible:",
      isPageVisible
    );

    if (currentSession && currentSession.isActive && isPageVisible) {
      console.log("Starting timer for session");

      // Clear any existing timer
      if (timerRef.current) {
        console.log("Clearing existing timer");
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setLocalTimeRemaining((prevTime) => {
          console.log("Timer tick - prevTime:", prevTime);
          const newTime = prevTime <= 1 ? 0 : prevTime - 1;

          // Update Redux store to keep it in sync
          dispatch(updateTimeRemaining(newTime));

          if (newTime === 0) {
            console.log("Timer reached 0, stopping");
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }

          return newTime;
        });
      }, 1000);

      console.log("Timer interval created:", timerRef.current);

      return () => {
        console.log("Clearing timer cleanup");
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      console.log("Session not active or page not visible - clearing timer");
      // Clear timer if session is not active or page is not visible
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Don't reset localTimeRemaining to 0 if page is just hidden
      if (!currentSession || !currentSession.isActive) {
        setLocalTimeRemaining(0);
      }
    }
  }, [currentSession, dispatch, isPageVisible]);

  // Separate effect for handling time's up
  useEffect(() => {
    console.log(
      "Time's up effect - localTimeRemaining:",
      localTimeRemaining,
      "currentSession:",
      !!currentSession,
      "isEvaluatingLocal:",
      isEvaluatingLocal
    );
    if (
      currentSession &&
      currentSession.isActive &&
      localTimeRemaining === 0 &&
      !isEvaluatingLocal // Don't auto-submit if already evaluating
    ) {
      // Time's up - auto-submit empty answer
      console.log("Time's up! Auto-submitting answer");
      handleAnswerSubmitRef.current?.("");
    }
  }, [localTimeRemaining, currentSession, isEvaluatingLocal]);

  const handleResumeParsed = (parsed: ParsedResume) => {
    console.log("Resume parsed successfully:", parsed);
    setParsedResume(parsed);
    const missing: string[] = [];

    if (!parsed.name) missing.push("name");
    if (!parsed.email) missing.push("email");
    if (!parsed.phone) missing.push("phone");

    console.log("Missing fields:", missing);
    setMissingFields(missing);

    if (missing.length === 0) {
      console.log("All fields present, creating candidate...");
      createCandidate(parsed);
      setCurrentStep(2);
    } else {
      console.log("Missing fields detected, showing form...");
      setCurrentStep(1);
    }
  };

  const createCandidate = (parsed: ParsedResume) => {
    const candidate: Candidate = {
      id: Date.now().toString(),
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
      resumeText: parsed.text || "",
      score: 0,
      status: "pending",
      createdAt: new Date().toISOString(),
      resumeUrl: "",
      interviewStatus: "not_started",
      questions: [],
      answers: [],
      startTime: new Date().toISOString(),
      interviewData: {
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        startTime: new Date().toISOString(),
        totalScore: 0,
      },
    };

    console.log("Creating candidate:", candidate);
    dispatch(addCandidate(candidate));
    dispatch(setCurrentCandidate(candidate));
    console.log("Candidate created and set as current:", candidate);

    // Debug: Check if candidate was added to store
    setTimeout(() => {
      const currentState = store.getState();
      console.log(
        "Store state after adding candidate:",
        currentState.candidates
      );
    }, 100);
  };

  const handleMissingFieldsComplete = async (data: {
    name: string;
    email: string;
    phone: string;
  }) => {
    if (parsedResume) {
      const completeData = {
        ...parsedResume,
        name: data.name,
        email: data.email,
        phone: data.phone,
      };
      createCandidate(completeData);
      setCurrentStep(2);
    }
  };

  const startInterviewProcess = async () => {
    console.log("Starting interview process...");
    console.log("Current candidate:", currentCandidate);

    if (!currentCandidate) {
      console.error("No current candidate found!");
      return;
    }

    try {
      // Check if API key is configured from multiple sources (prioritize config)
      const apiKey =
        gemini.GEMINI_API_KEY ||
        localStorage.getItem("gemini_api_key") ||
        (typeof window !== "undefined" &&
          (window as { env?: { VITE_GEMINI_API_KEY?: string } }).env
            ?.VITE_GEMINI_API_KEY);

      console.log("API key found:", !!apiKey);
      console.log(
        "Using API key from:",
        gemini.GEMINI_API_KEY
          ? "config"
          : localStorage.getItem("gemini_api_key")
          ? "localStorage"
          : "window.env"
      );

      if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey === "") {
        console.log("No valid API key found, using fallback questions");
        // Don't show API config modal, just use fallback questions
      }

      let questionsToUse = generatedQuestions || [];
      console.log("Initial questions available:", questionsToUse.length);

      // If no questions are available, try to generate them
      if (questionsToUse.length === 0) {
        console.log("No questions available, attempting to generate...");
        try {
          const result = await refetchQuestions();
          questionsToUse = result.data || [];
          console.log("Generated questions:", questionsToUse.length);
        } catch (error) {
          console.error("Failed to generate questions:", error);
          setShowApiConfig(true);
          return;
        }
      }

      // If still no questions after retry, show error - no fallback questions
      if (questionsToUse.length === 0) {
        console.error("Failed to generate personalized questions from resume");
        alert(
          "Unable to generate questions from your resume. Please ensure your resume contains sufficient technical information."
        );
        return;
      }

      console.log(
        "Starting interview with",
        questionsToUse.length,
        "questions"
      );

      console.log(
        "Dispatching startInterview with questions:",
        questionsToUse.length
      );
      dispatch(
        startInterview({
          candidateId: currentCandidate.id,
          questions: questionsToUse,
        })
      );

      // Debug: Check if session was created
      setTimeout(() => {
        const currentState = store.getState();
        console.log(
          "Session after startInterview:",
          currentState.interview.currentSession
        );
        console.log(
          "Session isActive:",
          currentState.interview.currentSession?.isActive
        );
      }, 100);

      dispatch(
        setCandidateInterviewStatus({
          id: currentCandidate.id,
          status: "in-progress",
        })
      );

      // Update candidate's interviewData with questions
      dispatch(
        updateCandidate({
          id: currentCandidate.id,
          updates: {
            interviewData: {
              questions: questionsToUse,
              answers: [],
              currentQuestionIndex: 0,
              startTime: new Date().toISOString(),
              totalScore: 0,
            },
          },
        })
      );

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: `Hello ${currentCandidate.name}! Welcome to your technical interview. We'll be asking you 6 questions covering different aspects of full-stack development. Let's begin!`,
        timestamp: new Date().toISOString(),
        isUser: false,
      };
      dispatch(addChatMessage(welcomeMessage));

      // Add first question
      const firstQuestion = questionsToUse[0];
      const firstQuestionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Question 1/6\n\nCategory: ${
          firstQuestion.category
        }\nDifficulty: ${firstQuestion.difficulty.toUpperCase()}\nTime Limit: ${
          firstQuestion.timeLimit
        } seconds\n\n${firstQuestion.text}`,
        timestamp: new Date().toISOString(),
        questionId: firstQuestion.id,
        isUser: false,
      };
      dispatch(addChatMessage(firstQuestionMessage));

      // Initialize timer for first question
      const firstQuestionTimeLimit = firstQuestion.timeLimit;
      setLocalTimeRemaining(firstQuestionTimeLimit);
      dispatch(updateTimeRemaining(firstQuestionTimeLimit));
      console.log(
        "Timer initialized for first question:",
        firstQuestionTimeLimit
      );

      // Reset welcome back state for new interview
      setHasShownWelcomeBack(false);
      setShowWelcomeBack(false);

      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to start interview:", error);
    }
  };

  const handleAnswerSubmit = async (answerText: string) => {
    if (!currentSession || !currentCandidate) return;

    // Check if answer is empty or timeout BEFORE stopping the timer
    const isEmptyAnswer = !answerText || answerText.trim() === "";
    const isTimeout = localTimeRemaining === 0;

    // Stop the timer immediately when answer is submitted
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLocalTimeRemaining(0);
    dispatch(updateTimeRemaining(0));

    setIsEvaluatingLocal(true);

    try {
      const currentQuestion = questions[currentSession.currentQuestionIndex];
      let evaluation;

      if (isEmptyAnswer) {
        // Give zero score for empty/timeout answers
        evaluation = {
          score: 0,
          feedback: isTimeout
            ? "Time's up! No answer provided within the time limit. Score: 0/100"
            : "No answer provided. Score: 0/100",
        };
        console.log(
          "Empty answer detected - giving zero score",
          isTimeout ? "(timeout)" : "(empty)"
        );
      } else {
        // Normal AI evaluation for provided answers
        evaluation = await evaluateAnswer({
          question: currentQuestion,
          answer: answerText,
        }).unwrap();
      }

      const answer: Answer = {
        questionId: currentQuestion.id,
        text: answerText || "[No answer provided]",
        score: evaluation.score,
        feedback: evaluation.feedback,
        timestamp: new Date().toISOString(),
        timeSpent: currentQuestion.timeLimit - localTimeRemaining,
        submittedAt: new Date().toISOString(),
      };

      console.log(
        "Adding answer to candidate:",
        currentCandidate.id,
        "Answer:",
        answer
      );
      dispatch(addAnswer({ candidateId: currentCandidate.id, answer }));

      // Debug: Check candidate state after adding answer
      setTimeout(() => {
        const currentState = store.getState();
        const updatedCandidate = currentState.candidates.candidates.find(
          (c) => c.id === currentCandidate.id
        );
        console.log("Candidate after adding answer:", updatedCandidate);
        console.log("Interview data:", updatedCandidate?.interviewData);
        console.log(
          "Answers count:",
          updatedCandidate?.interviewData?.answers?.length || 0
        );
      }, 100);

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: answerText,
        timestamp: new Date().toISOString(),
        questionId: currentQuestion.id,
        isUser: true,
      };
      dispatch(addChatMessage(userMessage));

      // Add AI feedback (using API response directly)
      const feedbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Score: ${evaluation.score}/100 - ${evaluation.feedback}`,
        timestamp: new Date().toISOString(),
        questionId: currentQuestion.id,
        isUser: false,
      };
      dispatch(addChatMessage(feedbackMessage));

      // Add a small delay to let user see their answer and feedback
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Move to next question or finish (exactly 6 questions: 0-5)
      if (currentSession.currentQuestionIndex < 5) {
        // Get the next question data BEFORE dispatching nextQuestion
        const nextQuestionIndex = currentSession.currentQuestionIndex + 1;
        const nextQuestionData = questions[nextQuestionIndex];

        dispatch(nextQuestion());

        const nextMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: `Question ${nextQuestionIndex + 1}/6\n\nCategory: ${
            nextQuestionData.category
          }\nDifficulty: ${nextQuestionData.difficulty.toUpperCase()}\nTime Limit: ${
            nextQuestionData.timeLimit
          } seconds\n\n${nextQuestionData.text}`,
          timestamp: new Date().toISOString(),
          questionId: nextQuestionData.id,
          isUser: false,
        };
        dispatch(addChatMessage(nextMessage));

        // Don't start timer yet - it will start when the evaluation is complete
        // Timer will be started in the finally block after evaluation
      } else {
        // Interview completed (6th question answered)
        console.log("Interview completed - all 6 questions answered");
        await completeInterview();
      }
    } catch (error) {
      console.error("Failed to evaluate answer:", error);
    } finally {
      setIsEvaluatingLocal(false);

      // Start timer for next question only after evaluation is complete
      if (currentSession && currentSession.currentQuestionIndex < 5) {
        const currentQuestionIndex = currentSession.currentQuestionIndex;
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion) {
          const nextQuestionTimeLimit = currentQuestion.timeLimit;
          setLocalTimeRemaining(nextQuestionTimeLimit);
          dispatch(updateTimeRemaining(nextQuestionTimeLimit));
          console.log(
            "Timer started for current question after evaluation:",
            nextQuestionTimeLimit
          );
        }
      }
    }
  };

  // Update ref
  handleAnswerSubmitRef.current = handleAnswerSubmit;

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const completeInterview = async () => {
    if (!currentCandidate) return;

    try {
      // Get the updated candidate from the store to ensure we have the latest answers
      const currentState = store.getState();
      const updatedCandidate = currentState.candidates.candidates.find(
        (c) => c.id === currentCandidate.id
      );

      if (!updatedCandidate) {
        console.error("Candidate not found in store");
        return;
      }

      console.log("Completing interview for candidate:", updatedCandidate.id);
      console.log(
        "Answers to summarize:",
        updatedCandidate.interviewData?.answers
      );

      const summary = await generateSummary({
        candidate: updatedCandidate,
        answers: updatedCandidate.interviewData?.answers || [],
      }).unwrap();

      console.log("Generated summary:", summary);

      // Calculate fallback score if AI summary fails or returns 0
      let finalScore = summary.score;
      let finalSummary = summary.summary;

      // Always calculate average from individual answers as the primary method
      const answers = updatedCandidate.interviewData?.answers || [];
      console.log("Answers found:", answers.length);
      console.log("Answers data:", answers);

      if (answers.length > 0) {
        const totalScore = answers.reduce(
          (sum, answer) => sum + (answer.score || 0),
          0
        );
        const averageScore = Math.round(totalScore / answers.length);

        console.log("Total score from answers:", totalScore);
        console.log("Average score:", averageScore);
        console.log("AI summary score:", summary.score);

        // Use AI summary score only if it's higher than the average, otherwise use average
        if (summary.score && summary.score > averageScore) {
          finalScore = summary.score;
          finalSummary = summary.summary;
          console.log("Using AI summary score:", finalScore);
        } else {
          finalScore = averageScore;
          finalSummary = `Interview completed with ${answers.length} questions answered. Average score: ${finalScore}/100`;
          console.log("Using calculated average score:", finalScore);
        }
      } else {
        finalScore = 0;
        finalSummary = "No answers provided during the interview.";
        console.log("No answers found, setting score to 0");
      }

      // Update candidate score and summary
      dispatch(
        setCandidateScore({
          id: updatedCandidate.id,
          score: finalScore,
          summary: finalSummary,
        })
      );

      // Set end time for the interview
      const endTime = new Date().toISOString();

      // Update candidate status to completed
      dispatch(
        setCandidateInterviewStatus({
          id: updatedCandidate.id,
          status: "completed",
        })
      );

      const completionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: `Interview completed! Your final score is ${finalScore}/100. Thank you for participating!`,
        timestamp: endTime,
        isUser: false,
      };
      dispatch(addChatMessage(completionMessage));

      // Clear timer and end the interview session
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setLocalTimeRemaining(0);
      dispatch(endInterview());

      // Update the current candidate with final data
      const finalCandidate: Candidate = {
        ...updatedCandidate,
        score: finalScore,
        summary: finalSummary,
        status: "completed" as const,
        interviewData: updatedCandidate.interviewData
          ? {
              ...updatedCandidate.interviewData,
              endTime,
              totalScore: finalScore,
            }
          : undefined,
      };
      dispatch(setCurrentCandidate(finalCandidate));

      console.log("Interview completed successfully:", {
        candidateId: updatedCandidate.id,
        finalScore: finalScore,
        status: "completed",
      });

      // Debug: Check store state after completion
      setTimeout(() => {
        const currentState = store.getState();
        console.log(
          "Store state after interview completion:",
          currentState.candidates
        );
        console.log(
          "Completed candidates:",
          currentState.candidates.candidates.filter(
            (c) => c.status === "completed"
          )
        );
      }, 100);

      setCurrentStep(4);
    } catch (error) {
      console.error("Failed to complete interview:", error);

      // Get the updated candidate from the store for fallback
      const currentState = store.getState();
      const fallbackCandidate = currentState.candidates.candidates.find(
        (c) => c.id === currentCandidate.id
      );

      if (!fallbackCandidate) {
        console.error("Candidate not found in store for fallback");
        return;
      }

      // Fallback: calculate score from individual answers
      const answers = fallbackCandidate.interviewData?.answers || [];
      let fallbackScore = 0;
      let fallbackSummary =
        "Interview completed but summary generation failed.";

      if (answers.length > 0) {
        const totalScore = answers.reduce(
          (sum: number, answer: Answer) => sum + (answer.score || 0),
          0
        );
        fallbackScore = Math.round(totalScore / answers.length);
        fallbackSummary = `Interview completed with ${answers.length} questions answered. Average score: ${fallbackScore}/100`;
      }

      // Update candidate with fallback data
      dispatch(
        setCandidateScore({
          id: fallbackCandidate.id,
          score: fallbackScore,
          summary: fallbackSummary,
        })
      );
    }
  };

  const handleResumeInterview = () => {
    setShowWelcomeBack(false);
    setCurrentStep(3);
    // Resume the interview and sync the timer
    if (currentSession && currentSession.isActive) {
      dispatch(resumeInterview());
      dispatch(syncTimerOnResume());
      setIsPageVisible(true);
    }
  };

  const handleStartOver = () => {
    // Clear timer and reset state
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLocalTimeRemaining(0);
    dispatch(endInterview());
    setCurrentStep(0);
    setShowWelcomeBack(false);
    setHasShownWelcomeBack(false); // Reset welcome back flag
  };

  const getCurrentQuestion = () => {
    if (!currentSession || !questions.length) return null;
    return questions[currentSession.currentQuestionIndex];
  };

  const handleApiConfigComplete = () => {
    setShowApiConfig(false);
    startInterviewProcess();
  };

  const steps = [
    {
      title: "Upload Resume",
      icon: <FileTextOutlined />,
      description: "Upload your resume to get started",
    },
    {
      title: "Complete Profile",
      icon: <UserOutlined />,
      description: "Fill in missing information",
    },
    {
      title: "Start Interview",
      icon: <MessageOutlined />,
      description: "Begin your technical interview",
    },
    {
      title: "Interview Complete",
      icon: <CheckCircleOutlined />,
      description: "View your results",
    },
  ];

  return (
    <div
      className="interviewee-page"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Title
          level={2}
          style={{
            textAlign: "center",
            marginBottom: "16px",
            fontSize: "24px",
          }}
        >
          Technical Interview
        </Title>

        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: "16px", flexShrink: 0 }}
        />

        <AIStatus />

        {currentStep === 0 && (
          <ResumeUpload
            onResumeParsed={handleResumeParsed}
            onError={(error) => console.error("Resume parsing error:", error)}
          />
        )}

        {currentStep === 1 && (
          <MissingFieldsCollector
            missingFields={missingFields}
            onComplete={handleMissingFieldsComplete}
          />
        )}

        {currentStep === 2 && (
          <Card
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Title level={3}>Ready to Start?</Title>
              <Text>
                We have all the information we need. Click below to begin your
                technical interview.
              </Text>

              {isLoadingQuestions && (
                <div style={{ marginTop: "12px", color: "#1890ff" }}>
                  <Text>Generating interview questions...</Text>
                </div>
              )}

              <div style={{ marginTop: "16px" }}>
                <button
                  onClick={startInterviewProcess}
                  disabled={isLoadingQuestions}
                  style={{
                    padding: "12px 24px",
                    fontSize: "16px",
                    backgroundColor: isLoadingQuestions ? "#d9d9d9" : "#1890ff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isLoadingQuestions ? "not-allowed" : "pointer",
                    opacity: isLoadingQuestions ? 0.6 : 1,
                  }}
                >
                  {isLoadingQuestions
                    ? "Generating Questions..."
                    : "Start Interview"}
                </button>
              </div>
            </div>
          </Card>
        )}

        {currentStep === 3 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <ChatInterface
              currentQuestion={getCurrentQuestion() || undefined}
              timeRemaining={localTimeRemaining}
              onAnswerSubmit={handleAnswerSubmit}
              messages={chatMessages}
              isEvaluating={isEvaluatingLocal || isEvaluating}
            />
          </div>
        )}

        {currentStep === 4 && latestCandidate && (
          <Card
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                maxWidth: "600px",
              }}
            >
              <Title level={3}>Interview Complete!</Title>
              <div style={{ marginBottom: "16px" }}>
                <Text style={{ fontSize: "18px", fontWeight: "bold" }}>
                  Your final score: {latestCandidate.score || 0}/100
                </Text>
                {/* Debug info */}
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}
                >
                  Debug: Score={latestCandidate.score}, Status=
                  {latestCandidate.status}
                </div>
              </div>

              <div style={{ marginTop: "16px", textAlign: "left" }}>
                <Title level={4}>Summary:</Title>
                <Text>{latestCandidate.summary || "No summary available"}</Text>
              </div>

              <div style={{ marginTop: "20px" }}>
                <button
                  onClick={() => {
                    // Redirect to interviewer page
                    window.location.href = "/interviewer";
                  }}
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    backgroundColor: "#1890ff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginRight: "8px",
                  }}
                >
                  View Details
                </button>

                <button
                  onClick={handleStartOver}
                  style={{
                    padding: "10px 20px",
                    fontSize: "14px",
                    backgroundColor: "#52c41a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Start New Interview
                </button>
              </div>
            </div>
          </Card>
        )}

        <Modal
          title="Welcome Back!"
          open={showWelcomeBack}
          onOk={handleResumeInterview}
          onCancel={handleStartOver}
          okText="Resume Interview"
          cancelText="Start Over"
        >
          <div>
            <p>
              You have an interview in progress. Would you like to resume where
              you left off?
            </p>
            {currentSession && currentSession.pausedQuestionId && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                }}
              >
                <Text strong>Resume from:</Text>
                <div style={{ marginTop: "8px" }}>
                  <Text>
                    <strong>
                      Question {currentSession.currentQuestionIndex + 1}/6
                    </strong>
                  </Text>
                  <br />
                  <Text type="secondary">
                    {questions[currentSession.currentQuestionIndex]?.category} -{" "}
                    {questions[
                      currentSession.currentQuestionIndex
                    ]?.difficulty.toUpperCase()}
                  </Text>
                  <br />
                  <Text
                    style={{
                      fontSize: "14px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    {questions[currentSession.currentQuestionIndex]?.text}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Modal>

        <Modal
          title="Configure AI Service"
          open={showApiConfig}
          onCancel={() => setShowApiConfig(false)}
          footer={null}
          width={600}
        >
          <APIConfig onConfigComplete={handleApiConfigComplete} />
        </Modal>
      </div>
    </div>
  );
};

export default IntervieweePage;
