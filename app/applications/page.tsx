import { UserCheck } from "lucide-react"

import ActionConsole from "@/components/ActionConsole"
import ApplicationTracker from "@/components/ApplicationTracker"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"

export default function ApplicationsPage() {
  return (
    <AppShell>
      <PageHeader
        icon={UserCheck}
        title="Application approval"
        description="Prepare and submit application packets through a human-gated Terminal3 action. The submit action does not proceed until the user approves."
      />
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:px-10">
        <ApplicationTracker />
        <ActionConsole
          actionId="application.prepare"
          title="Prepare application packet"
          description="The Application Agent creates a packet with the tailored resume, cover letter, risk flags, and interview prep notes."
          compact
        />
        <ActionConsole
          actionId="application.submit"
          title="Submit protected application"
          description="This is the high-trust action. Terminal3 requires the Application Agent identity, application.submit permission, and explicit human approval before it signs the request."
          compact
        />
      </section>
    </AppShell>
  )
}
