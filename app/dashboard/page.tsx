import { Gauge } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import AuditTimeline from "@/components/AuditTimeline"
import CareerMemoryPanel from "@/components/CareerMemoryPanel"
import PageHeader from "@/components/PageHeader"
import { AgentActivityRail, StatusRail } from "@/components/StatusRail"

export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader
        icon={Gauge}
        title="Career command dashboard"
        description="Track resume quality, job fit, interview readiness, application status, and Terminal3-authenticated agent actions from one workspace."
      />
      <StatusRail />
      <section className="mx-auto w-full max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
        <CareerMemoryPanel />
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_0.72fr] lg:px-10">
        <ActionConsole
          actionId="application.prepare"
          title="Prepare a verified application packet"
          description="The Application Agent gathers the resume, job description, cover-letter context, interview prep, and risk notes into a packet. Submission stays separate and requires explicit approval."
          compact
        />
        <AgentActivityRail />
      </section>
      <AuditTimeline />
    </AppShell>
  )
}
