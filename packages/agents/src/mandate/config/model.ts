import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const openaiKey =
  process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY1 || "";

export const model = new ChatOpenAI({
  model: "gpt-5.4-mini",
  temperature: 0,
  apiKey: openaiKey,
});

export const model1 = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash-lite",
  temperature: 0.2,
});
