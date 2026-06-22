import AppShell from "@/components/AppShell"
import HeroDashboard, { HomeProductPreview } from "@/components/HeroDashboard"
import { StatusRail } from "@/components/StatusRail"

export default function Home() {
  return (
    <AppShell>
      <HeroDashboard />
      <StatusRail />
      <HomeProductPreview />
    </AppShell>
  )
}
