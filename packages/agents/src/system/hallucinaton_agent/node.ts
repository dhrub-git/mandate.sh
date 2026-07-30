import * as lancedb from "@lancedb/lancedb";
import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";
import { AIMessage } from "@langchain/core/messages";
import pdf from "pdf-parse-new"; // Fixed import
import promptfoo from "promptfoo";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { HallucinationAgentState } from "./state";
// --- Configuration ---
const EMBEDDING_MODEL = "models/gemini-embedding-001";
const GENERATION_MODEL = "gemini-2.0-flash";
// Helper: Get Vector Store
async function getVectorStore() {
  const tmpDir = path.join(os.tmpdir(), "lancedb_hallucination");
  await fs.mkdir(tmpDir, { recursive: true });
  const db = await lancedb.connect(tmpDir);
  return db;
}
// --- Node 1: Ingest PDF ---
export const ingestNode = async (state: HallucinationAgentState) => {
  if (!state.fileBase64) return { context: [] }; // Skip if no file (or already ingested)
  console.log("--> Ingesting PDF...");

  // 1. Decode & Parse
  const buffer = Buffer.from(state.fileBase64, "base64");
  const data = await pdf(buffer);
  const text = data.text;
  console.log("--> DEBUG: Extracted text length:", text.length);
  console.log("--> DEBUG: First 200 chars:", text.substring(0, 200));
  // 2. Chunking (Simple overlap)
  const chunkSize = 1000;
  const overlap = 100;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  console.log("--> DEBUG: Number of chunks created:", chunks.length);
  console.log("--> DEBUG: First chunk length:", chunks[0]?.length);
  console.log("--> DEBUG: First chunk preview:", chunks[0]?.substring(0, 100));
  // 3. Embed & Store
  const db = await getVectorStore();
  console.log(
    "--> DEBUG: GOOGLE_API_KEY exists?",
    !!process.env.GOOGLE_API_KEY,
  );
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: EMBEDDING_MODEL,
    apiKey: process.env.GOOGLE_API_KEY,
  });
  const vectors = await Promise.all(
    chunks.map(async (c) => ({
      vector: await embeddings.embedQuery(c),
      text: c,
      id: Math.random().toString(36).substring(7),
    })),
  );
  // Fixed: Ensure mode is typed correctly if strict, or use explicit string
  const table = await db.createTable("documents", vectors, {
    mode: "overwrite",
  });
  console.log("--> DEBUG: Vectors stored:", vectors.length);
  // FIX: Verify table exists before finishing
  const verification = await db.tableNames();
  if (!verification.includes("documents")) {
    throw new Error("Failed to verify table creation");
  }

  return {
    fileBase64: undefined,
    messages: [new AIMessage("PDF Ingested successfully.")],
  };
};
// --- Node 2: Retrieve Context ---
export const retrieveNode = async (state: HallucinationAgentState) => {
  console.log("--> Retrieving context for:", state.question);

  const db = await getVectorStore();
  // CHECK: Does the table exist?
  const tableNames = await db.tableNames();
  if (!tableNames.includes("documents")) {
    console.warn("Table 'documents' not found. Was a file uploaded?");
    return { context: [] }; // Return empty context instead of crashing
  }
  const table = await db.openTable("documents");

  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: EMBEDDING_MODEL,
    apiKey: process.env.GOOGLE_API_KEY,
  });
  const queryVector = await embeddings.embedQuery(state.question);

  // Fixed: Use .toArray() to get simple objects instead of .execute() iterator
  const results = await table.search(queryVector).limit(3).toArray();
  console.log("--> DEBUG: Search results count:", results.length);
  console.log("--> DEBUG: First result:", results[0]?.text?.substring(0, 100));

  const context = results.map((r: any) => r.text as string);
  console.log("--> DEBUG: Context array length:", context.length);
  console.log("--> DEBUG: Context joined length:", context.join("\n").length);

  return { context };
};
// --- Node 3: Generate Answer ---
export const generateNode = async (state: HallucinationAgentState) => {
  console.log("--> Generating answer...");

  const llm = new ChatGoogleGenerativeAI({
    model: GENERATION_MODEL, 
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0,
  });
  const prompt = `
  You are a helpful assistant. Answer the user's question strictly based on the provided context.
  
  Context:
  ${state.context.join("\n---\n")}
  
  Question: ${state.question}
  
  Answer:`;
  const response = await llm.invoke(prompt);
  return { answer: response.content as string };
};
// --- Node 4: Hallucination Check (Promptfoo) ---
export const hallucinationCheckNode = async (
  state: HallucinationAgentState,
) => {
  console.log("--> Checking for hallucinations...");
  // Programmatic Promptfoo Eval
  const result = await promptfoo.evaluate({
    prompts: [state.question],
    // Fixed: Provider must return a Promise
    providers: [() => Promise.resolve({ output: state.answer })],
    tests: [
      {
        vars: { context: state.context.join("\n"), query: state.question },
        assert: [
          {
            type: "context-faithfulness",
          },
        ],
      },
    ],
  });
  const firstResult = result.results[0];
  console.log("resutllllll.....", firstResult);

  // Fixed: promptfoo types can be tricky, safe access
  const score = firstResult!.score || 0;
  const passed = (firstResult as any).pass ?? firstResult!.score === 1;
  const reason = firstResult!.gradingResult?.reason || "No reasoning provided.";
  return {
    hallucinationScore: score,
    isHallucinated: !passed,
    hallucinationReasoning: reason,
  };
};
