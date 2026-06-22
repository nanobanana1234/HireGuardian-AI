import { PenLine } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"

export default function CoverLetterPage() {
  return (
    <AppShell>
      <PageHeader
        icon={PenLine}
        title="Cover letter generator"
        description="Create company-specific letters grounded in resume evidence, target-role requirements, and a signed agent permission boundary."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <ActionConsole
          actionId="cover-letter.generate"
          title="Generate a personalized cover letter"
          description="The Cover Letter Agent can generate letters, but Terminal3 keeps application submission outside this action."
        />
      </section>
    </AppShell>
  )
}
