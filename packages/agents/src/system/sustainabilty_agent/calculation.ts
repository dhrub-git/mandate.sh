import { CONFIG, MODEL_POWER_KW, REGION_CARBON_INTENSITY, MODEL_COST_PER_1K_TOKENS } from "./config";
// Reference: sustainability_agent/app/sustainability/energy_calculator.py
export function calculateEnergy(model: string, durationMs: number): number {
  const powerKw = MODEL_POWER_KW[model] || 0.2;
  const hours = durationMs / 1000 / 3600;
  return powerKw * hours * CONFIG.DEFAULT_PUE;
}
// Reference: sustainability_agent/app/sustainability/carbon_calculator.py
export function calculateCarbon(energyKwh: number, region: string): number {
  const intensity = REGION_CARBON_INTENSITY[region] || 500;
  return energyKwh * intensity;
}
// Reference: sustainability_agent/app/sustainability/cost_calculator.py
export function calculateCost(totalTokens: number, modelName: string): number {
  const rate = MODEL_COST_PER_1K_TOKENS[modelName] || 0.002;
  return (totalTokens / 1000) * rate;
}
// Reference: sustainability_agent/app/sustainability/equivalency_calculator.py
export function calculateEquivalencies(carbonGrams: number) {
  // Assumptions: LED light bulb ≈ 6g CO2 per hour
  const lightbulbMinutes = (carbonGrams / 6) * 60;
  
  // Assumptions: Car travel ≈ 404g CO2 per mile
  const carMiles = carbonGrams / 404;
  return {
    lightbulb_minutes: Number(lightbulbMinutes.toFixed(2)),
    car_miles: Number(carMiles.toFixed(4))
  };
}
// Reference: sustainability_agent/app/sustainability/right_sizing.py
export function analyzePrompt(prompt: string): "COMPLEX" | "SIMPLE" {
  const lowerPrompt = prompt.toLowerCase();
  const complexKeywords = ["analyze", "compare", "evaluate", "design", "architecture", "strategy", "trade-off"];
  
  if (complexKeywords.some(keyword => lowerPrompt.includes(keyword))) return "COMPLEX";
  if (prompt.split(/\s+/).length > 50) return "COMPLEX";
  
  return "SIMPLE";
}
// Reference: sustainability_agent/app/sustainability/right_sizing.py
export function recommend(
  model: string,
  taskType: string,
  cost: number,
  carbon: number,
  energy: number
) {
  const exceeded: Record<string, any> = {};
  if (cost > CONFIG.MAX_COST_USD) exceeded.cost = { actual: cost, threshold: CONFIG.MAX_COST_USD };
  if (carbon > CONFIG.MAX_CARBON_GRAMS) exceeded.carbon = { actual: carbon, threshold: CONFIG.MAX_CARBON_GRAMS };
  if (energy > CONFIG.MAX_ENERGY_KWH) exceeded.energy = { actual: energy, threshold: CONFIG.MAX_ENERGY_KWH };
  if (taskType === "SIMPLE" && Object.keys(exceeded).length > 0) {
    return {
      status: "INEFFICIENT",
      decision: "Simple task used excessive resources",
      recommendation: "Use smaller or quantized model",
      exceeded
    };
  }
  return { status: "OPTIMAL", decision: "Resource usage justified" };
}