import { getEnv } from "../utils/getEnv";

export const gemini = {
  GEMINI_API_KEY: getEnv("VITE_GEMINI_API_KEY", ""),
  GEMINI_MODEL: getEnv("VITE_GEMINI_MODEL", "gemini-1.5-flash"),
};

export const reactEnv = getEnv("VITE_REACT_ENV", "production");
