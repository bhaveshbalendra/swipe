import type { ParsedResume } from "../types";

export interface AiModel {
  
  parseResume: (file: File) => Promise<ParsedResume>;
}
