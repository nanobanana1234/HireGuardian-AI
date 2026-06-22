"use client"

import { useEffect, useState } from "react"
import { BadgeCheck, KeyRound, Loader2, Network, ShieldCheck, Signature, WalletCards } from "lucide-react"

type Terminal3Status = {
  configured: boolean
  connected: boolean
  mode: string
  environment: string
  nodeUrl?: string
  did?: string
  expectedDid?: string
  authenticatedAt?: string
  sdkPackage: string
  error?: string
  usage?: {
    available?: string
    entries: Array<{
      kind: string
      amount: string
      direction: string
      timestamp: string
    }>
  }
}

const sdkPrimitives = [
  "T3nClient.handshake",
  "T3nClient.authenticate",
  "T3nClient.getUsage",
  "buildDelegationCredential",
  "canonicaliseCredential",
  "signCredential",
  "buildInvocationPreimage",
  "signAgentInvocation",
]

export default function Terminal3Panel() {
  const [status, setStatus] = useState<Terminal3Status | null>(null)

  useEffect(() => {
    fetch("/api/t3/status")
      .then((response) => response.json())
      .then(setStatus)
      .catch((error) =>
        setStatus({
          configured: false,
          connected: false,
          mode: "offline",
          environment: "testnet",
          sdkPackage: "@terminal3/t3n-sdk",
          error: error instanceof Error ? error.message : "Could not load Terminal3 status.",
        }),
      )
  }, [])

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
      <div className="glass-panel rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-100">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold text-white">Terminal3 Agent Auth layer</h2>
                <p className="text-sm text-white/54">{status?.sdkPackage || "@terminal3/t3n-sdk"}</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-white/66">
              HireGuardian uses Terminal3 for authenticated agent sessions, DID-backed identity display, token usage
              reads, permission-scoped delegation credentials, request hashes, and agent signatures for every protected
              career workflow.
            </p>
          </div>

          <div className="grid min-w-full gap-3 sm:grid-cols-2 lg:min-w-[520px]">
            {!status ? (
              <div className="col-span-full flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] p-8 text-white/64">
                <Loader2 className="mr-3 h-5 w-5 animate-spin text-cyan-100" />
                Loading Terminal3 status
              </div>
            ) : (
              <>
                <StatusTile icon={Network} label="Mode" value={status.connected ? "Live SDK" : status.mode} tone="cyan" />
                <StatusTile icon={WalletCards} label="Network" value={status.environment} tone="emerald" />
                <StatusTile icon={KeyRound} label="DID" value={mask(status.did || status.expectedDid || "not configured")} tone="white" />
                <StatusTile
                  icon={BadgeCheck}
                  label="Usage"
                  value={status.usage?.available ? `${status.usage.available} tokens` : status.connected ? "connected" : "unavailable"}
                  tone="emerald"
                />
              </>
            )}
          </div>
        </div>

        {status?.error ? (
          <div className="mt-5 rounded-2xl border border-amber-200/18 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50/78">
            Live SDK connection did not complete in this environment. Protected actions require live Terminal3
            authentication before signing. Error: {status.error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sdkPrimitives.map((primitive) => (
            <div key={primitive} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-4">
              <Signature className="h-4 w-4 shrink-0 text-cyan-100" />
              <span className="truncate font-mono text-xs text-white/68">{primitive}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatusTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  tone: "cyan" | "emerald" | "white"
}) {
  const color = tone === "emerald" ? "text-emerald-100" : tone === "cyan" ? "text-cyan-100" : "text-white"

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-2 text-xs uppercase text-white/38">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        {label}
      </div>
      <div className="mt-3 truncate font-mono text-sm text-white/78">{value}</div>
    </div>
  )
}

function mask(value: string) {
  if (value.length <= 22) return value
  return `${value.slice(0, 12)}...${value.slice(-7)}`
}
