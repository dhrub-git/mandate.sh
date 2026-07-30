# Implementation Plan - Fix Missing Start Event

I have analyzed the issue and identified that filtering out `on_chat_model_stream` events prevents `toUIMessageStream` from emitting the `start` event automatically. To fix this, I will manually emit the `start` event at the beginning of the stream execution.

## Changes

1.  **Import `generateId`**: Add `generateId` to the imports from `ai`.
2.  **Manual Start Event**: Inside the `execute` callback of `createUIMessageStream`, explicitly write a `start` event with a generated ID.
    ```typescript
    const messageId = generateId();
    writer.write({ type: "start", messageId });
    ```
3.  **Preserve Logic**: Keep the existing classification, metrics, and text-delta logic.

## Expected Behavior

- **Before**: No `start` event in the stream output.
- **After**: The stream will begin with a `start` event (e.g., `{"type":"start","messageId":"..."}`), followed by the existing data and final text delta.

## Verification

After applying these changes:

1.  Run `npm run dev`.
2.  Use Postman to hit the endpoint.
3.  Observe that the first event in the stream is `{"type":"start",...}`.
