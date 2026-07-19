# AI Study Buddy Repository Guide

## Source of truth

- Treat `README.md` as the authoritative client requirements.
- Follow the approved architecture plan when it resolves a README ambiguity.
- Stop and flag new conflicts instead of silently expanding the MVP.

## Stack and boundaries

- Use TypeScript, Next.js App Router, React, Tailwind CSS, Better Auth, Zod, the native MongoDB Node.js driver, and the configured server-side AI provider (Ollama by default; OpenAI optional).
- Use npm and commit `package-lock.json`. Do not add pnpm or Yarn lockfiles.
- Authentication is direct email/password registration and login only. Do not add OAuth, email verification, password reset, 2FA, MFA, or other multi-step authentication.
- Do not add Mongoose, browser-side MongoDB or AI-provider calls, arbitrary HTML rendering, or secrets in `NEXT_PUBLIC_*` variables.
- Keep file uploads, RAG, voice, image generation, payments, collaboration, and non-student roles out of the MVP.

## Architecture rules

- Reuse one cached `MongoClient` for Better Auth and application data.
- Validate the Better Auth session in every protected Route Handler. Derive `userId` only from the server session.
- Include both the resource ID and authenticated `userId` in every owned-resource query. Return `404` for missing and non-owned resources.
- Validate bodies, parameters, identifiers, and enums with Zod before converting IDs to `ObjectId`.
- Use the documented JSON envelope for REST responses and typed SSE events for chat streaming.
- Persist the user message before generation and the assistant message only after successful completion. Keep failed or cancelled prompts retryable and make chat writes idempotent.
- Use transactional conversation/message deletion, bounded cursor pagination, server-side limits, per-user rate limiting, and plain-text message rendering.
- Keep API keys, tutor instructions, session values, database details, and complete private conversations out of client bundles and logs.

## Delivery workflow

- Implement one complete vertical slice at a time, including data, API, authorization, UI, errors, security, and tests.
- Preserve unrelated user changes and avoid speculative features or abstractions.
- Add owner/non-owner authorization tests and failure-path tests for every protected endpoint.
- Do not install or configure Playwright, Cypress, automated browser-test frameworks, or E2E plugins. Verify complete user journeys with the documented manual acceptance checklist.

## Verification

Run the available project scripts before handing off changes:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

For user-facing changes, manually register or log in as a user and exercise the affected flow on mobile and desktop layouts.
