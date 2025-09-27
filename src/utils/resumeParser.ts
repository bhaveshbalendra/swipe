import { GoogleGenAI } from "@google/genai";

import { gemini } from "../config/envConfig";
import { type ParsedResume } from "../types";

class ResumeParser {
  private genAI: GoogleGenAI | null = null;
  private isEnabled = false;

  initialize(apiKey: string) {
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
      this.isEnabled = true;
    }
  }

  async parseResume(file: File): Promise<ParsedResume> {
    if (!this.isEnabled || !this.genAI) {
      throw new Error(
        "AI service not initialized. Please configure your API key."
      );
    }

    // Validate environment variables
    if (!gemini.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please create a .env file with VITE_GEMINI_API_KEY=your_api_key"
      );
    }
    if (!gemini.GEMINI_MODEL) {
      throw new Error(
        "GEMINI_MODEL is not configured. Please create a .env file with VITE_GEMINI_MODEL=gemini-1.5-flash"
      );
    }

    try {
      console.log("Starting resume parsing...");
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      const base64 = await this.fileToBase64(file);
      console.log("Base64 length:", base64.length);

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

      console.log("Model:", gemini.GEMINI_MODEL);
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
        console.error("JSON parsing error:", parseError);
        console.error("Raw response:", fullText);
        console.error("Extracted JSON:", jsonText);
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
      console.error("Resume parsing error:", error);
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
        console.log("Error: ", error);
        reject(error);
      };
    });
  }
}

export const resumeParser = new ResumeParser();
