import { FairnessState } from "../types";
import { ChatOpenAI } from "@langchain/openai";
import fairnessAgentPrompts from "../fairnessAgentPrompts";

import { model } from "../../../config/model";

export async function performMitigation(
  state: FairnessState,
  config: any
): Promise<Partial<FairnessState>> {

  const prompt =  `${fairnessAgentPrompts.mitigationStrategyPrompt}\n${state.fairness_results}`
  const response = await model.invoke(prompt);

  return {
    mitigation_plan: response.content as string,
  };
}