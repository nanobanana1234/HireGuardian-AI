import { CheckCircle2, CircleDashed, Clock3, ShieldCheck } from "lucide-react"

import { agents, dashboardStats } from "@/lib/hireguardian-data"

export function StatusRail() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
      {dashboardStats.map((stat, index) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className="soft-panel reveal-up rounded-2xl p-5"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                <Icon className="h-4 w-4" />
              </div>
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
            </div>
            <div className="mt-7 flex items-end gap-1">
              <span className="text-4xl font-semibold leading-none text-white">{stat.value}</span>
              <span className="pb-1 text-sm text-white/55">{stat.suffix}</span>
            </div>
            <p className="mt-2 text-sm text-white/62">{stat.label}</p>
          </div>
        )
      })}
    </section>
  )
}

export function AgentActivityRail() {
  return (
      <div className="glass-panel min-w-0 rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Agent monitor</h2>
          <p className="mt-1 text-sm text-white/58">Identity, permissions, status, and approval state stay separate.</p>
        </div>
        <CircleDashed className="h-5 w-5 animate-spin text-cyan-100" />
      </div>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.045] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-white">
                <span className="absolute h-2 w-2 -right-0.5 -top-0.5 rounded-full" style={{ backgroundColor: agent.accent }} />
                {agent.code.slice(-2)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{agent.name}</p>
                <p className="truncate text-xs text-white/48">{agent.permissions.join(", ")}</p>
              </div>
            </div>
            <span className="ml-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/72">
              {agent.status === "Completed" ? <CheckCircle2 className="h-3 w-3 text-emerald-200" /> : <Clock3 className="h-3 w-3 text-cyan-100" />}
              {agent.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
