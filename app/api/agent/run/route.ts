import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { assertCsrf, clientIp, getOrCreateSession } from "@/lib/app-session"
import { recordAuditEvent } from "@/lib/audit-store"
import { jsonError } from "@/lib/api-helpers"
import { actionRegistry, getAgent } from "@/lib/hireguardian-data"
import { generateCareerOutput } from "@/lib/openai-career"
import { checkRateLimit } from "@/lib/rate-limit"
import { authorizeProtectedAction } from "@/lib/terminal3"
import { agentRunSchema } from "@/lib/validation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await getOrCreateSession()
    assertCsrf(request, session)

    const rateLimit = checkRateLimit(`agent:${session.id}:${clientIp(request)}`, 18, 60_000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many agent requests. Please wait before trying again.", resetAt: rateLimit.resetAt },
        { status: 429 },
      )
    }

    const body = agentRunSchema.parse(await request.json())
    const action = actionRegistry[body.actionId]
    const agent = getAgent(action.agentId)

    if (!agent) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 })
    }

    const inputSummary = summarizeInput(body.input)
    const authorization = await authorizeProtectedAction({
      actionId: body.actionId,
      approvalToken: body.approvalToken,
      inputSummary,
      session,
    })

    if (authorization.status === "pending_approval") {
      await recordAuditEvent({
        userId: session.userId,
        agentId: action.agentId,
        actionId: body.actionId,
        actionLabel: action.label,
        status: "pending_approval",
        terminalMode: "approval-required",
        permission: action.permission,
        summary: authorization.message,
      })

      return NextResponse.json({ authorization })
    }

    if (authorization.status === "denied") {
      await recordAuditEvent({
        userId: session.userId,
        agentId: action.agentId,
        actionId: body.actionId,
        actionLabel: action.label,
        status: "denied",
        terminalMode: "policy-denied",
        permission: action.permission,
        summary: authorization.message,
      })

      return NextResponse.json({ authorization }, { status: 403 })
    }

    const generation = await generateCareerOutput(body.actionId, body.input)
    const audit = await recordAuditEvent({
      userId: session.userId,
      agentId: action.agentId,
      actionId: body.actionId,
      actionLabel: action.label,
      status: generation.degraded ? "degraded" : "completed",
      terminalMode: authorization.proof.mode,
      terminalDid: authorization.proof.tenantDid,
      permission: action.permission,
      proofId: authorization.proof.proofId,
      requestHash: authorization.proof.requestHash,
      signature: authorization.proof.agentSignature,
      summary: inputSummary,
      outputPreview: generation.output.slice(0, 260),
    })

    return NextResponse.json({
      output: generation.output,
      generation: {
        degraded: generation.degraded,
        reason: generation.reason,
        provider: generation.provider,
      },
      agent,
      action,
      authorization,
      audit,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid request.", issues: error.issues }, { status: 400 })
    }

    return jsonError(error)
  }
}

function summarizeInput(input: Record<string, unknown>) {
  const parts = [
    input.company ? `company=${input.company}` : undefined,
    input.role ? `role=${input.role}` : undefined,
    input.resumeText ? `resume=${String(input.resumeText).length} chars` : undefined,
    input.jobDescription ? `job=${String(input.jobDescription).length} chars` : undefined,
    input.targetSkills ? `skills=${String(input.targetSkills).slice(0, 80)}` : undefined,
  ].filter(Boolean)

  return parts.length ? parts.join("; ") : "Career workflow request"
}
