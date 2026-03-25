import { graph } from "@repo/agents";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const input = {
    messages: messages.map((m: any) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    ),
  };

  const stream = await graph.streamEvents(input, {
    version: "v2",
  });

  const encoder = new TextEncoder();

  const transformStream = new TransformStream({
    async transform(event, controller) {
      if (event.event === "on_chat_model_stream") {
        const token = event.data.chunk.content;
        if (token) {
          // AI SDK Data Stream protocol: 0: "text_part"
          // Format: 0:"<text>"\n
          controller.enqueue(encoder.encode(`0:${JSON.stringify(token)}\n`));
        }
      }
    },
  });

  return new Response(stream.pipeThrough(transformStream), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
