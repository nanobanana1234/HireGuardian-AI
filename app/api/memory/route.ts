import { NextResponse } from "next/server"
import { z } from "zod"

import { assertCsrf, getOrCreateSession } from "@/lib/app-session"
import { jsonError } from "@/lib/api-helpers"
import { getCareerMemory, saveCareerMemory } from "@/lib/user-data-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const memorySchema = z.object({
  preferredRoles: z.string().max(500),
  technologies: z.string().max(1000),
  experienceLevel: z.string().max(180),
  targetCompanies: z.string().max(500),
  resumeText: z.string().max(20000).optional(),
  resumeUploadId: z.string().max(160).optional(),
})

export async function GET() {
  const session = await getOrCreateSession()
  const memory = await getCareerMemory(session.userId)
  return NextResponse.json({ memory })
}

export async function PUT(request: Request) {
  try {
    const session = await getOrCreateSession()
    assertCsrf(request, session)
    const body = memorySchema.parse(await request.json())
    const memory = await saveCareerMemory(session.userId, body)
    return NextResponse.json({ memory })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid memory payload.", issues: error.issues }, { status: 400 })
    }

    return jsonError(error)
  }
}
