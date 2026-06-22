import { Mic2 } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
import VoiceInterviewMode from "@/components/VoiceInterviewMode"

export default function InterviewPage() {
  return (
    <AppShell>
      <PageHeader
        icon={Mic2}
        title="Interview simulator"
        description="Generate a role-specific mock interview, answer rubric, and focused practice plan from the same career facts used by the other agents."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="space-y-6">
          <VoiceInterviewMode />
          <ActionConsole
            actionId="interview.simulate"
            title="Run a mock interview round"
            description="The Interview Agent creates prompts and feedback without modifying application materials. Its scope is signed separately."
          />
        </div>
      </section>
    </AppShell>
  )
}
