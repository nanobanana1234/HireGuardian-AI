import Link from "next/link"
import { ArrowRight, BadgeCheck, BrainCircuit, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"

import { AgentActivityRail } from "@/components/StatusRail"

export default function HeroDashboard() {
  return (
    <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:px-10">
      <div className="reveal-up min-w-0 w-full max-w-full">
        <div className="mb-7 flex max-w-full flex-wrap items-center gap-3 text-sm text-white/68">
          <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            <span className="truncate">Terminal3 Agent Auth SDK</span>
          </span>
          <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2">
            <LockKeyhole className="h-4 w-4 text-cyan-100" />
            <span className="truncate">Signed career actions</span>
          </span>
        </div>
        <h1 className="max-w-[11ch] text-balance text-4xl font-semibold leading-[1.04] tracking-normal text-white sm:max-w-none sm:text-5xl md:text-7xl">
          Trusted AI career agents with <span className="text-sheen">verifiable identity.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
          HireGuardian AI is a multi-agent career operating system for resumes, ATS checks, job matches, cover
          letters, interviews, applications, and audit logs. Every important action is permissioned and signed with
          Terminal3.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-slate-950 shadow-2xl transition hover:-translate-y-0.5 hover:bg-cyan-50"
          >
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/agents"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.07] px-7 py-4 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/12"
          >
            View agent permissions
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["6", "specialized agents"],
            ["8", "protected actions"],
            ["100%", "approval audit trail"],
          ].map(([value, label]) => (
            <div key={label} className="border-l border-cyan-200/22 pl-4">
              <div className="text-3xl font-semibold text-white">{value}</div>
              <div className="mt-1 text-sm text-white/52">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="reveal-up float-slow min-w-0 w-full max-w-full">
        <div className="glass-panel rounded-[2rem] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/48">Judge demo flow</p>
              <h2 className="mt-1 text-2xl font-semibold text-white">Verified application packet</h2>
            </div>
            <BadgeCheck className="h-7 w-7 text-emerald-200" />
          </div>
          <div className="space-y-3">
            {[
              ["Resume Agent", "Improved resume summary", "complete"],
              ["ATS Agent", "Score 88/100, missing Docker/AWS", "complete"],
              ["Job Match Agent", "Google match 92%", "running"],
              ["Interview Agent", "Mock round generated", "running"],
              ["Application Agent", "Waiting for human approval", "approval"],
            ].map(([agent, task, state]) => (
              <div key={agent} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.05] p-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    state === "approval" ? "bg-amber-300/12 text-amber-100" : "bg-cyan-300/10 text-cyan-100"
                  }`}
                >
                  {state === "approval" ? <LockKeyhole className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{agent}</p>
                  <p className="truncate text-xs text-white/52">{task}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/64">
                  {state}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-emerald-200/15 bg-emerald-300/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
              <BrainCircuit className="h-4 w-4" />
              Terminal3 verification
            </div>
            <p className="mt-2 text-xs leading-5 text-white/62">
              Agent identity, permission, approval status, request hash, and signature are attached to each action log.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeProductPreview() {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
      <div className="glass-panel min-w-0 rounded-3xl p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-white">Career operating system, not a static resume builder.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/66">
          The app separates career workflows into focused pages, while a shared Terminal3 authorization layer keeps
          identity, permissions, approvals, signatures, and audit logs consistent across every agent.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            "Resume generation with fact discipline",
            "ATS score and missing-keyword analysis",
            "Job match scoring by role requirements",
            "Human-gated application submission",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-4">
              <ShieldCheck className="h-4 w-4 text-emerald-200" />
              <span className="text-sm text-white/72">{item}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="min-w-0">
        <AgentActivityRail />
      </div>
    </section>
  )
}
