import { randomUUID } from "crypto"

import { getDatabase } from "@/lib/mongodb"
import type { ActionId, AgentId } from "@/lib/hireguardian-data"

export type AuditEvent = {
  id: string
  createdAt: string
  userId: string
  agentId: AgentId
  actionId: ActionId
  actionLabel: string
  status: "authorized" | "pending_approval" | "denied" | "completed" | "degraded" | "failed"
  terminalMode: string
  terminalDid?: string
  permission: string
  proofId?: string
  requestHash?: string
  signature?: string
  summary: string
  outputPreview?: string
}

const memoryEvents: AuditEvent[] = []

export async function recordAuditEvent(event: Omit<AuditEvent, "id" | "createdAt">) {
  const auditEvent: AuditEvent = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  }

  const db = await getDatabase().catch(() => null)

  if (db) {
    await db.collection<AuditEvent>("audit_events").insertOne(auditEvent)
  } else {
    memoryEvents.unshift(auditEvent)
    memoryEvents.splice(50)
  }

  return auditEvent
}

export async function listAuditEvents(userId: string, limit = 25) {
  const db = await getDatabase().catch(() => null)

  if (!db) {
    return memoryEvents.filter((event) => event.userId === userId).slice(0, limit)
  }

  return db
    .collection<AuditEvent>("audit_events")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}
