"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Loader2, Save, Sparkles } from "lucide-react"

import { csrfHeaders } from "@/lib/client-session"
import { defaultCareerMemory } from "@/lib/user-data"

export default function CareerMemoryPanel() {
  const [memory, setMemory] = useState(defaultCareerMemory)
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    fetch("/api/memory", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled || !payload.memory) return
        setMemory(payload.memory)
        if (payload.memory.updatedAt) setSavedAt(new Date(payload.memory.updatedAt).toLocaleString())
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Could not load memory.")
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function saveMemory() {
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch("/api/memory", {
        method: "PUT",
        headers: await csrfHeaders(),
        body: JSON.stringify(memory),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not save memory.")
      setMemory(payload.memory)
      setSavedAt(new Date(payload.memory.updatedAt).toLocaleString())
      window.dispatchEvent(new CustomEvent("hireguardian-memory-updated", { detail: payload.memory }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save memory.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-100">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">Career memory</h2>
              <p className="text-sm text-white/58">Persistent profile facts for every agent run</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-white/68">
            Store preferred roles, technologies, experience level, and target companies so the career agents keep a
            consistent user context across sessions.
          </p>
        </div>
        <button
          onClick={saveMemory}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving" : "Save memory"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <MemoryField
          label="Preferred roles"
          value={memory.preferredRoles}
          onChange={(preferredRoles) => setMemory((current) => ({ ...current, preferredRoles }))}
        />
        <MemoryField
          label="Experience level"
          value={memory.experienceLevel}
          onChange={(experienceLevel) => setMemory((current) => ({ ...current, experienceLevel }))}
        />
        <MemoryField
          label="Technologies"
          value={memory.technologies}
          onChange={(technologies) => setMemory((current) => ({ ...current, technologies }))}
        />
        <MemoryField
          label="Target companies"
          value={memory.targetCompanies}
          onChange={(targetCompanies) => setMemory((current) => ({ ...current, targetCompanies }))}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-cyan-100" />
          Agent context
        </div>
        <p className="mt-2 text-sm leading-6 text-white/68">
          {memory.experienceLevel} experience targeting {memory.preferredRoles}; strongest evidence in{" "}
          {memory.technologies}; preferred companies: {memory.targetCompanies}.
        </p>
        <p className="mt-3 text-xs text-white/42">{savedAt ? `Saved ${savedAt}` : "Saved to this secure app session after you click Save"}</p>
        {error ? <p className="mt-3 text-xs text-rose-100">{error}</p> : null}
      </div>
    </section>
  )
}

function MemoryField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase text-white/46">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-200/45"
      />
    </label>
  )
}
