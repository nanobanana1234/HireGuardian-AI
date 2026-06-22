"use client"

import { useEffect, useState } from "react"
import { BriefcaseBusiness, CalendarClock, CheckCircle2, CircleDot, Trophy, XCircle } from "lucide-react"

import { csrfHeaders } from "@/lib/client-session"
import { defaultApplications, type TrackedApplication, type TrackerStatus } from "@/lib/user-data"

const statuses: TrackerStatus[] = ["Applied", "Interview Scheduled", "Rejected", "Offer Received"]

const statusStyle: Record<TrackerStatus, string> = {
  Applied: "border-cyan-200/20 bg-cyan-300/10 text-cyan-50",
  "Interview Scheduled": "border-amber-200/20 bg-amber-300/10 text-amber-50",
  Rejected: "border-rose-200/20 bg-rose-300/10 text-rose-50",
  "Offer Received": "border-emerald-200/20 bg-emerald-300/10 text-emerald-50",
}

const statusIcon = {
  Applied: CircleDot,
  "Interview Scheduled": CalendarClock,
  Rejected: XCircle,
  "Offer Received": Trophy,
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState(defaultApplications)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    fetch("/api/applications", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && payload.applications?.length) setApplications(payload.applications)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Could not load applications.")
      })

    return () => {
      cancelled = true
    }
  }, [])

  function updateStatus(id: string, status: TrackerStatus) {
    const next = applications.map((application) =>
      application.id === id ? { ...application, status, updatedAt: "Just now" } : application,
    )

    setApplications(next)
    saveApplications(next)
  }

  async function saveApplications(next: TrackedApplication[]) {
    try {
      const response = await fetch("/api/applications", {
        method: "PUT",
        headers: await csrfHeaders(),
        body: JSON.stringify({ applications: next }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save application tracker.")
      setError("")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save application tracker.")
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300/10 text-lime-100">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">Application tracker</h2>
              <p className="text-sm text-white/58">Applied, interview, rejected, and offer states</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-white/68">
            Track application outcomes separately from the protected submit action. Status updates are stored in the
            session data store and can be paired with audit records from Terminal3.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Session saved
        </span>
      </div>

      <div className="grid gap-3">
        {applications.map((application) => {
          const Icon = statusIcon[application.status]

          return (
            <article
              key={application.id}
              className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/38 p-4 md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-white">{application.company}</h3>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${statusStyle[application.status]}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {application.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/58">
                  {application.role} · updated {application.updatedAt}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(application.id, status)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                      status === application.status
                        ? statusStyle[status]
                        : "border-white/10 bg-white/[0.04] text-white/62 hover:border-cyan-200/35 hover:text-white"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </div>
      {error ? <p className="mt-4 rounded-2xl border border-rose-200/20 bg-rose-300/10 p-4 text-sm text-rose-50">{error}</p> : null}
    </section>
  )
}
