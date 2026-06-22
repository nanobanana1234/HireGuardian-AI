import type { LucideIcon } from "lucide-react"

type PageHeaderProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function PageHeader({ icon: Icon, title, description, action }: PageHeaderProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-8 pt-32 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
      <div className="max-w-3xl reveal-up">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-normal text-white md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">{description}</p>
      </div>
      {action ? <div className="reveal-up">{action}</div> : null}
    </section>
  )
}
