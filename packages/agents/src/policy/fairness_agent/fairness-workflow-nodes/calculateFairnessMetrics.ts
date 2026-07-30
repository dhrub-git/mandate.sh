import { FairnessState } from "../types";
import { ChatOpenAI } from "@langchain/openai";
import fairnessAgentPrompts from "../fairnessAgentPrompts";

import { model } from "../../../config/model";

export async function calculateFairnessMetrics(
  state: FairnessState,
  config: any
): Promise<Partial<FairnessState>> {


    const response = await model.invoke(
    `${fairnessAgentPrompts.fairnessMetricsPrompt}\n${state.bias_analysis}`
  );


  return {
    fairness_results: response.content as string,
  };
}