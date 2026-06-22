# HireGuardian AI

HireGuardian AI is a production-ready multi-agent career assistant for resumes, ATS checks, job matching, cover letters, mock interviews, learning roadmaps, application tracking, and approval-gated application submission.

The core hackathon focus is Terminal3 Agent Auth SDK usage. Every protected career action is routed through a server-side permission layer that verifies the agent identity, checks the action scope, creates a signed Terminal3 proof, and records a private audit event for the current app session.

Production: https://hireguardian-ai.vercel.app

## What It Does

- Builds and rewrites resumes from user-provided facts.
- Scores resumes against job descriptions for ATS readiness.
- Compares candidate evidence with target roles.
- Generates cover letters and interview practice rounds.
- Uploads PDF or text resumes and reuses the extracted resume text across agent runs.
- Stores career memory, including preferred roles, skills, companies, experience level, and uploaded resume context.
- Tracks applications through Applied, Interview Scheduled, Rejected, and Offer Received states.
- Blocks high-trust application submission behind a human approval token.
- Shows Terminal3 agent identities, permissions, proof metadata, and live SDK status.
- Keeps audit logs scoped to the current signed app session.

## How It Works

1. The browser initializes a signed anonymous app session through `GET /api/session`.
2. Mutating requests include the `X-HireGuardian-CSRF` token from that session.
3. The user runs a career agent from the UI.
4. `POST /api/agent/run` validates the request, rate-limits it, checks agent permissions, and calls Terminal3.
5. Normal protected actions return signed proof immediately.
6. `application.submit` first returns `authorization.status = "pending_approval"` with a short-lived approval token.
7. When the user clicks `Approve and sign`, the server verifies the token against the same session, action, and input summary, then signs the action.
8. OpenAI generates the career output. If OpenAI is unavailable, the app returns a deterministic degraded response instead of crashing.
9. The audit timeline records the action, permission, proof id, request hash, signature preview, and generation status for that session only.

## Terminal3 SDK Integration

The SDK integration lives in `frontend/lib/terminal3.ts` and uses `@terminal3/t3n-sdk` on the server only.

Implemented SDK primitives:

- `setEnvironment("testnet")`
- `loadWasmComponent()`
- `T3nClient.handshake()`
- `T3nClient.authenticate(createEthAuthInput(...))`
- `T3nClient.getUsage()`
- `buildDelegationCredential()`
- `canonicaliseCredential()`
- `signCredential()`
- `buildInvocationPreimage()`
- `signAgentInvocation()`

Security details:

- The authenticated Terminal3 DID must match `T3N_DID`.
- Each HireGuardian agent gets a deterministic derived signing key from the tenant key and agent id.
- Signed proof is only created when the live Terminal3 SDK is connected.
- No fabricated proof fallback is used for protected actions.
- DID, signatures, and provider errors are masked before they reach the UI.
- High-trust approval tokens expire, are session-bound, action-bound, and input-bound.

## Pages

- `/` - product home and judge demo flow
- `/dashboard` - career memory and command dashboard
- `/resume` - resume upload and resume agent
- `/ats` - ATS scoring
- `/jobs` - job matching
- `/interview` - mock interview and voice interview mode
- `/cover-letter` - cover letter generation
- `/roadmap` - skill roadmap generation
- `/applications` - tracker, application packet prep, and approval-gated submit
- `/agents` - Terminal3 status and agent permission monitor
- `/audit` - private session audit timeline

## API Routes

- `GET /api/session` - creates or returns the signed app session and CSRF token
- `GET /api/health?deep=1` - checks OpenAI, Terminal3, MongoDB, and Cloudinary configuration
- `GET /api/t3/status` - returns masked Terminal3 SDK connection status
- `POST /api/agent/run` - runs a protected agent action
- `GET /api/audit` - returns current-session audit events
- `GET /api/memory` - returns current-session career memory
- `PUT /api/memory` - saves current-session career memory
- `GET /api/applications` - returns current-session application tracker data
- `PUT /api/applications` - saves current-session application tracker data
- `POST /api/resume/upload` - parses and stores PDF or text resume uploads

## Data And Storage

- MongoDB stores session-scoped career memory, application tracker rows, audit events, and resume uploads when `MONGODB_URI` is reachable.
- The app falls back to in-memory storage during local network failures so demos still run.
- Cloudinary upload is optional. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to store uploaded resume files in Cloudinary.

## Environment

Create `frontend/.env.local` from `frontend/.env.example`.

Required:

```bash
OPENAI_API_KEY=
T3N_API_KEY=
T3N_DID=
T3N_ENVIRONMENT=testnet
MONGODB_URI=
HIREGUARDIAN_SESSION_SECRET=
```

Recommended:

```bash
OPENAI_MODEL=gpt-4o-mini
T3N_CONTRACT_NAME=tee:hireguardian
MONGODB_DB=hireguardian_ai
```

Optional resume file storage:

```bash
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Do not commit `.env.local`; it is ignored by git.

## Local Development

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Production-style local check:

```bash
cd frontend
npm run build
npm run start -- -p 3003
```

## Deployment

This is a single Next.js app with API routes, so the frontend and backend deploy together on Vercel. A separate Render backend is not required unless the API routes are split into a standalone service later.

```bash
cd frontend
vercel --prod --yes
```

Set the same environment variables in Vercel before deploying. `HIREGUARDIAN_SESSION_SECRET` must be a separate random secret in production.

## Verification

Completed before final deployment:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev --json` with 0 vulnerabilities
- Local `GET /api/health?deep=1`
- Local CSRF denial for missing token
- Local memory save/load
- Local application tracker save/load
- Local resume text upload and memory propagation
- Local `application.submit` pending approval flow
- Local approval-token tamper denial
- Local `application.submit` signed proof with Terminal3 `live-sdk`
- Local private audit scoping by session user
- Playwright desktop and mobile smoke test
- Playwright resume upload, dashboard memory save, application tracker, approval-gated submit, voice interview proof, and audit page checks
- Playwright console check with 0 relevant app warnings or errors
- Production deployment aliased to `https://hireguardian-ai.vercel.app`
- Production `GET /api/health?deep=1` confirms OpenAI configured, Terminal3 `live-sdk`, and MongoDB connected
- Production approval flow signs with Terminal3 `live-sdk`
- Production UI smoke confirms `T3 live`, `Live SDK`, no framework overlay, no horizontal overflow, and 0 relevant console logs
