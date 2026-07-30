# Implementation Plan - Streaming Response Refactor

I have prepared a plan to update the streaming logic in `apps/web/app/api/system/[agent]/route.ts`. The goal is to suppress the continuous stream of text chunks (text-deltas) and instead provide a single, complete response at the end, alongside the metrics data.

## Changes

1.  **Buffer Text**: Introduce a `fullText` variable to capture the complete response from the `llm_metrics` node output.
2.  **Filter Events**: Inside the stream loop, ignore `on_chat_model_stream` events. This stops the "typing effect" chunks.
3.  **Single Send**: After the event loop finishes, write a single `text-delta` event containing the `fullText`.

## Expected Behavior

- **Before**: `text-delta` (chunk 1) -> `text-delta` (chunk 2) -> ... -> `data-metrics`.
- **After**: (Silence while processing) -> `data-metrics` -> Single `text-delta` (Full Text).

This satisfies the requirement: "I dont want text delta or i want singel text-delta".

## Verification

After applying these changes:

1.  Run `npm run dev`.
2.  Use Postman to hit the endpoint.
3.  Observe that you no longer get hundreds of small JSON chunks. You should get the `data-metrics` object and one final text block.
