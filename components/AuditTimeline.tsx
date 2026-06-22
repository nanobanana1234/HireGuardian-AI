"use client"

import { useEffect, useState } from "react"
import { History, Loader2, ShieldCheck } from "lucide-react"

type AuditEvent = {
  id: string
  createdAt: string
  agentId: string
  actionLabel: string
  status: string
  terminalMode: string
  permission: string
  proofId?: string
  requestHash?: string
  signature?: string
  summary: string
}

export default function AuditTimeline() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/audit")
      .then((response) => response.json())
      .then((data) => setEvents(data.events || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Audit logs</h2>
            <p className="mt-1 text-sm text-white/58">MongoDB-backed when configured, in-memory during local demos.</p>
          </div>
          <History className="h-5 w-5 text-cyan-100" />
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-white/60">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-cyan-100" />
            Loading audit events
          </div>
        ) : null}

        {!loading && events.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/12 bg-white/[0.035] text-center">
            <ShieldCheck className="mb-4 h-8 w-8 text-cyan-100" />
            <p className="text-sm text-white/68">Run any protected agent workflow to create the first signed audit event.</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-white/9 bg-white/[0.045] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{event.actionLabel}</span>
                    <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100">
                      {event.status}
                    </span>
                    <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-xs text-cyan-100">
                      {event.terminalMode}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/62">{event.summary}</p>
                </div>
                <time className="text-xs text-white/42">{new Date(event.createdAt).toLocaleString()}</time>
              </div>
              <dl className="mt-4 grid gap-3 border-t border-white/8 pt-4 text-xs text-white/54 md:grid-cols-4">
                <AuditField label="Agent" value={event.agentId} />
                <AuditField label="Permission" value={event.permission} />
                <AuditField label="Proof" value={event.proofId || "policy"} />
                <AuditField label="Signature" value={event.signature || event.requestHash || "pending"} />
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function AuditField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-white/36">{label}</dt>
      <dd className="mt-1 truncate font-mono text-white/68">{value}</dd>
    </div>
  )
}
