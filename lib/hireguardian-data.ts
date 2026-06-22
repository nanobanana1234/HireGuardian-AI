import {
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Gauge,
  GraduationCap,
  History,
  Mic2,
  PenLine,
  Route,
  ShieldCheck,
  Target,
  UserCheck,
} from "lucide-react"

export type AgentStatus = "Active" | "Completed" | "Running" | "Waiting approval"

export type AgentId =
  | "resume-agent"
  | "ats-agent"
  | "cover-letter-agent"
  | "job-match-agent"
  | "interview-agent"
  | "application-agent"

export type ActionId =
  | "resume.optimize"
  | "resume.score"
  | "cover-letter.generate"
  | "jobs.match"
  | "interview.simulate"
  | "skills.roadmap"
  | "application.prepare"
  | "application.submit"

export type AgentPermission =
  | "resume.edit"
  | "resume.analyze"
  | "cover-letter.generate"
  | "jobs.match"
  | "interview.simulate"
  | "skills.roadmap"
  | "application.prepare"
  | "application.submit"

export type HireGuardianAgent = {
  id: AgentId
  code: string
  name: string
  shortName: string
  description: string
  status: AgentStatus
  permissions: AgentPermission[]
  denied: AgentPermission[]
  accent: string
  bg: string
}

export type ProtectedActionDefinition = {
  id: ActionId
  agentId: AgentId
  label: string
  terminalFunction: string
  permission: AgentPermission
  requiresApproval: boolean
  outputKind: "resume" | "score" | "letter" | "jobs" | "interview" | "roadmap" | "application"
}

export const agents: HireGuardianAgent[] = [
  {
    id: "resume-agent",
    code: "AG001",
    name: "Resume Agent",
    shortName: "Resume",
    description: "Rewrites, restructures, and improves resume sections while staying inside user-approved facts.",
    status: "Active",
    permissions: ["resume.edit"],
    denied: ["application.submit"],
    accent: "#38bdf8",
    bg: "from-sky-400/20 to-cyan-300/5",
  },
  {
    id: "ats-agent",
    code: "AG002",
    name: "ATS Agent",
    shortName: "ATS",
    description: "Scores resumes against role descriptions and finds missing keywords, skills, and evidence.",
    status: "Completed",
    permissions: ["resume.analyze", "skills.roadmap"],
    denied: ["application.submit"],
    accent: "#22d3ee",
    bg: "from-cyan-300/20 to-blue-300/5",
  },
  {
    id: "cover-letter-agent",
    code: "AG003",
    name: "Cover Letter Agent",
    shortName: "Letter",
    description: "Creates company-specific letters grounded in the resume, job description, and user tone.",
    status: "Active",
    permissions: ["cover-letter.generate"],
    denied: ["application.submit"],
    accent: "#a7f3d0",
    bg: "from-emerald-300/20 to-teal-300/5",
  },
  {
    id: "job-match-agent",
    code: "AG004",
    name: "Job Match Agent",
    shortName: "Match",
    description: "Compares roles, skill coverage, seniority, and missing signals before recommending next steps.",
    status: "Running",
    permissions: ["jobs.match"],
    denied: ["application.submit"],
    accent: "#60a5fa",
    bg: "from-blue-300/20 to-indigo-300/5",
  },
  {
    id: "interview-agent",
    code: "AG005",
    name: "Interview Agent",
    shortName: "Interview",
    description: "Runs mock interview prompts, evaluates answers, and returns feedback with practice drills.",
    status: "Running",
    permissions: ["interview.simulate"],
    denied: ["application.submit"],
    accent: "#f0abfc",
    bg: "from-fuchsia-300/20 to-violet-300/5",
  },
  {
    id: "application-agent",
    code: "AG006",
    name: "Application Agent",
    shortName: "Apply",
    description: "Prepares final application packets and can submit only after explicit human approval.",
    status: "Waiting approval",
    permissions: ["application.prepare", "application.submit"],
    denied: ["resume.edit"],
    accent: "#bef264",
    bg: "from-lime-300/20 to-emerald-300/5",
  },
]

export const actionRegistry: Record<ActionId, ProtectedActionDefinition> = {
  "resume.optimize": {
    id: "resume.optimize",
    agentId: "resume-agent",
    label: "Optimize resume",
    terminalFunction: "resume-optimize",
    permission: "resume.edit",
    requiresApproval: false,
    outputKind: "resume",
  },
  "resume.score": {
    id: "resume.score",
    agentId: "ats-agent",
    label: "Score resume",
    terminalFunction: "ats-score",
    permission: "resume.analyze",
    requiresApproval: false,
    outputKind: "score",
  },
  "cover-letter.generate": {
    id: "cover-letter.generate",
    agentId: "cover-letter-agent",
    label: "Generate cover letter",
    terminalFunction: "cover-letter-generate",
    permission: "cover-letter.generate",
    requiresApproval: false,
    outputKind: "letter",
  },
  "jobs.match": {
    id: "jobs.match",
    agentId: "job-match-agent",
    label: "Match jobs",
    terminalFunction: "jobs-match",
    permission: "jobs.match",
    requiresApproval: false,
    outputKind: "jobs",
  },
  "interview.simulate": {
    id: "interview.simulate",
    agentId: "interview-agent",
    label: "Simulate interview",
    terminalFunction: "interview-simulate",
    permission: "interview.simulate",
    requiresApproval: false,
    outputKind: "interview",
  },
  "skills.roadmap": {
    id: "skills.roadmap",
    agentId: "ats-agent",
    label: "Build skill roadmap",
    terminalFunction: "skills-roadmap",
    permission: "skills.roadmap",
    requiresApproval: false,
    outputKind: "roadmap",
  },
  "application.prepare": {
    id: "application.prepare",
    agentId: "application-agent",
    label: "Prepare application",
    terminalFunction: "application-prepare",
    permission: "application.prepare",
    requiresApproval: false,
    outputKind: "application",
  },
  "application.submit": {
    id: "application.submit",
    agentId: "application-agent",
    label: "Submit application",
    terminalFunction: "application-submit",
    permission: "application.submit",
    requiresApproval: true,
    outputKind: "application",
  },
}

export const navItems = [
  { href: "/", label: "Home", icon: ShieldCheck },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/ats", label: "ATS", icon: ClipboardCheck },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/interview", label: "Interview", icon: Mic2 },
  { href: "/cover-letter", label: "Letters", icon: PenLine },
  { href: "/roadmap", label: "Roadmap", icon: Route },
  { href: "/applications", label: "Apply", icon: UserCheck },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/audit", label: "Audit", icon: History },
]

export const dashboardStats = [
  { label: "Resume score", value: "88", suffix: "/100", icon: ClipboardCheck },
  { label: "Job fit", value: "92", suffix: "%", icon: Target },
  { label: "Readiness", value: "81", suffix: "%", icon: GraduationCap },
  { label: "Verified actions", value: "47", suffix: "", icon: BadgeCheck },
]

export const demoResume = `Rahul Sharma
Software Engineer with 3 years of experience building React, Node.js, and MongoDB products.

Experience
- Built customer dashboards with React, TypeScript, Node.js, and REST APIs.
- Improved API latency and created reusable UI components.
- Worked with MongoDB, authentication, and deployment workflows.

Skills
React, TypeScript, Node.js, Express, MongoDB, Tailwind CSS, REST APIs`

export const demoJobDescription = `Software Engineer role focused on React, Node.js, MongoDB, AWS, Docker, Redis, CI/CD, secure authentication, scalable API design, and clear ownership across product features.`

export function getAgent(agentId: AgentId) {
  return agents.find((agent) => agent.id === agentId)
}

export function getAction(actionId: ActionId) {
  return actionRegistry[actionId]
}
