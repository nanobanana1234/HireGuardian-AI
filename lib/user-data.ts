export type CareerMemory = {
  preferredRoles: string
  technologies: string
  experienceLevel: string
  targetCompanies: string
  resumeText?: string
  resumeUploadId?: string
  updatedAt?: string
}

export type TrackerStatus = "Applied" | "Interview Scheduled" | "Rejected" | "Offer Received"

export type TrackedApplication = {
  id: string
  company: string
  role: string
  status: TrackerStatus
  updatedAt: string
}

export const defaultCareerMemory: CareerMemory = {
  preferredRoles: "Software Engineer, AI Product Engineer",
  technologies: "React, TypeScript, Node.js, MongoDB, secure agent workflows",
  experienceLevel: "3 years",
  targetCompanies: "Google, Microsoft, Terminal3 ecosystem startups",
}

export const defaultApplications: TrackedApplication[] = [
  {
    id: "google-se",
    company: "Google",
    role: "Software Engineer",
    status: "Applied",
    updatedAt: "Today",
  },
  {
    id: "microsoft-ai",
    company: "Microsoft",
    role: "AI Product Engineer",
    status: "Interview Scheduled",
    updatedAt: "Yesterday",
  },
  {
    id: "startup-platform",
    company: "Terminal3 ecosystem startup",
    role: "Full-stack Agent Engineer",
    status: "Offer Received",
    updatedAt: "This week",
  },
]
