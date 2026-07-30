import { Annotation } from "@langchain/langgraph";
export const GreenAIState = Annotation.Root({
  // Inputs
  prompt: Annotation<string> ,
  region: Annotation<string>,
  modelName: Annotation<string>,
  instanceType: Annotation<string>,
  
  // Outputs
  taskType: Annotation<string>,
  response: Annotation<string>,
  energyKwh: Annotation<number>,
  carbonGrams: Annotation<number>,
  costUsd: Annotation<number>,
  equivalency: Annotation<any>, // Added equivalency field
  optimization: Annotation<any>,
  usageLog: Annotation<any>,
});