import { NextResponse } from "next/server"
import { z } from "zod"

import { assertCsrf, getOrCreateSession } from "@/lib/app-session"
import { jsonError } from "@/lib/api-helpers"
import { getApplications, saveApplications } from "@/lib/user-data-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const applicationSchema = z.object({
  id: z.string().max(120),
  company: z.string().max(120),
  role: z.string().max(120),
  status: z.enum(["Applied", "Interview Scheduled", "Rejected", "Offer Received"]),
  updatedAt: z.string().max(80),
})

const payloadSchema = z.object({
  applications: z.array(applicationSchema).max(25),
})

export async function GET() {
  const session = await getOrCreateSession()
  const applications = await getApplications(session.userId)
  return NextResponse.json({ applications })
}

export async function PUT(request: Request) {
  try {
    const session = await getOrCreateSession()
    assertCsrf(request, session)
    const body = payloadSchema.parse(await request.json())
    const applications = await saveApplications(session.userId, body.applications)
    return NextResponse.json({ applications })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid application tracker payload.", issues: error.issues }, { status: 400 })
    }

    return jsonError(error)
  }
}
