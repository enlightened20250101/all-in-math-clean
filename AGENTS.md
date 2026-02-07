# Repository Guidelines

## Project Structure & Module Organization
- `src/app` contains Next.js App Router pages and layouts.
- `src/components` holds shared UI components.
- `src/lib` and `src/server` contain utilities and server-side logic.
- `src/hooks` is for React hooks, and `src/data` for local data helpers.
- `services/math-verify` is a FastAPI service used for verification tasks.
- `data/` stores repository-level data assets; `supabase.sql` documents the database schema seed.

## Build, Test, and Development Commands
- `npm run dev` starts the Next.js app on port 3000.
- `npm run dev:verify` runs the FastAPI verifier on port 8081.
- `npm run dev:all` runs both app and verifier in parallel.
- `npm run build` builds the Next.js production bundle.
- `npm run start` serves the production build.
- `npm run lint` runs Next.js ESLint checks.

## Coding Style & Naming Conventions
- Use TypeScript and follow existing file organization and component patterns in `src/`.
- Favor React components named in PascalCase (e.g., `ProblemCard.tsx`).
- Use Tailwind utility classes for styling; keep class lists readable and grouped.
- Run `npm run lint` before opening a PR to match the project's ESLint rules.

## Testing Guidelines
- No dedicated test framework is configured in this repo yet.
- Use script helpers in `scripts/` for manual verification (e.g., `scripts/test-tex.ts`).
- If you add tests, keep them close to the feature and document the runner in this file.

## Commit & Pull Request Guidelines
- Git history is not available in this workspace, so follow standard Conventional Commits if unsure (e.g., `feat: add lesson template`).
- PRs should include a short summary, key screenshots for UI changes, and linked issues when relevant.

## Configuration & Secrets
- Runtime configuration is likely handled via environment variables; avoid committing secrets.
- If you add new env vars, document them in a README or `.env.example` if one exists.

## Course / Question System Rules (MUST)
- We generate questions using TypeScript templates in `src/lib/course/templates/**` (NO DSL).
- Each template implements `generate/grade/explain` and has `meta` with `topicId`, `difficulty`, `tags`.
- Grading uses `gradeNumeric` (strict equality). Prefer integer answers; avoid floats unless you add tolerant grading.
- TeX rendering MUST use helpers in `src/lib/format/tex.ts`:
  - Use `texLinear`, `texEquation`, `texInequality`, `texPoly2`, etc.
  - Never handcraft expressions that can produce "1x" or "0x".
- Current scaling target: Standard coverage = ~150 topics × ~20 templates each (~3000 templates).
- For now, focus on bulk expanding templates topic-by-topic in batches (30–50 templates), running `npm run build` each batch.
