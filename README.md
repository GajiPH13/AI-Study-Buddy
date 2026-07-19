 
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

  Do not add verification emails, recovery flows, OAuth buttons, or MFA prompts.

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