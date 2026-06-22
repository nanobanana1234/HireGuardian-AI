import { createHmac, randomBytes, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const sessionCookieName = "hg_session"
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30
const csrfHeaderName = "x-hireguardian-csrf"
const approvalMaxAgeMs = 1000 * 60 * 10

export type AppSession = {
  id: string
  userId: string
  csrfToken: string
  createdAt: number
}

type ApprovalPayload = {
  sessionId: string
  actionId: string
  requestHash: string
  nonce: string
  expiresAt: number
}

export async function getOrCreateSession() {
  const cookieStore = await cookies()
  const existing = cookieStore.get(sessionCookieName)?.value
  const parsed = existing ? verifySignedJson<AppSession>(existing) : null
  const session = parsed || createSession()

  if (!parsed) {
    cookieStore.set(sessionCookieName, signJson(session), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.VERCEL === "1",
      path: "/",
      maxAge: sessionMaxAgeSeconds,
    })
  }

  return session
}

export function assertCsrf(request: Request, session: AppSession) {
  const provided = request.headers.get(csrfHeaderName)

  if (!provided || !safeEqual(provided, session.csrfToken)) {
    throw new Response(JSON.stringify({ error: "Invalid or missing CSRF token." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export function createApprovalToken(session: AppSession, actionId: string, inputSummary: string) {
  const payload: ApprovalPayload = {
    sessionId: session.id,
    actionId,
    requestHash: hashInput(inputSummary),
    nonce: randomId(12),
    expiresAt: Date.now() + approvalMaxAgeMs,
  }

  return signJson(payload)
}

export function verifyApprovalToken(token: string | undefined, session: AppSession, actionId: string, inputSummary: string) {
  if (!token) return { valid: false, reason: "missing" as const }

  const payload = verifySignedJson<ApprovalPayload>(token)
  if (!payload) return { valid: false, reason: "invalid" as const }
  if (payload.expiresAt < Date.now()) return { valid: false, reason: "expired" as const }
  if (payload.sessionId !== session.id) return { valid: false, reason: "session" as const }
  if (payload.actionId !== actionId) return { valid: false, reason: "action" as const }
  if (payload.requestHash !== hashInput(inputSummary)) return { valid: false, reason: "input" as const }

  return { valid: true, reason: "ok" as const }
}

export function clientIp(request: NextRequest | Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || request.headers.get("x-real-ip") || "unknown"
}

function createSession(): AppSession {
  const id = randomId(24)

  return {
    id,
    userId: `user_${randomId(12)}`,
    csrfToken: randomId(24),
    createdAt: Date.now(),
  }
}

function signJson(value: unknown) {
  const body = Buffer.from(JSON.stringify(value)).toString("base64url")
  return `${body}.${sign(body)}`
}

function verifySignedJson<T>(token: string): T | null {
  const [body, signature] = token.split(".")
  if (!body || !signature || !safeEqual(signature, sign(body))) return null

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T
  } catch {
    return null
  }
}

function sign(value: string) {
  return createHmac("sha256", appSecret()).update(value).digest("base64url")
}

function hashInput(value: string) {
  return createHmac("sha256", appSecret()).update(value).digest("base64url")
}

function appSecret() {
  return (
    process.env.HIREGUARDIAN_SESSION_SECRET ||
    process.env.T3N_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "hireguardian-development-secret"
  )
}

function randomId(bytes: number) {
  return randomBytes(bytes).toString("base64url")
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}
