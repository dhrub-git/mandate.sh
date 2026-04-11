export function stage4Router(state: any) {
  const lastMsg = state.messages[state.messages.length - 1];

  if (lastMsg?.tool_calls?.length) {
    return "web_search_3";
  }

  if (state.stage4_complete) {
    return "policy_generator";
  }

  return "stage_4";
}