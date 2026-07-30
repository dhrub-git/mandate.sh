export function stage4Router(state: any) {
  const lastMsg = state.messages[state.messages.length - 1];
  const toolCalls = (lastMsg?.tool_calls ?? []).filter(
    (t: { name: string }) => t.name !== "stage_complete",
  );

  if (toolCalls.length) {
    return "web_search_3";
  }

  if (state.stage4_complete) {
    return "policy_generator";
  }

  return "stage_4";
}
