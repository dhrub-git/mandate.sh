import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GreenAIState } from "./state";
import { 
  analyzePrompt, 
  calculateEnergy, 
  calculateCarbon, 
  calculateCost, 
  calculateEquivalencies, // Added import
  recommend 
} from "./calculation";
import { CONFIG } from "./config";
const model = new ChatGoogleGenerativeAI({
  apiKey: CONFIG.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
});
// Reference: classify_node in sustainability_agent/app/graph.py
export async function classifyNode(state: typeof GreenAIState.State) {
  const taskType = analyzePrompt(state.prompt);
  return { taskType };
}
// Reference: llm_and_metrics_node in sustainability_agent/app/graph.py
// Reference: green_llm in sustainability_agent/app/middleware/llm_wrapper.py
export async function llmAndMetricsNode(state: typeof GreenAIState.State) {
  const start = Date.now();
  
  // 1. Call LLM
  const result = await model.invoke(state.prompt);
  const response = result.content as string;
  const durationMs = Date.now() - start;
  
  const totalTokens = result.usage_metadata?.total_tokens || state.prompt.length / 4; 
  // 2. Calculate Metrics
  const energy = calculateEnergy(state.instanceType, durationMs);
  const carbon = calculateCarbon(energy, state.region);
  const cost = calculateCost(totalTokens, state.modelName);
  
  // 3. Calculate Equivalencies (Added)
  const equivalency = calculateEquivalencies(carbon);
  // 4. Recommendation
  const optimization = recommend(
    state.modelName,
    state.taskType,
    cost,
    carbon,
    energy
  );
  return {
    response,
    energyKwh: energy,
    carbonGrams: carbon,
    costUsd: cost,
    equivalency, // Return new metric
    optimization,
    usageLog: { durationMs, totalTokens }
  };
}