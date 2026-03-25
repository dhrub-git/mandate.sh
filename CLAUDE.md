# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Mandate is a Turbo monorepo that generates AI governance policies. Users complete a multi-step onboarding questionnaire, the app stores a Company profile in Postgres via Prisma, then a LangGraph workflow asks follow-up questions (via interrupts), performs web research with Exa, and produces final policy markdown.

## Commands

```bash
npm install                                      # install all workspace deps
npm run dev                                      # start full workspace (web + packages)
npm --workspace web run dev                      # start only the Next.js app (localhost:3000)
npm run build                                    # build all workspaces
npm run lint                                     # lint all workspaces
npm run check-types                              # type-check all workspaces
npm run format                                   # prettier format all .ts/.tsx/.md

npm --workspace @repo/database run db:generate   # regenerate Prisma client after schema changes
npm --workspace @repo/database run db:push       # push schema to database
npm --workspace @repo/database run db:studio     # open Prisma Studio
```

Turbo `build` depends on `db:generate`, so always regenerate after touching `schema.prisma`.

## Architecture

### Workspace Layout

- **`apps/web`** — Next.js 16 App Router. Pages: `/` (landing), `/onboarding` (5-step wizard), `/dashboard` (workflow resume + policy display). Server actions in `app/actions/`, API routes in `app/api/`.
- **`packages/agents`** — LangGraph workflow. All active code is under `src/mandate/`. Exports via `src/index.ts` with `mandate`-prefixed names (e.g., `mandateStartWorkflow`, `mandateStreamWorkflowEvents`).
- **`packages/database`** — Prisma schema, `pg` adapter (not Neon adapter despite import), exports `db` client and enums. Enums are also re-exported as TS const objects from `src/enums.ts`.
- **`packages/ui`** — Shared React UI primitives (shadcn-style).
- **`packages/eslint-config`**, **`packages/typescript-config`** — Shared tooling config.

### Data Flow

1. `/onboarding` collects company data, validated by Zod schema in `apps/web/lib/schemas.ts` (mirrors Prisma enums).
2. Server action `submitCompanyProfile` creates a `Company` record then calls `startMandateWorkflow` which generates a UUID thread ID.
3. `/dashboard` POSTs to `/api/mandate/stream` with `{threadId, action: "start"|"resume", input}`.
4. The stream route iterates `graph.streamEvents()` and emits SSE events: `node_start`, `node_complete`, `token`, `tool_start`, `tool_complete`, `status`, `done`.
5. On interrupt (LangGraph `interrupt()`), the stream ends and `status` event carries the question. User answers resume the thread.

### LangGraph Workflow (`packages/agents/src/mandate/`)

The graph is a `StateGraph` with these nodes chained linearly:

```
START → stage_2 → stage_3 → stage_4 → policy_generator → END
```

Each stage has a paired `web_search_N` tool node and a conditional router (`stage2Router`, `stage3Router`, etc.) that decides: call web search, advance to next stage, or loop back. Stages use LangGraph `interrupt()` to pause for user input.

State carries: `onboarding_data`, `messages`, `stage{2,3,4}_data`, `stage{2,3,4}_complete`, `draft_policy_{2,3,4}`, `policies` (final markdown).

Checkpointing uses `PostgresSaver` (same `DATABASE_URL` as Prisma).

**Models**: `model` = OpenAI (`gpt-5.4-mini`), `model1` = Google Gemini (`gemini-2.5-flash-lite`). Configured in `packages/agents/src/mandate/config/model.ts`.

### Prompt Loading

Stage prompts are markdown files in `apps/web/public/prompts/` (STAGE2/3/4_TRANSITION_PROMPT.md). Loaded at runtime by `packages/agents/src/mandate/config/prompts.ts` which searches `process.cwd()/public/prompts` first, then local fallbacks.

### Legacy/Scaffold Code

- `packages/agents/src/graph.ts` and `apps/web/app/api/chat/route.ts` are old scaffolds, not part of the active flow.

## Environment Variables

Required in root `.env`:
- `DATABASE_URL` — Postgres connection string
- `OPENAI_API_KEY1` — OpenAI key (note the `1` suffix)
- `GEMINI_API_KEY` — Google Gemini key
- `EXASEARCH_API_KEY` — Exa web search key

## Verification

No automated test suite exists yet. Minimum verification:
1. `npm run lint`
2. `npm run check-types`
3. Manual walkthrough: `/onboarding` → `/dashboard` → answer interrupts → verify policy output
