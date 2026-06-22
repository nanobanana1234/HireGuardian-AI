import { NextResponse } from "next/server"

import { getOrCreateSession } from "@/lib/app-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getOrCreateSession()

  return NextResponse.json({
    userId: session.userId,
    csrfToken: session.csrfToken,
    createdAt: session.createdAt,
  })
}
