"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowRight, BadgeCheck, CheckCircle2, Loader2, LockKeyhole, Send, Sparkles, TriangleAlert } from "lucide-react"

import { actionRegistry, demoJobDescription, demoResume, getAgent, type ActionId } from "@/lib/hireguardian-data"
import { csrfHeaders } from "@/lib/client-session"
import type { CareerMemory } from "@/lib/user-data"

type ActionConsoleProps = {
  actionId: ActionId
  title: string
  description: string
  compact?: boolean
}

type RunResult = {
  output?: string
  authorization?: {
    status: string
    message?: string
    approvalToken?: string
    proof?: {
      proofId: string
      mode: string
      requestHash: string
      agentSignature: string
      terminalFunction: string
      permission: string
      credential: {
        contract: string
        functions: string[]
        scopes: string[]
        validUntil: string
      }
      sdkPrimitives: string[]
    }
  }
  audit?: {
    id: string
    createdAt: string
  }
  generation?: {
    degraded: boolean
    provider: string
    reason?: string
  }
  error?: string
}

export default function ActionConsole({ actionId, title, description, compact = false }: ActionConsoleProps) {
  const action = actionRegistry[actionId]
  const agent = getAgent(action.agentId)
  const [company, setCompany] = useState("Google")
  const [role, setRole] = useState("Software Engineer")
  const [resumeText, setResumeText] = useState(demoResume)
  const [jobDescription, setJobDescription] = useState(demoJobDescription)
  const [memory, setMemory] = useState<CareerMemory | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)

  const requiresApproval = action.requiresApproval
  const outputLines = useMemo(() => (result?.output || "").split("\n").filter((line) => line.trim().length > 0), [result])

  useEffect(() => {
    let cancelled = false

    const applyMemory = (nextMemory: CareerMemory) => {
      setMemory(nextMemory)
      if (nextMemory.resumeText) setResumeText(nextMemory.resumeText)
    }

    fetch("/api/memory", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && payload.memory) applyMemory(payload.memory)
      })
      .catch(() => undefined)

    const onMemoryUpdate = (event: Event) => {
      applyMemory((event as CustomEvent<CareerMemory>).detail)
    }
    window.addEventListener("hireguardian-memory-updated", onMemoryUpdate)

    return () => {
      cancelled = true
      window.removeEventListener("hireguardian-memory-updated", onMemoryUpdate)
    }
  }, [])

  async function runAgent(approvalToken?: string) {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: await csrfHeaders(),
        body: JSON.stringify({
          actionId,
          approvalToken,
          input: {
            company,
            role,
            resumeText,
            jobDescription,
            targetSkills: memory?.technologies || "React, Node.js, MongoDB, Docker, AWS, Redis, CI/CD",
            memory: memory
              ? `${memory.experienceLevel}; roles=${memory.preferredRoles}; companies=${memory.targetCompanies}; skills=${memory.technologies}`
              : undefined,
            resumeUploadId: memory?.resumeUploadId,
          },
        }),
      })
      const payload = await response.json()
      setResult(payload)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "Request failed." })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className={`glass-panel rounded-3xl ${compact ? "p-4" : "p-5 md:p-6"}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-white/58">
                {agent?.name} · {action.permission}
              </p>
            </div>
          </div>
          <p className="text-sm leading-6 text-white/68">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
            <BadgeCheck className="h-3.5 w-3.5" />
            Terminal3 protected
          </span>
          {requiresApproval ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-50">
              Approval token required
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase text-white/46">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-200/45"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase text-white/46">Target role</span>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-200/45"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase text-white/46">Resume facts</span>
            <textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              rows={compact ? 6 : 9}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-200/45"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase text-white/46">Job description</span>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={compact ? 4 : 6}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-200/45"
            />
          </label>
          <button
            onClick={() => runAgent()}
            disabled={isRunning}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-2xl transition hover:-translate-y-0.5 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Run protected agent
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/48 p-4">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                <LockKeyhole className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Verified output</p>
                <p className="text-xs text-white/48">{action.terminalFunction}</p>
              </div>
            </div>
            {result?.authorization?.proof ? (
              <span className="rounded-full bg-emerald-300/12 px-3 py-1 text-xs text-emerald-100">
                {result.authorization.proof.mode}
              </span>
            ) : null}
          </div>

          {!result && !isRunning ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-white/58">
              <Sparkles className="mb-4 h-8 w-8 text-cyan-100" />
              <p className="max-w-sm text-sm leading-6">
                Run the agent to generate career output with Terminal3 permission checks, signed proof, and audit logging.
              </p>
            </div>
          ) : null}

          {isRunning ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-white/68">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-cyan-100" />
              <p className="text-sm">Authorizing agent identity and generating career output...</p>
            </div>
          ) : null}

          {result?.authorization?.status === "pending_approval" ? (
            <div className="rounded-2xl border border-amber-200/20 bg-amber-300/10 p-5 text-amber-50">
              <TriangleAlert className="mb-4 h-6 w-6" />
              <p className="font-medium">Human approval required</p>
              <p className="mt-2 text-sm leading-6 text-amber-50/76">{result.authorization.message}</p>
              <button
                onClick={() => {
                  runAgent(result.authorization?.approvalToken)
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-amber-950 transition hover:bg-white"
              >
                Approve and sign
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {result?.error ? (
            <div className="rounded-2xl border border-rose-200/20 bg-rose-300/10 p-5 text-rose-50">
              <TriangleAlert className="mb-4 h-6 w-6" />
              <p className="font-medium">Request failed</p>
              <p className="mt-2 text-sm leading-6 text-rose-50/76">{result.error}</p>
            </div>
          ) : null}

          {result?.output ? (
            <div className="space-y-5">
              <div className="space-y-2 rounded-2xl bg-white/[0.045] p-4">
                {outputLines.map((line, index) => (
                  <p
                    key={`${line}-${index}`}
                    className={`text-sm leading-6 ${
                      line.endsWith(":") || index === 0 ? "font-semibold text-white" : "text-white/72"
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {result.authorization?.proof ? (
                <div className="rounded-2xl border border-emerald-200/15 bg-emerald-300/8 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-100">
                    <CheckCircle2 className="h-4 w-4" />
                    Terminal3 proof
                  </div>
                  <dl className="grid gap-3 text-xs text-white/62 sm:grid-cols-2">
                    <ProofRow label="Proof" value={result.authorization.proof.proofId} />
                    <ProofRow label="Permission" value={result.authorization.proof.permission} />
                    <ProofRow label="Request hash" value={result.authorization.proof.requestHash} />
                    <ProofRow label="Agent signature" value={result.authorization.proof.agentSignature} />
                    <ProofRow label="Contract" value={result.authorization.proof.credential.contract} />
                    <ProofRow label="Audit" value={result.audit?.id || "recorded"} />
                  </dl>
                </div>
              ) : null}
              {result.generation?.degraded ? (
                <div className="rounded-2xl border border-amber-200/15 bg-amber-300/8 p-4 text-sm leading-6 text-amber-50/80">
                  Live OpenAI generation was unavailable, so the UI is showing a deterministic fallback. Reason:{" "}
                  {result.generation.reason || "not provided"}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProofRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-white/38">{label}</dt>
      <dd className="mt-1 truncate font-mono text-white/78">{value || "n/a"}</dd>
    </div>
  )
}
