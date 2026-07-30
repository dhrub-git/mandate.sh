import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

// Define the state for our graph
// We extend MessagesAnnotation which provides a 'messages' key that supports adding messages
export const GraphState = Annotation.Root({
  ...MessagesAnnotation.spec,
  // Add any other shared state here if needed in the future
  // e.g., userId: Annotation<string>,
  // userIntent: Annotation<string>,
});

export type GraphStateType = typeof GraphState.State;
