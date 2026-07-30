import { FairnessState } from "../types";

import fairnessAgentPrompts from "../fairnessAgentPrompts";
import { model } from "../../../config/model";

export async function runBiasAnalysis(
  state: FairnessState,
  config: any
): Promise<Partial<FairnessState>> {



  const prompt = `${fairnessAgentPrompts.biasDetectionPrompt} ${state.data_quality}Data: ${JSON.stringify(state.json_data)}`
  
  const response = await model.invoke(prompt);

  

  return {
    bias_analysis: response.content as string,
  };
}