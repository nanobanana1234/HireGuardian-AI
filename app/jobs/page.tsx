import { BriefcaseBusiness } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"

export default function JobsPage() {
  return (
    <AppShell>
      <PageHeader
        icon={BriefcaseBusiness}
        title="Job matches"
        description="Compare target roles with verified resume facts, calculate fit, and surface missing proof before any application is prepared."
      />
      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <ActionConsole
          actionId="jobs.match"
          title="Find best-fit job targets"
          description="The Job Match Agent can recommend roles and fit scores, but it cannot edit the resume or submit applications."
        />
      </section>
    </AppShell>
  )
}
