import { NextResponse } from "next/server"

import { masked } from "@/lib/api-helpers"
import { getTerminal3Status } from "@/lib/terminal3"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const status = await getTerminal3Status()
  return NextResponse.json({
    ...status,
    did: masked(status.did),
    expectedDid: masked(status.expectedDid),
    error: status.error,
  })
}
