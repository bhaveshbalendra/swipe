import { z } from "zod";

// Candidate validation schemas
export const candidateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters"),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[\d\s\-+()]+$/, "Phone number contains invalid characters"),
});

export const resumeUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Only PDF and DOCX files are allowed"
    ),
});

// Question validation schemas
export const questionSchema = z.object({
  text: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters"),

  difficulty: z.enum(["easy", "medium", "hard"]),

  timeLimit: z
    .number()
    .min(10, "Time limit must be at least 10 seconds")
    .max(300, "Time limit must be less than 5 minutes"),

  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be less than 50 characters"),
});

// Answer validation schemas
export const answerSchema = z.object({
  text: z
    .string()
    .min(1, "Answer cannot be empty")
    .max(2000, "Answer must be less than 2000 characters"),

  timeSpent: z
    .number()
    .min(0, "Time spent cannot be negative")
    .max(300, "Time spent cannot exceed 5 minutes"),
});

// API Key validation
export const apiKeySchema = z.object({
  apiKey: z
    .string()
    .min(20, "API key must be at least 20 characters")
    .max(200, "API key must be less than 200 characters")
    .regex(/^[a-zA-Z0-9\-_]+$/, "API key contains invalid characters"),
});

// Interview session validation
export const interviewSessionSchema = z.object({
  candidateId: z.string().uuid("Invalid candidate ID"),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

// Chat message validation
export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message must be less than 1000 characters"),

  type: z.enum(["user", "ai", "system"]),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File cannot be empty")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "File size must be less than 10MB"
    ),
});

// Resume parsing validation
export const parsedResumeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  text: z.string().min(10, "Resume text must be at least 10 characters"),
});

// Error validation
export const errorInfoSchema = z.object({
  message: z.string().min(1, "Error message cannot be empty"),
  code: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  context: z.string().min(1, "Error context cannot be empty"),
});

// Form validation helpers
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ["Validation failed"] } };
  }
};

// Safe parsing with error handling
export const safeParse = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  error?: string;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e: z.ZodIssue) => e.message).join(", "),
      };
    }
    return { success: false, error: "Validation failed" };
  }
};

// Type exports for use in components
export type CandidateFormData = z.infer<typeof candidateSchema>;
export type ResumeUploadData = z.infer<typeof resumeUploadSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type AnswerFormData = z.infer<typeof answerSchema>;
export type ApiKeyFormData = z.infer<typeof apiKeySchema>;
export type InterviewSessionData = z.infer<typeof interviewSessionSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type FileUploadData = z.infer<typeof fileUploadSchema>;
export type ParsedResumeData = z.infer<typeof parsedResumeSchema>;
export type ErrorInfoData = z.infer<typeof errorInfoSchema>;
