import { Lock, ShieldCheck, XCircle } from "lucide-react"

import { agents } from "@/lib/hireguardian-data"

export default function AgentCards() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-2 xl:grid-cols-3 lg:px-10">
      {agents.map((agent) => (
        <article key={agent.id} className={`soft-panel rounded-3xl bg-gradient-to-br ${agent.bg} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-white/48">{agent.code}</div>
              <h2 className="mt-2 text-xl font-semibold text-white">{agent.name}</h2>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10" style={{ color: agent.accent }}>
              <ShieldCheck className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-5 min-h-[72px] text-sm leading-6 text-white/66">{agent.description}</p>
          <div className="mt-5 space-y-3">
            {agent.permissions.map((permission) => (
              <div key={permission} className="flex items-center gap-2 text-sm text-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                <span>{permission}</span>
              </div>
            ))}
            {agent.denied.map((permission) => (
              <div key={permission} className="flex items-center gap-2 text-sm text-rose-100/82">
                <XCircle className="h-4 w-4" />
                <span>{permission}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/52">
            <Lock className="h-3.5 w-3.5" />
            Terminal3 policy enforced per action
          </div>
        </article>
      ))}
    </section>
  )
}
