export function stage2Router(state: any) {
  const lastMsg = state.messages[state.messages.length - 1];

  if (lastMsg?.tool_calls?.length) {
    return "web_search_1";
  }

  if (state.stage2_complete) {
    return "stage_3";
  }

  return "stage_2";
}