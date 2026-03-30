# Contributing to Mandate

Thank you for your interest in contributing to Mandate. This document covers everything you need to know to submit a successful contribution.

## Before You Start

1. Read this entire document
2. Check [open issues](https://github.com/dhrub-git/mandate.sh/issues) for existing work or to claim a task
3. For large changes (new features, architectural shifts), open an issue to discuss before writing code

## Local Setup

### Prerequisites

- Node.js `>=18`
- npm `10.x`
- PostgreSQL database

### Environment

Copy the example env vars to a `.env` file at the repo root:

```bash
DATABASE_URL=postgresql://...
EXASEARCH_API_KEY=...
GEMINI_API_KEY=...
OPENAI_API_KEY1=...
```

### Install and Run

```bash
npm install --legacy-peer-deps
npm --workspace @repo/database run db:generate
npm --workspace @repo/database run db:push
npm run dev
```

The app runs at `http://localhost:3000`.

### Workspace Layout

| Workspace | Path | What It Does |
|-----------|------|-------------|
| `web` | `apps/web` | Next.js 16 App Router frontend |
| `@repo/agents` | `packages/agents` | LangGraph workflow (stages, routers, tools) |
| `@repo/database` | `packages/database` | Prisma schema, client, enums |
| `@repo/ui` | `packages/ui` | Shared React UI components |
| `@repo/eslint-config` | `packages/eslint-config` | Shared ESLint config |
| `@repo/typescript-config` | `packages/typescript-config` | Shared TS config |

The active workflow code is in `packages/agents/src/mandate/`. The files `packages/agents/src/graph.ts` and `apps/web/app/api/chat/route.ts` are legacy scaffolds — don't build on them.

## Branch Naming

Always work on a feature branch. Never commit directly to `main`.

```
feature/add-pdf-export
fix/button-text-color
docs/update-contributing
refactor/extract-policy-viewer
test/add-onboarding-validation
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that doesn't fix a bug or add a feature |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `ci` | CI/CD changes |

### Scopes

Use the workspace or area: `web`, `agents`, `database`, `ui`, `homepage`, `onboarding`, `dashboard`, `workflow`.

### Examples

```
feat(agents): add bias testing stage to workflow
fix(web): resolve button text color on dark backgrounds
docs(readme): add demo GIF walkthrough
refactor(dashboard): extract PolicyViewer from ChatInterface
chore(deps): update langchain to 1.3.0
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Focused Changes

- One logical change per branch
- Keep PRs under 200 lines when possible, 400 lines maximum
- If a feature is large, break it into sequential PRs (e.g., schema first, then API, then UI)

### 3. Verify Before Committing

Run all three checks before every commit:

```bash
npm run check-types
npm run lint
npm run build
```

If you changed the Prisma schema, regenerate first:

```bash
npm --workspace @repo/database run db:generate
npm --workspace @repo/database run db:push
```

### 4. Manual Testing

Since there is no automated test suite yet, manually verify your changes:

- **Onboarding flow**: `/onboarding` completes all 5 steps without errors
- **Dashboard**: `/dashboard` streams workflow events and displays policy sections
- **Interrupt/resume**: AI asks questions, user answers, workflow continues
- **Policy output**: Final policy renders with all sections

If your change touches a specific area, verify that area still works end-to-end.

## Pull Request Process

### PR Title

Use the same format as commit messages:

```
feat(agents): add bias testing stage to workflow
```

### PR Description

Use this template:

```markdown
## What
Brief description of the change.

## Why
What problem does this solve? Link to issue if applicable.

## How
Implementation approach — what was changed and why this approach was chosen.

## Testing
Step-by-step instructions for the reviewer to verify:
1. Start the dev server
2. Navigate to /onboarding
3. Fill in company details
4. Verify [specific behavior]

## Checklist
- [ ] `npm run check-types` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manual testing completed
- [ ] Documentation updated (if applicable)
- [ ] No secrets or credentials in the diff
- [ ] No unrelated changes included
```

### Linking Issues

Use closing keywords in the PR description:

```
Closes #123
Fixes #456
Resolves #789
```

### Draft PRs

If your work is in progress, create a draft PR:

```bash
gh pr create --draft --title "feat(web): add PDF export" --body "WIP — need to add cover page styling"
```

Mark it ready when done:

```bash
gh pr ready
```

## What NOT to Include

Your PR should not contain:

- **Secrets**: `.env` files, API keys, tokens, credentials
- **Build artifacts**: `node_modules/`, `.next/`, `dist/`, `.turbo/`
- **IDE files**: `.vscode/`, `.idea/`, `.DS_Store`
- **Personal files**: `SESSION.md`, `NOTES.md`, planning documents, scratch files
- **Debug artifacts**: `console.log` statements (remove before submitting), temporary test screenshots
- **Unrelated changes**: If you spot a bug while working on a feature, fix it in a separate PR

## Code Style

### General

- TypeScript everywhere
- Follow existing patterns in the codebase
- Run `npm run format` (Prettier) before committing
- 2-space indentation (enforced by Prettier)

### Naming

| Element | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase | `PolicyViewer.tsx` |
| Server actions | camelCase | `submitCompanyProfile` |
| Route folders | lowercase | `app/onboarding/` |
| Stage files | camelCase with number | `stage2.ts`, `stage3Router.ts` |
| Prisma models | PascalCase | `Company`, `Policy` |
| Enums | UPPER_SNAKE_CASE | `FINANCIAL_SERVICES` |
| CSS classes | kebab-case or Tailwind | `hero-gradient`, `text-accent-highlight` |

### Agents Package

- Stage-specific code stays isolated by stage number
- Routers decide the next node (web search, next stage, or loop back)
- Prompts are markdown files in `apps/web/public/prompts/`
- Models are configured in `packages/agents/src/mandate/config/model.ts`
- All exports from the agents package go through `packages/agents/src/index.ts` with `mandate`-prefixed names

### UI Package

- Components use [CVA](https://cva.style/) for variants
- Use `cn()` from `lib/utils` for class merging
- Components support `asChild` via Radix Slot where applicable

### Database Package

- After changing `schema.prisma`, always run `db:generate` and `db:push`
- Enums are mirrored as TypeScript const objects in `src/enums.ts`
- The `db` client is exported from `src/index.ts`

## Security

- Never commit secrets or credentials
- Never log sensitive data (database URLs, API keys, user PII)
- Use `process.env` for all secrets — never hardcode
- Validate all user input at system boundaries (server actions, API routes)
- Use Prisma ORM for all database queries (no raw SQL)

## Getting Help

- Open an issue for bugs or feature requests
- Start a discussion for questions about architecture or approach
- Tag `@dhrub-git` for maintainer input on larger changes

## Recognition

All contributors are recognized in release notes. Meaningful contributions may be highlighted in project updates and LinkedIn announcements.
