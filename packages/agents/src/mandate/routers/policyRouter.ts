export function policyRouter(state: any) {
  const lastMsg = state.messages?.[state.messages.length - 1];

  if (lastMsg?.tool_calls?.length) {
    return "web_search_4";
  }

  return "__end__";
}