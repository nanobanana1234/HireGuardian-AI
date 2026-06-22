import { ClipboardCheck } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"

export default function AtsPage() {
  return (
    <AppShell>
      <PageHeader
        icon={ClipboardCheck}
        title="ATS score checker"
        description="Score a resume against a target job, identify missing keywords, and keep analysis permissions separate from resume editing."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <ActionConsole
          actionId="resume.score"
          title="Run ATS analysis"
          description="The ATS Agent can analyze and score the resume, but Terminal3 prevents it from modifying profile data or submitting applications."
        />
      </section>
    </AppShell>
  )
}
