import {
  StateGraph,
  START,
  END,
  Annotation
} from "@langchain/langgraph";

import { ToolNode } from "@langchain/langgraph/prebuilt";

import { webSearch } from "../tools/webSearch";

import { stage2 } from "../nodes/stage2";
import { stage3 } from "../nodes/stage3";
import { stage4 } from "../nodes/stage4";
import { policyGenerator } from "../nodes/policyGenerator";

import { stage2Router } from "../routers/stage2Router";
import { stage3Router } from "../routers/stage3Router";
import { stage4Router } from "../routers/stage4Router";
import { policyRouter } from "../routers/policyRouter";
import { messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import pg from "pg"
import {PostgresSaver} from "@langchain/langgraph-checkpoint-postgres";

// Tool node

const toolNode = new ToolNode([webSearch], {
  handleToolErrors: true,
});



const WorkflowStateAnnotation = Annotation.Root({
  thread_id: Annotation<string>(),
  onboarding_data: Annotation<string>(),
  messages: Annotation<BaseMessage[]>({
  reducer: messagesStateReducer,
  default: () => [],
}),
  stage2_data: Annotation<any[]>(),
  stage3_data: Annotation<any[]>(),
  stage4_data: Annotation<any[]>(),
  stage2_complete: Annotation<boolean | undefined>(),
  stage3_complete: Annotation<boolean | undefined>(),
  stage4_complete: Annotation<boolean | undefined>(),
  policies: Annotation<string | undefined>(),

  draft_policy_2: Annotation<string | undefined>(),
  draft_policy_3: Annotation<string | undefined>(),
  draft_policy_4: Annotation<string | undefined>(),
  risk_classifications: Annotation<any | undefined>(),
});


export async function buildGraph() {
  const builder = new StateGraph(WorkflowStateAnnotation);

  // Nodes


  builder.addNode("stage_2", stage2 );
  builder.addNode("stage_3", stage3 );
  builder.addNode("stage_4", stage4 );
  builder.addNode("policy_generator", policyGenerator );

  builder.addNode("web_search_1", toolNode );
  builder.addNode("web_search_2", toolNode );
  builder.addNode("web_search_3", toolNode);
  builder.addNode("web_search_4", toolNode);

  // Flow
  builder.addEdge(START, "stage_2" as any);



  builder.addConditionalEdges("stage_2" as any, stage2Router, ["web_search_1", "stage_3", "stage_2"] as any);
  builder.addConditionalEdges("stage_3" as any , stage3Router,  ["web_search_2", "stage_4", "stage_3"] as any);
  builder.addConditionalEdges("stage_4" as any, stage4Router, ["web_search_3", "policy_generator", "stage_4" as any]);
  builder.addConditionalEdges("policy_generator" as any, policyRouter,["web_search_4",END] as any);

  // Tool return edges
  builder.addEdge("web_search_1" as any, "stage_2" as any);
  builder.addEdge("web_search_2" as any, "stage_3" as any);
  builder.addEdge("web_search_3" as any, "stage_4" as any);
  builder.addEdge("web_search_4" as any, "policy_generator" as any);

  builder.addEdge("policy_generator" as any, END);

  
  // const checkpointer = new MemorySaver();

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const checkpointer = new PostgresSaver(pool);
  await checkpointer.setup();
 
  return builder.compile({checkpointer});
}