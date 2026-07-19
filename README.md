# AI Study Buddy

## Client Requirements Document

**Project type:** Small academic web application  
**Version:** 1.0  
**Status:** MVP requirements

## 1. Project Overview

AI Study Buddy is a web application that allows students to Email/password registration  and study with an AI-powered tutor. A student selects a subject and a learning mode, asks questions, and receives streamed responses from an OpenAI language model. The application saves each student's conversations so they can continue studying later.

The project will use TypeScript, Next.js, Tailwind CSS, Better Auth, the native MongoDB Node.js driver, and the OpenAI API. Mongoose will not be used. The server interface will consist of REST endpoints implemented with Next.js Route Handlers.

## 2. Project Goals

- Provide simple, personalized explanations for students.
- Let students request explanations, hints, and short quizzes.
- Provide secure Google authentication.
- Save private chat history for each student.
- Demonstrate a complete full-stack application within a small assignment scope.

## 3. Target Users

The primary user is a student who wants quick help understanding a school or university topic. The MVP does not include teachers, administrators, classrooms, or parent accounts.

## 4. MVP Scope

### Included

- Landing page
- sign-in and sign-out
- Protected student dashboard
- Create, view, rename, and delete a study conversation
- Subject selection
- Three tutoring modes: Explain, Hint, and Quiz
- Text-based chat with streamed OpenAI responses
- Persistent conversation history in MongoDB
- Responsive desktop and mobile interface
- Basic validation, rate limiting, and error handling

### Not Included


- File or PDF uploads
- Retrieval-augmented generation or vector search
- Voice input or text-to-speech
- Image generation
- Teacher and administrator dashboards
- Collaboration between students
- Payments or subscriptions
- Native mobile applications

## 5. Technology Requirements

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

## 6. Functional Requirements

### FR-01: Landing Page

- The system shall display the application's purpose and key features.
- The page shall provide a clear **Continue with Google** action.
- An authenticated user shall be able to navigate directly to the dashboard.

### FR-02: Authentication

- A user shall be able to sign in with a Google account through Better Auth.
- The system shall create or update the user's authentication record after a successful sign-in.
- A user shall be able to sign out.
- Unauthenticated users shall not access the dashboard, conversations, or chat API.
- Authentication secrets and OAuth credentials shall remain server-side.

### FR-03: Dashboard

- The dashboard shall display the signed-in user's name and profile image when available.
- The dashboard shall list only conversations owned by the signed-in user.
- Each list item shall show its title, subject, and last-updated time.
- The user shall be able to create, open, rename, and delete a conversation.
- The dashboard shall display a helpful empty state when no conversations exist.

### FR-04: New Study Conversation

- The user shall select one subject before starting a conversation.
- Initial subjects shall be Mathematics, Science, History, Programming, and General.
- The user shall select one tutoring mode: Explain, Hint, or Quiz.
- The system shall create a conversation owned by the authenticated user.
- A default title may be created from the first message and may later be renamed.

### FR-05: AI Chat

- The user shall be able to submit a text message.
- Empty messages and messages over the configured length limit shall be rejected.
- The server shall send the message history, subject, tutoring mode, and a server-controlled system instruction to OpenAI.
- The assistant response shall stream to the browser as it is generated.
- The UI shall show pending, streaming, completed, and failed states.
- The user shall be able to stop an active generation.
- The completed user and assistant messages shall be stored in MongoDB.
- API keys and system instructions shall not be exposed to the browser.

### FR-06: Tutor Modes

**Explain mode**

- The assistant shall explain the topic clearly and use examples when helpful.
- The response should be appropriate for a student and avoid unnecessary complexity.

**Hint mode**

- The assistant shall guide the student toward an answer instead of immediately solving the entire problem.
- It may ask a short follow-up question when necessary.

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

### Standard JSON Response Shape

Successful non-streaming responses should use:

```json
{
  "data": {}
}
```

Errors should use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The message is required."
  }
}
```

Recommended status codes are `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409`, `429`, and `500`.

## 9. MongoDB Data Requirements

Better Auth collections shall follow its supported MongoDB adapter schema. Application data shall use the following collections.

### `conversations`

```ts
type Conversation = {
  _id: ObjectId;
  userId: string;
  title: string;
  subject: "mathematics" | "science" | "history" | "programming" | "general";
  mode: "explain" | "hint" | "quiz";
  createdAt: Date;
  updatedAt: Date;
};
```

### `messages`

```ts
type ChatMessage = {
  _id: ObjectId;
  conversationId: ObjectId;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};
```

### Required Indexes

```ts
conversations: { userId: 1, updatedAt: -1 }
messages:      { conversationId: 1, createdAt: 1 }
messages:      { userId: 1, conversationId: 1 }
```

The application shall reuse a cached `MongoClient` connection instead of opening a new connection for every request. All identifiers received from the client shall be validated before conversion to `ObjectId`.

## 10. OpenAI Requirements

- The server shall call OpenAI; the browser shall never call OpenAI directly.
- The implementation should use OpenAI's current recommended text-generation API and support streaming.
- The model name shall be configured through an environment variable so it can be changed without editing application code.
- The server shall define the tutor's behavior and safety instructions.
- Only the conversation history required to answer the current question shall be sent to the model.
- The server shall set reasonable output-token limits to control cost and latency.
- Requests shall have timeouts and cancellation support.
- The application shall show a disclaimer that AI responses can be incorrect and should be verified for important academic work.

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
