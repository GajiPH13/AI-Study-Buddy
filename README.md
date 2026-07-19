 
 ## AI-Study-Buddy
 ## 1. login and registration
 - Email/password registration and login only.
  - Users enter the platform immediately after login.
  - No Google OAuth, email verification, password reset, 2FA, or MFA.
  - npm is the package manager.
  - Testing uses unit, integration, and manual acceptance checks—no automated E2E tooling.

  This prevents the old Google requirements from influencing later work.

  ## 2. Establish the application foundation

  Create the Next.js App Router project with TypeScript and Tailwind CSS.

  Set up:

  - npm scripts for development, linting, type checking, tests, and production builds.
  - Server-only environment validation.
  - Shared layouts and basic academic styling.
  - Standard API success and error formats.
  - Unit/integration test infrastructure.
  - .env.example with MongoDB, Better Auth, and OpenAI settings.

  Completion check: the landing page renders, all npm verification scripts run, and no secret is exposed to the browser.

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
| --- | --- |
| Language | TypeScript |
| Framework | Next.js using the App Router |
| User interface | React and Tailwind CSS |
| Authentication | Better Auth |

| Server API | REST endpoints using Next.js Route Handlers |
| Database | MongoDB |
| Database access | Native `mongodb` Node.js driver only; no Mongoose |
| LLM provider | OpenAI API |
| Validation | Zod |
| Deployment | Vercel or another Next.js-compatible platform |


  Completion check: a student can register, log in, use the dashboard immediately, and lose protected access after
  logout.

  ## 5. Build conversation creation and dashboard listing

  Implement the first application-owned workflow:

  1. The student selects a subject and tutor mode.
  2. The server creates a conversation using the session’s user ID.
  3. The dashboard lists that student’s conversations.
  4. Selecting a conversation opens its chat page.

  Use cursor pagination and enforce page-size limits.

  Completion check: two test users see only their own conversations, and client-provided ownership fields are rejected
  or ignored.

  ## 6. Add conversation management and history

  Implement:

  - Loading an owned conversation and its newest messages.
  - Loading older messages through a cursor.
  - Renaming a conversation.
  - Changing its subject or tutor mode.
  - Confirmed deletion of the conversation and messages in one transaction.

  Every database operation must filter by both conversation ID and authenticated user ID. Missing and foreign
  conversations should both appear as 404.

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


  The browser should represent pending, streaming, completed, and failed states. It must never receive the API key or
  full server instruction.

  Completion check: the response appears incrementally, exactly one user/assistant pair is saved, and refreshing
  reproduces the completed exchange.

  ## 8. Add cancellation and retry

  Treat every submitted prompt as a small generation state machine:

  - Pending
  - Active
  - Completed
  - Failed
  - Cancelled

  Stopping should abort the browser request and upstream OpenAI generation. Failed and cancelled generations retain the
  user prompt but never create an empty or partial assistant document.

  Retry should:

  - Reference the existing unanswered user message.
  - Prevent concurrent generation for the same prompt.
  - Use an expiring lease so interrupted server work does not block the prompt forever.
  - Count against the normal rate limit.
  - Prevent duplicate assistant messages with a unique database constraint.

  Completion check: repeated clicks, network interruption, cancellation, and retries cannot produce duplicate stored
  messages.

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

```dotenv
MONGODB_URI=
MONGODB_DB_NAME=ai_study_buddy

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

OPENAI_API_KEY=
OPENAI_MODEL=
```

## 14. Acceptance Criteria

The MVP is complete when all of the following are true:

1. A visitor can sign in and sign out with login/register and google sign in.
2. A visitor without a valid session cannot access protected pages or endpoints.
3. An authenticated student can create a conversation with a subject and tutor mode.
4. The student can send a message and see an OpenAI response stream into the chat.
5. Refreshing the page preserves completed messages.
6. The dashboard lists only the current student's conversations.
7. A student cannot access another student's conversation by changing an ID.
8. The student can rename and delete a conversation.
9. Validation and service failures produce understandable error messages.
10. The application works on both mobile and desktop screen sizes.
11. The codebase uses the native MongoDB driver and contains no Mongoose dependency.
12. No secret or OpenAI API key is included in client-side code or committed files.

## 15. Suggested Delivery Plan

### Phase 1: Foundation

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

