import { BaseMessage } from "@langchain/core/messages";

export interface WorkflowState {
  thread_id: string;
  onboarding_data: string;

  messages: BaseMessage[];

  stage2_data: any[];
  stage3_data: any[];
  stage4_data: any[];

  stage2_complete?: boolean;
  stage3_complete?: boolean;
  stage4_complete?: boolean;

  policies?: string;
  current_question?:string;

draft_policy_2?: string;
draft_policy_3?: string;
draft_policy_4?: string;

}