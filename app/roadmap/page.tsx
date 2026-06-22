import { Route } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"

export default function RoadmapPage() {
  return (
    <AppShell>
      <PageHeader
        icon={Route}
        title="Skill roadmap"
        description="Turn ATS gaps into a week-by-week learning plan while keeping profile updates and application steps under separate permissions."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <ActionConsole
          actionId="skills.roadmap"
          title="Build a learning roadmap"
          description="The roadmap is derived from missing skills and role requirements, then logged with the Terminal3 action proof."
        />
      </section>
    </AppShell>
  )
}
