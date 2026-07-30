export function stage3Router(state: any) {
  const lastMsg = state.messages[state.messages.length - 1];
  const toolCalls = (lastMsg?.tool_calls ?? []).filter(
    (t: { name: string }) => t.name !== "stage_complete",
  );

  if (toolCalls.length) {
    return "web_search_2";
  }

  if (state.stage3_complete) {
    return "stage_4";
  }

  return "stage_3";
}
