import dotenv from "dotenv";
dotenv.config();
export const CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  DEFAULT_PUE: 1.15,
  MAX_COST_USD: 0.001,
  MAX_CARBON_GRAMS: 1.0,
  MAX_ENERGY_KWH: 0.001,
};
export const MODEL_POWER_KW: Record<string, number> = {
  "gemini-2.5-flash": 0.35,
  "small-model": 0.08,
};
export const REGION_CARBON_INTENSITY: Record<string, number> = {
  "ap-south-1": 700,
  "ap-southeast-1": 430,
  "us-east-1": 400,
  "us-west-2": 250,
  "eu-west-1": 280,
  "eu-north-1": 50,
};
export const MODEL_COST_PER_1K_TOKENS: Record<string, number> = {
  "Llama-3-70b": 0.0008,
  "gemini-2.5-flash": 0.002,
};