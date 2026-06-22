import { History } from "lucide-react"

import AppShell from "@/components/AppShell"
import AuditTimeline from "@/components/AuditTimeline"
import PageHeader from "@/components/PageHeader"

export default function AuditPage() {
  return (
    <AppShell>
      <PageHeader
        icon={History}
        title="Audit logs"
        description="Review signed actions, approval waits, permission denials, request hashes, proof IDs, and generated output summaries."
      />
      <AuditTimeline />
    </AppShell>
  )
}
