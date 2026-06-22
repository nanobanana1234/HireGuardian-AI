import { NextResponse } from "next/server"

export function jsonError(error: unknown) {
  if (error instanceof Response) return error

  const message = error instanceof Error ? error.message : "Unexpected server error."
  return NextResponse.json({ error: sanitizeError(message) }, { status: 500 })
}

export function sanitizeError(message: string) {
  return message
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, "sk-[redacted]")
    .replace(/0x[a-fA-F0-9]{24,}/g, "0x[redacted]")
    .replace(/mongodb\+srv:\/\/[^"'\s]+/g, "mongodb+srv://[redacted]")
}

export function masked(value?: string) {
  if (!value) return undefined
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}...${value.slice(-6)}`
}
