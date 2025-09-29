import { GoogleGenAI } from "@google/genai";
import { gemini } from "../config/envConfig";
import { type AiModel } from "../interfaces/aiModel";
import { type ParsedResume } from "../types";
import { logger } from "./logger";

class ResumeParser implements AiModel {
  private genAI: GoogleGenAI | null = null;
  private isEnabled = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Check for API key in multiple sources
      const apiKey =
        gemini.GEMINI_API_KEY ||
        localStorage.getItem("gemini_api_key") ||
        (typeof window !== "undefined" &&
          (window as { env?: { VITE_GEMINI_API_KEY?: string } }).env
            ?.VITE_GEMINI_API_KEY);

      console.log("ResumeParser initialization - API key found:", !!apiKey);
      console.log(
        "ResumeParser initialization - API key value:",
        apiKey ? "***" + apiKey.slice(-4) : "none"
      );

      if (apiKey && apiKey !== "your_gemini_api_key_here" && apiKey !== "") {
        this.genAI = new GoogleGenAI({ apiKey });
        this.isEnabled = true;
        logger.info("ResumeParser initialized with API key", "resume-parser");
        console.log("ResumeParser successfully initialized");
      } else {
        logger.warn("No valid API key found for ResumeParser", "resume-parser");
        this.isEnabled = false;
        console.log("ResumeParser initialization failed - no valid API key");
      }
    } catch (error) {
      logger.error("Failed to initialize ResumeParser:", error);
      this.isEnabled = false;
      console.error("ResumeParser initialization error:", error);
    }
  }

  public updateApiKey(apiKey: string) {
    try {
      this.genAI = new GoogleGenAI({ apiKey });
      this.isEnabled = true;
      logger.info("ResumeParser API key updated", "resume-parser");
    } catch (error) {
      logger.error("Failed to update ResumeParser API key:", error);
      this.isEnabled = false;
    }
  }

  async parseResume(file: File): Promise<ParsedResume> {
    console.log("ResumeParser.parseResume called with file:", file.name);
    console.log("ResumeParser enabled:", this.isEnabled);
    console.log("ResumeParser genAI available:", !!this.genAI);

    if (!this.isEnabled || !this.genAI) {
      console.error("ResumeParser not initialized properly");
      throw new Error(
        "AI service not initialized. Please configure your API key."
      );
    }

    try {
      const base64 = await this.fileToBase64(file);

      const prompt = `
        Analyze this resume document and extract the following information. Return ONLY valid JSON without any markdown formatting or code blocks:
        {
          "text": "Full text content of the resume",
          "name": "Full name of the candidate",
          "email": "Email address",
          "phone": "Phone number",
          "skills": ["Array of technical skills"],
          "experience": ["Array of work experience entries"],
          "education": ["Array of education entries"],
          "summary": "Brief professional summary"
        }
        Please be thorough and extract all relevant information. If any field is not found, use null for that field. Return only the JSON object, no additional text or formatting.
      `;

      console.log("Making API call...");

      const response = await this.genAI.models.generateContentStream({
        model: gemini.GEMINI_MODEL,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64,
                  mimeType: file.type,
                },
              },
            ],
          },
        ],
      });

      let fullText = "";
      for await (const chunk of response) {
        fullText += chunk.text;
      }

      // Extract JSON from markdown code blocks if present
      let jsonText = fullText.trim();

      // Check if response is wrapped in markdown code blocks
      if (jsonText.startsWith("```json") && jsonText.endsWith("```")) {
        jsonText = jsonText.slice(7, -3).trim(); // Remove ```json and ```
      } else if (jsonText.startsWith("```") && jsonText.endsWith("```")) {
        jsonText = jsonText.slice(3, -3).trim(); // Remove ``` and ```
      }

      console.log("Extracted JSON text:", jsonText);

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        logger.error("JSON parsing error:", parseError);
        logger.error("Raw response:", fullText);
        logger.error("Extracted JSON:", jsonText);
        throw new Error("Invalid JSON response from AI");
      }

      // Validate that parsed is an object
      if (!parsed || typeof parsed !== "object") {
        throw new Error("AI response is not a valid object");
      }

      return {
        text: parsed.text || "",
        name: parsed.name || undefined,
        email: parsed.email || undefined,
        phone: parsed.phone || undefined,
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        summary: parsed.summary || undefined,
      };
    } catch (error) {
      logger.error("Resume parsing error:", error);
      throw new Error("Failed to parse resume. Please try again.");
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = function (error) {
        logger.error("Error: ", error);
        reject(error);
      };
    });
  }
}

export const resumeParser = new ResumeParser();
