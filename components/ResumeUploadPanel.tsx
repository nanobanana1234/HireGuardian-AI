"use client"

import { useState } from "react"
import { FileUp, Loader2, UploadCloud } from "lucide-react"

import { getClientSession } from "@/lib/client-session"
import type { CareerMemory } from "@/lib/user-data"

type UploadResponse = {
  upload?: {
    id: string
    fileName: string
    storage: string
    storageUrl?: string
  }
  memory?: CareerMemory
  error?: string
}

export default function ResumeUploadPanel() {
  const [fileName, setFileName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")

  async function uploadResume(file: File | undefined) {
    if (!file) return

    setFileName(file.name)
    setIsUploading(true)
    setStatus("")
    setError("")

    try {
      const session = await getClientSession()
      const form = new FormData()
      form.append("resume", file)
      const response = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "X-HireGuardian-CSRF": session.csrfToken,
        },
        body: form,
      })
      const payload = (await response.json()) as UploadResponse

      if (!response.ok) throw new Error(payload.error || "Resume upload failed.")
      if (payload.memory) {
        window.dispatchEvent(new CustomEvent("hireguardian-memory-updated", { detail: payload.memory }))
      }

      setStatus(`Uploaded ${payload.upload?.fileName || file.name} to ${payload.upload?.storage || "session storage"}.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Resume upload failed.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-100">
              <FileUp className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">Resume upload</h2>
              <p className="text-sm text-white/58">PDF and text resumes feed the signed agent workflows</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-white/68">
            Upload a resume to extract text, save it to your secure app session, and reuse it automatically in Resume,
            ATS, Job Match, Interview, and Application agents.
          </p>
        </div>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {isUploading ? "Uploading" : "Choose resume"}
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.txt,.md,.csv,.json,text/plain,application/pdf"
            disabled={isUploading}
            onChange={(event) => uploadResume(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/64">
        <p>{fileName || "No resume selected yet."}</p>
        {status ? <p className="mt-2 text-emerald-100">{status}</p> : null}
        {error ? <p className="mt-2 text-rose-100">{error}</p> : null}
      </div>
    </section>
  )
}
