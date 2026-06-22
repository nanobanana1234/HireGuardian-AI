import type { ReactNode } from "react"

import GradientBlinds from "@/components/GradientBlinds"
import Navbar from "@/components/Navbar"

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="fixed inset-0 flex h-full w-full items-center justify-center">
        <GradientBlinds
          gradientColors={["#030712", "#082f49", "#155e75", "#2563eb", "#0f172a"]}
          angle={14}
          noise={0.24}
          blindCount={14}
          blindMinWidth={48}
          spotlightRadius={0.42}
          spotlightSoftness={1.55}
          spotlightOpacity={0.38}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="screen"
        />
      </div>
      <div className="ambient-grid pointer-events-none fixed inset-0 z-[1]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_50%_0%,rgba(125,211,252,0.16),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.1),rgba(2,6,23,0.82)_76%,#020617)]" />
      <Navbar />
      <div className="relative z-10">{children}</div>
    </main>
  )
}
