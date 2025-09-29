import { GoogleGenAI } from "@google/genai";
import { gemini } from "./envConfig";

const geminiInstance = () => {
  return new GoogleGenAI({ apiKey: gemini.GEMINI_API_KEY });
};

export { geminiInstance };
