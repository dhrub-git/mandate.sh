import { FairnessState } from "../types";
import fairnessAgentPrompts from "../fairnessAgentPrompts";

import { model } from "../../../config/model";

export async function runDataQuality(
    state: FairnessState,
    config: any,
): Promise<Partial<FairnessState>> {
     const prompt =  `${fairnessAgentPrompts.dataQualityPrompt}
${JSON.stringify(state.json_data)}` ;


    const response = await model.invoke(prompt );

    
    return {
        data_quality : response.content as string,
    } ;
}