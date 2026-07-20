# AI Study Buddy

AI Study Buddy is a full-stack academic web application where students register, explore community study resources, create private AI-powered study sessions, and receive intelligent tutoring across multiple subjects and modes. The platform integrates two AI features: a contextual AI Chat Tutor and an AI Study Recommendation Engine.

**Live:** https://aistudybuddy-blond.vercel.app

---

## Features

- Sticky navbar with login/logout — adapts links based on auth state
- Landing page with 9 sections: Hero, Statistics, Features, How It Works, Subjects, AI Features, Testimonials, FAQ, CTA + Footer
- Email/password registration and login with demo auto-fill
- Google OAuth sign-in
- Public explore page with search, subject/difficulty filters, sort options, and "Load more" pagination
- Resource cards — image/gradient, title, description, meta, skeleton loaders, 4-per-row on desktop
- Public resource details page — hero image, overview, key info sidebar, related resources
- Protected dashboard with conversation list, session count chart (Recharts), and AI recommendations widget
- Protected add resource form with title, descriptions, subject, difficulty, tags, image URL
- Protected manage resources table with view and delete actions
- AI Chat Tutor — Explain, Hint, and Quiz modes with streaming responses, stop, and retry
- AI Recommendation Engine — analyzes conversation history and suggests relevant resources
- About and Contact pages

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Client data fetching | TanStack Query |
| Charts | Recharts |
| Authentication | Better Auth (email/password + Google OAuth) |
| Validation | Zod |
| Database | MongoDB with the native Node.js driver |
| AI provider | OpenAI API (gpt-4o-mini) or Ollama (self-hosted) |
| Deployment | Vercel + MongoDB Atlas |

---

## Pages & Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/login` | Public | Login and registration with demo fill |
| `/explore` | Public | Browse, search, and filter study resources |
| `/resources/:id` | Public | Resource details, overview, related resources |
| `/about` | Public | About the platform |
| `/contact` | Public | Contact form and info |
| `/dashboard` | Protected | Conversations, subject chart, recommendations |
| `/chat/[conversationId]` | Protected (owner) | AI study chat interface |
| `/resources/add` | Protected | Add a new study resource |
| `/resources/manage` | Protected | Manage and delete your resources |

---

## AI Features

### 1. AI Chat Tutor

A contextual conversational tutor integrated into each study session.

- **Explain mode** — clear, student-friendly explanation with examples
- **Hint mode** — guided hints without revealing the complete solution
- **Quiz mode** — generates up to five questions, delays answers until attempted, provides feedback
- Streaming responses via Server-Sent Events with stop and retry controls
- Full conversation history preserved across sessions (bounded to last 30 messages)
- Input moderation (OpenAI) or server-controlled safety instructions (Ollama)

### 2. AI Study Recommendation Engine

Context-aware resource recommendations based on the student's conversation history.

- Aggregates subject frequency from past sessions to build a personalized context prompt
- Calls the AI model with a structured JSON prompt to rank relevant resources
- Returns up to 3 recommendations with an AI-generated reason for each
- Shown on the dashboard with a Refresh button; results cached for 5 minutes via TanStack Query

---

## REST API

All endpoints return JSON except `/api/chat`, which returns a streaming SSE response. Protected endpoints derive `userId` from the server session — never from client input.

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` / `POST` | `/api/auth/[...all]` | Better Auth operations | Via Better Auth |
| `GET` | `/api/conversations` | Cursor-paginate the current user's conversations | Required |
| `POST` | `/api/conversations` | Create an owned conversation | Required |
| `GET` | `/api/conversations/:id` | Return one owned conversation and a message page | Owner only |
| `PATCH` | `/api/conversations/:id` | Rename or update subject/mode | Owner only |
| `DELETE` | `/api/conversations/:id` | Transactionally delete conversation and messages | Owner only |
| `POST` | `/api/chat` | Validate, moderate, rate-limit, persist, and stream a tutor response | Required |
| `GET` | `/api/resources` | List resources with search, filter, sort, cursor pagination | Public |
| `POST` | `/api/resources` | Create a new study resource | Required |
| `GET` | `/api/resources/:id` | Get a single resource (increments view count) | Public |
| `PATCH` | `/api/resources/:id` | Update an owned resource | Owner only |
| `DELETE` | `/api/resources/:id` | Delete an owned resource | Owner only |
| `GET` | `/api/resources/mine` | List all resources owned by current user | Required |
| `POST` | `/api/recommendations` | Generate AI-powered resource recommendations | Required |

**Success response:** `{ "data": ... }`
**Error response:** `{ "error": { "code": "...", "message": "..." } }`
**Chat SSE events:** `start`, `delta`, `done`, `error`

---

## Authorization & Security

- Every protected handler validates the Better Auth session and derives `userId` from it.
- Every owned-resource query includes both the resource ID and authenticated `userId`. Missing and non-owned resources both return `404` to avoid exposing existence.
- Zod validates all bodies, path parameters, cursors, enum values, and size limits before `ObjectId` conversion.
- User and AI messages render as plain text; arbitrary HTML is never executed.
- OpenAI mode moderates input before persistence. Ollama mode uses server-controlled safety instructions.
- Chat requests are rate-limited per user with MongoDB atomic counters (default: 10/minute).
- AI-provider calls use bounded history, output limits, timeouts, and cancellation. OpenAI mode uses `store: false`.

---

## Local Setup

Requirements: Node.js 20.9+, npm, a MongoDB replica set or Atlas database, and either an OpenAI API key or a running Ollama instance.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values (see below).
3. Create indexes: `npm run db:indexes`
4. Start the dev server: `npm run dev`
5. Open `http://localhost:3000`, register, and create a study session.

---

## Environment Variables

```dotenv
MONGODB_URI=
MONGODB_DB_NAME=ai_study_buddy

BETTER_AUTH_SECRET=          # min 32 characters
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI provider — set AI_PROVIDER=openai or AI_PROVIDER=ollama
# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Ollama (self-hosted)
# AI_PROVIDER=ollama
# OLLAMA_BASE_URL=http://127.0.0.1:11434
# OLLAMA_MODEL=llama3.1

# Tuneable limits
CHAT_MESSAGE_MAX_CHARS=4000
CHAT_RATE_LIMIT_PER_MINUTE=10
CHAT_MAX_OUTPUT_TOKENS=1200
CHAT_TIMEOUT_MS=45000
```

For Google OAuth: add `{BETTER_AUTH_URL}/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console.

---

## Verification

```sh
npm run lint
npm run typecheck
npm run build
```
