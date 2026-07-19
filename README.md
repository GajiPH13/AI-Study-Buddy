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

<<<<<<< HEAD
| Layer | Technology |
=======
  ## 3. Add MongoDB infrastructure

  Connect to MongoDB Atlas through one cached native MongoClient.

  Create typed access for:

  - Better Auth collections.
  - conversations.
  - messages.
  - rateLimits.

  Establish indexes through an idempotent setup script. Require a replica-set-capable MongoDB environment so deleting a
  conversation and its messages can be transactional.

  Completion check: repeated development reloads reuse connections, indexes can be safely applied more than once, and
  connection failures return sanitized errors.

  ## 4. Implement direct authentication

  Configure Better Auth for email/password only.

  Build:

  - Registration form with name, email, and password.
  - Login form.
  - Logout action.
  - Session-aware navigation.
  - Protection for /dashboard and /chat/[conversationId].
  - Session validation inside every protected API handler.

 
  ## Do not add verification emails, recovery flows, OAuth buttons, or MFA prompts.

| Layer | Required technology |
>>>>>>> b39da0757274631572654ce7b88cb5a80f393cca
| --- | --- |
| Package manager | npm |
| Language | TypeScript |
| Application | Next.js App Router and React |
| Styling | Tailwind CSS |
| Authentication | Better Auth email/password |
| Validation | Zod |
<<<<<<< HEAD
| Database | MongoDB with the native Node.js driver; no Mongoose |
| AI | Ollama native chat API by default; OpenAI is optional |
| Deployment | Vercel with a MongoDB Atlas replica set |
=======
| Deployment | Vercel or another Next.js-compatible platform |

>>>>>>> b39da0757274631572654ce7b88cb5a80f393cca

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

<<<<<<< HEAD
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
=======
  Completion check: refreshing preserves history, deletion removes all related messages, and changing a URL cannot
  expose another user’s data.

  ## 7. Implement the basic streamed chat

  Build the Explain-mode path first.

  Request flow:


  1. Validate the session, body, message length, and conversation ownership.
  2. Apply the per-user rate limit.
  3. Moderate the input.
  4. Persist the user message with a client-generated request ID.
  5. Load only the bounded history needed for context.
  6. call OpenAI from the server with subject, mode, safety instructions, and output limits.
  7. Forward normalized streaming events to the browser.
  8. Accumulate the complete answer server-side.
  9. Persist the assistant message only after successful completion.
**Quiz mode**

- The assistant shall generate up to five relevant questions.
- It shall not reveal the answers until the student attempts the questions or asks for them.
- It shall provide concise feedback on the student's answer.

### FR-07: Conversation History

- The user shall be able to reopen a saved conversation.
- Messages shall appear in chronological order.
- The system shall support pagination or a fixed maximum history size if a conversation becomes large.
- Deleting a conversation shall also delete its messages.
- A user shall never be able to read or modify another user's conversations by changing a URL or request body.

### FR-08: Error Handling

- The UI shall display understandable messages for authentication, validation, network, database, and OpenAI failures.
- A failed AI request shall not create an empty assistant message.
- The user shall be able to retry after a temporary failure.
- Internal errors, stack traces, database details, and secret values shall not be returned to the client.

## 7. Pages and Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | login/registration|
| `/dashboard` | Authenticated | List and manage conversations |
| `/chat/[conversationId]` | Owner only | Study chat interface |

## 8. REST API Requirements

All endpoints shall return JSON except the chat endpoint, which may return a streaming response. Protected endpoints shall obtain the user identity from the server session, never from a client-provided `userId`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` / `POST` | `/api/auth/[...all]` | Better Auth handler |
| `GET` | `/api/conversations` | List the current user's conversations |
| `POST` | `/api/conversations` | Create a conversation |
| `GET` | `/api/conversations/:id` | Return one owned conversation and its messages |
| `PATCH` | `/api/conversations/:id` | Rename or update the subject/mode |
| `DELETE` | `/api/conversations/:id` | Delete an owned conversation and its messages |
| `POST` | `/api/chat` | Validate a message and stream an OpenAI response |

>>>>>>> b39da0757274631572654ce7b88cb5a80f393cca

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

<<<<<<< HEAD
Environment variables:
=======
  ## 9. Add Hint and Quiz modes

  Keep one chat pipeline and vary only the server-controlled tutor instructions.

  - Explain: clear explanation with examples.
  - Hint: guidance without immediately supplying the complete solution.
  - Quiz: no more than five questions, delayed answers, and concise feedback after an attempt.

  Changing mode affects later requests; it should not rewrite previous messages.

  Completion check: integration tests verify the correct mode instruction, response limits, and history selection
  without making real OpenAI calls.

  ## 10. Harden and manually accept the MVP

  Finish with:

  - Keyboard navigation and visible focus.
  - Mobile layouts down to approximately 320px.
  - Accessible streaming and error announcements.
  - Plain-text message rendering.
  - Sanitized logs and error responses.
  - Mongo-backed rate-limit concurrency tests.
  - Authentication and owner/non-owner API integration tests.
  - Production build and client-bundle secret inspection.
  - Vercel preview deployment with MongoDB Atlas.


  The final acceptance pass is manual: register or log in as a normal user, create and manage conversations, stream each
  tutoring mode, stop and retry generation, refresh history, test mobile layout, log out, and attempt protected access
  without a session.

## 11. Non-Functional Requirements

### Security and Privacy

- Every protected REST handler shall validate the Better Auth session.
- Every conversation query shall include both the resource ID and authenticated user's ID.
- Request bodies, path parameters, and enum values shall be validated with Zod.
- Secrets shall be stored in environment variables and excluded from source control.
- User input shall be rendered as text or sanitized Markdown; arbitrary HTML shall not be executed.
- The chat endpoint shall apply per-user rate limiting.
- Logs shall not contain OAuth tokens, session cookies, API keys, or complete private conversations.

### Performance

- The first visible application screen should load within three seconds on a normal connection.
- The chat UI should display a pending or streaming state within one second of request acceptance.
- Conversation lists should be limited and paginated when necessary.
- MongoDB connections shall be pooled and reused.

### Accessibility

- The application shall be usable with a keyboard.
- Inputs and buttons shall have accessible labels and visible focus states.
- Text and controls shall maintain readable color contrast.
- Streaming status and errors should be communicated to assistive technology.

### Responsiveness

- The interface shall work at mobile widths starting around 320 pixels.
- The conversation sidebar may become a drawer on small screens.
- The message composer shall remain easy to reach without covering messages.

## 12. User Interface Requirements

- Use a clean academic style with a limited color palette.
- Clearly distinguish student and assistant messages.
- Keep the message input visible near the bottom of the chat view.
- Disable duplicate submission while the same message is being sent.
- Provide loading skeletons or indicators for asynchronous content.
- Confirm before permanently deleting a conversation.
- Display the active subject and tutor mode in the chat header.

## 13. Environment Variables

The project shall document variables similar to the following in `.env.example` without real secret values:
>>>>>>> b39da0757274631572654ce7b88cb5a80f393cca

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

<<<<<<< HEAD
The MVP is complete when a student can register/login, create and manage private conversations, stream and retry all three tutor modes, retain completed history after refresh, and cannot access another student's resources by changing request identifiers.
=======
- Create the Next.js TypeScript application.
- Configure Tailwind CSS and the shared layout.
- Add the native MongoDB connection utility and indexes.

### Phase 2: Authentication

- Configure Better Auth with its MongoDB adapter.
- Configure Google OAuth.
- Add login, logout, session checks, and route protection.

### Phase 3: Conversation REST API

- Implement conversation CRUD endpoints.
- Add Zod validation and ownership checks.
- Build the dashboard and conversation list.

### Phase 4: OpenAI Chat

- Implement the server-side tutor prompt.
- Add the streaming `/api/chat` endpoint.
- Build the chat interface and persist completed messages.

### Phase 5: Quality and Submission

- Add rate limiting, errors, empty states, and deletion confirmation.
- Test authentication, authorization, REST endpoints, and responsive layouts.
- Create `.env.example`, setup instructions, screenshots, and the assignment demonstration.

## 16. Testing Checklist

- Email/password registration login succeeds and failed login is handled.
- Logout invalidates access to protected resources.
- Invalid and missing conversation IDs return appropriate errors.
- Invalid subjects, modes, and empty messages are rejected.
- A user cannot read, rename, delete, or chat in another user's conversation.
- OpenAI timeout, cancellation, and failure states do not corrupt message history.
- MongoDB reconnects correctly during local development.
- The application passes TypeScript, lint, and production build checks.
- Core pages are keyboard accessible and responsive.

## 17. Reference Documentation

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Better Auth](https://www.better-auth.com/docs)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)
- [OpenAI API documentation](https://platform.openai.com/docs)

>>>>>>> b39da0757274631572654ce7b88cb5a80f393cca
