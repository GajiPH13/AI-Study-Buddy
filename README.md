# AI Study Buddy

AI Study Buddy is a small academic web application where students register with an email and password, create private study conversations, and receive streamed AI tutoring in Explain, Hint, or Quiz mode.

## MVP requirements

The MVP includes:

- Public landing page and direct email/password registration and login.
- Immediate access after authentication; no email verification or second authentication step.
- Protected dashboard with private conversation creation, listing, renaming, settings, and deletion.
- Mathematics, Science, History, Programming, and General subjects.
- Explain, Hint, and Quiz tutor modes.
- Streamed Ollama or OpenAI responses with stop and retry controls.
- Persistent, paginated conversation history in MongoDB.
- Input validation, provider-appropriate safety controls, per-user rate limiting, accessible errors, and responsive layouts.

The MVP explicitly excludes Google or other OAuth providers, email verification, password recovery, 2FA/MFA, file uploads, RAG/vector search, voice, image generation, teacher/admin roles, collaboration, payments, subscriptions, and native mobile applications.

## Required stack

| Layer | Technology |
| --- | --- |
| Package manager | npm |
| Language | TypeScript |
| Application | Next.js App Router and React |
| Styling | Tailwind CSS |
| Authentication | Better Auth email/password |
| Validation | Zod |
| Database | MongoDB with the native Node.js driver; no Mongoose |
| AI | Ollama native chat API by default; OpenAI is optional |
| Deployment | Vercel with a MongoDB Atlas replica set |

The application is one Next.js deployment. Browser code calls only Next.js pages and Route Handlers. Authentication secrets, database access, AI-provider access, tutor instructions, safety handling, and authorization remain server-side.

## User flows

### Account access

- A visitor can register using name, email, and password and enter the dashboard immediately.
- A returning user can log in and log out.
- There is no email verification, password reset, OAuth, 2FA, MFA, or other multi-step authentication.
- An unauthenticated visitor cannot access the dashboard, chat pages, conversation APIs, or chat API.

### Conversations

- A student creates a conversation by choosing one subject and one tutor mode.
- The dashboard lists only conversations owned by the signed-in student, newest first.
- Conversations can be opened, renamed, switched to another subject/mode, and permanently deleted after confirmation.
- Deleting a conversation also deletes its messages in a transaction.
- Conversation and message lists use bounded cursor pagination.

### AI tutoring

- Explain mode provides a clear, student-friendly explanation with examples when useful.
- Hint mode guides the student without immediately providing the complete solution.
- Quiz mode creates no more than five questions, delays answers until an attempt or explicit request, and gives concise feedback.
- The browser displays pending, streaming, completed, failed, and cancelled states.
- Stopping or failing a generation keeps the user message retryable and never stores an empty or partial assistant message.
- Completed messages survive refreshes.
- AI output is guidance and can be incorrect; important academic work should be verified.

## Authorization and security

- Every protected handler validates the Better Auth session and derives `userId` from it.
- Every owned-resource query includes both the resource identifier and authenticated `userId`.
- Missing and non-owned resources both return `404` to avoid exposing their existence.
- Zod validates bodies, paths, cursors, enum values, and size limits before `ObjectId` conversion.
- User and AI messages render as plain text; arbitrary HTML is never executed.
- OpenAI mode moderates input before persistence and generation. Ollama mode uses the server-controlled safety instruction because Ollama does not provide the OpenAI Moderation API.
- Chat requests are rate-limited per user with MongoDB atomic counters.
- AI-provider calls use bounded history, output limits, timeouts, and cancellation. OpenAI mode also uses `store: false`.
- Logs and client bundles must not contain credentials, cookies, API keys, tutor instructions, database details, or complete private conversations.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` / `POST` | `/api/auth/[...all]` | Better Auth operations |
| `GET` | `/api/conversations` | Cursor-page the current user's conversations |
| `POST` | `/api/conversations` | Create an owned conversation |
| `GET` | `/api/conversations/:id` | Return one owned conversation and a message page |
| `PATCH` | `/api/conversations/:id` | Rename or update subject/mode |
| `DELETE` | `/api/conversations/:id` | Transactionally delete a conversation and messages |
| `POST` | `/api/chat` | Validate, moderate, rate-limit, persist, and stream a tutor response |

Non-streaming success responses use `{ "data": ... }`. Errors use `{ "error": { "code": "...", "message": "..." } }`. The chat endpoint uses `start`, `delta`, `done`, and `error` SSE events after request acceptance.

## Application data

`conversations` contain the owner ID, title, subject, mode, default-title flag, and timestamps. `messages` contain the owner and conversation IDs, role, plain-text content, timestamps, idempotency/reply identifiers, and user-generation status where applicable. `rateLimits` contain atomic per-user time-window counters with TTL cleanup.

Required indexes cover:

- Conversation ownership and newest-first pagination.
- Chronological messages and owner/conversation checks.
- Unique user-message request IDs.
- One assistant reply per user message.
- Rate-limit expiry.

Run the idempotent index command against a replica-set-capable MongoDB deployment before serving production traffic.

## Local setup

Requirements: Node.js 20.9 or newer, npm, a MongoDB replica set or Atlas database, and either Ollama access or an OpenAI API key.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and supply real server-side values.
3. Create application indexes with `npm run db:indexes`.
4. Start the application with `npm run dev`.
5. Open `http://localhost:3000`, register, and create a study session.

Environment variables:

```dotenv
MONGODB_URI=
MONGODB_DB_NAME=ai_study_buddy
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
AI_PROVIDER=ollama
OLLAMA_API_KEY=
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=

# Used only with AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=
CHAT_MESSAGE_MAX_CHARS=4000
CHAT_RATE_LIMIT_PER_MINUTE=10
CHAT_MAX_OUTPUT_TOKENS=1200
CHAT_TIMEOUT_MS=45000
```

`BETTER_AUTH_SECRET` must be at least 32 characters. Do not commit real values.

## Verification

Run:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Do not add Playwright, Cypress, automated browser-test frameworks, or E2E plugins. API authorization and failure paths are covered with unit/integration tests. Complete user journeys are checked manually by registering or logging in as a student and using the platform on mobile and desktop layouts.

The MVP is complete when a student can register/login, create and manage private conversations, stream and retry all three tutor modes, retain completed history after refresh, and cannot access another student's resources by changing request identifiers.
