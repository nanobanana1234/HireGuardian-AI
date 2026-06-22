import { NextResponse } from "next/server"

import { getOrCreateSession } from "@/lib/app-session"
import { listAuditEvents } from "@/lib/audit-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getOrCreateSession()
  const events = await listAuditEvents(session.userId, 50)
  return NextResponse.json({ events })
}
