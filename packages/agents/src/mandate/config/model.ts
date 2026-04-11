import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

export const model = new ChatOpenAI({
  model: "gpt-5.4-mini",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
});
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const model1 = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash-lite",
  temperature: 0.2,
});