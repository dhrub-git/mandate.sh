import { BaseMessage } from "@langchain/core/messages";
export interface HallucinationAgentState {
  // Input
  fileBase64?: string;
  question: string;
  
  // Pipeline Data
  messages: BaseMessage[];
  context: string[]; // Retrieved chunks
  answer: string;
  
  // Analysis Data
  hallucinationScore: number;
  hallucinationReasoning: string;
  isHallucinated: boolean;
}