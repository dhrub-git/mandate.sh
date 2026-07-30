export function stage3Router(state: any) {
  const lastMsg = state.messages[state.messages.length - 1];

  if (lastMsg?.tool_calls?.length) {
    return "web_search_2";
  }

  if (state.stage3_complete) {
    return "stage_4";
  }

  return "stage_3";
}