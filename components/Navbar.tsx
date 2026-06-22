"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Menu, ShieldCheck, X } from "lucide-react"

import { navItems } from "@/lib/hireguardian-data"

type TerminalStatus = {
  configured: boolean
  connected: boolean
  mode: string
  did?: string
  expectedDid?: string
  error?: string
}

export default function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [status, setStatus] = useState<TerminalStatus | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    let cancelled = false

    fetch("/api/t3/status")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setStatus(data)
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({ configured: false, connected: false, mode: "offline" })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const nav = useMemo(() => navItems.slice(0, 9), [])
  const activeLabel = !status ? "T3 checking" : status.connected ? "T3 live" : status.configured ? "T3 offline" : "T3 setup"
  const activeDid = maskDid(status?.did || status?.expectedDid)

  return (
    <>
      <header
        className={`fixed top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full border py-2 backdrop-blur-md transition-all duration-300 md:flex ${
          isScrolled
            ? "max-w-7xl border-white/15 bg-slate-950/70 px-3 shadow-2xl"
            : "max-w-7xl border-white/5 bg-white/[0.035] px-4 shadow-none"
        }`}
        style={{
          willChange: "transform",
          backfaceVisibility: "hidden",
          perspective: "1000px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Link
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? "ml-3" : ""
          }`}
          href="/"
          aria-label="HireGuardian AI home"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-cyan-100">
            <span className="absolute h-9 w-9 rounded-full border border-cyan-200/30 pulse-ring" />
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold tracking-normal text-white">HireGuardian AI</span>
        </Link>

        <nav className="absolute inset-y-0 left-52 right-52 hidden flex-1 flex-row items-center justify-center gap-1 text-sm font-medium text-white/70 md:flex">
          {nav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                className={`relative inline-flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${
                  isActive ? "bg-white/12 text-white" : "text-white/68 hover:bg-white/8 hover:text-white"
                }`}
                href={item.href}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="relative z-20">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="z-50 flex items-center gap-3">
          <Link
            href="/agents"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${
              status?.connected
                ? "border-emerald-300/35 bg-emerald-300/15 text-emerald-100"
                : "border-cyan-300/25 bg-cyan-300/10 text-cyan-50"
            }`}
            title={status?.error || "Terminal3 Agent Auth SDK status"}
          >
            <span className={`h-2 w-2 rounded-full ${status?.connected ? "bg-emerald-300" : "bg-cyan-300"}`} />
            <span>{activeLabel}</span>
            {activeDid ? <span className="font-mono text-xs text-white/58">{activeDid}</span> : null}
          </Link>
        </div>
      </header>

      <header
        className={`fixed top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full border px-4 py-3 backdrop-blur-md transition-all duration-300 md:hidden ${
          isScrolled ? "border-white/15 bg-slate-950/78 shadow-lg" : "border-white/8 bg-white/[0.04] shadow-none"
        }`}
        style={{
          left: "1rem",
          right: "1rem",
          width: "calc(100% - 2rem)",
        }}
      >
        <Link className="flex items-center justify-center gap-2" href="/">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/10 text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-white">HireGuardian</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/[0.055] transition-colors hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm md:hidden">
          <div className="glass-panel absolute left-4 right-4 top-24 rounded-2xl p-4 shadow-2xl">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-white/82 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-cyan-100" />
                    {item.label}
                  </Link>
                )
              })}
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/70">
                <span className="text-white">{activeLabel}</span>
                {activeDid ? <span className="ml-2 font-mono text-xs">{activeDid}</span> : null}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

function maskDid(value?: string) {
  if (!value) return ""
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}...${value.slice(-6)}`
}
