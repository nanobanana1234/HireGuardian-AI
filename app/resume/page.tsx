import { FileText } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
import ResumeUploadPanel from "@/components/ResumeUploadPanel"

export default function ResumePage() {
  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="Resume builder"
        description="Rewrite the resume with the Resume Agent while keeping factual edits separate from ATS analysis and application submission."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="space-y-6">
          <ResumeUploadPanel />
          <ActionConsole
            actionId="resume.optimize"
            title="Optimize resume for a target role"
            description="The Resume Agent can edit resume language and structure, but cannot score or submit applications. Terminal3 signs the edit permission for accountability."
          />
        </div>
      </section>
    </AppShell>
  )
}
