import { NextResponse } from "next/server"

import { getDatabase } from "@/lib/mongodb"
import { getTerminal3Status } from "@/lib/terminal3"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get("deep") === "1"
  const terminal3 = deep ? await getTerminal3Status() : null
  const mongodb = deep ? await checkMongo() : null

  return NextResponse.json({
    ok: true,
    app: "HireGuardian AI",
    services: {
      openai: {
        configured: Boolean(process.env.OPENAI_API_KEY),
      },
      session: {
        configured: Boolean(process.env.HIREGUARDIAN_SESSION_SECRET),
      },
      terminal3: {
        configured: Boolean(process.env.T3N_API_KEY),
        connected: terminal3?.connected,
        mode: terminal3?.mode,
      },
      mongodb: {
        configured: Boolean(process.env.MONGODB_URI),
        connected: mongodb,
      },
      cloudinary: {
        configured: Boolean(
          process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
        ),
      },
    },
  })
}

async function checkMongo() {
  try {
    const db = await getDatabase().catch(() => null)
    if (!db) return false

    await db.command({ ping: 1 })
    return true
  } catch {
    return false
  }
}
