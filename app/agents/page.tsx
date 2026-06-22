import { Bot } from "lucide-react"

import AgentCards from "@/components/AgentCards"
import AppShell from "@/components/AppShell"
import PageHeader from "@/components/PageHeader"
import Terminal3Panel from "@/components/Terminal3Panel"

export default function AgentsPage() {
  return (
    <AppShell>
      <PageHeader
        icon={Bot}
        title="Agent monitor"
        description="Inspect each agent identity, permission scope, denied capabilities, Terminal3 SDK status, and proof primitives used by protected actions."
      />
      <Terminal3Panel />
      <AgentCards />
    </AppShell>
  )
}
