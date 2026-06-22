import { randomUUID } from "crypto"

import { getDatabase } from "@/lib/mongodb"
import { defaultApplications, defaultCareerMemory, type CareerMemory, type TrackedApplication } from "@/lib/user-data"

export type ResumeUpload = {
  id: string
  userId: string
  fileName: string
  mimeType: string
  size: number
  resumeText: string
  storage: "mongodb" | "cloudinary"
  storageUrl?: string
  createdAt: string
}

const memoryFallback = new Map<string, CareerMemory>()
const applicationsFallback = new Map<string, TrackedApplication[]>()
const uploadsFallback = new Map<string, ResumeUpload[]>()

export async function getCareerMemory(userId: string) {
  const db = await getDatabase().catch(() => null)
  if (!db) return memoryFallback.get(userId) || defaultCareerMemory

  const stored = await db.collection<CareerMemory & { userId: string }>("career_memory").findOne({ userId })
  return stored ? sanitizeMemory(stored) : defaultCareerMemory
}

export async function saveCareerMemory(userId: string, memory: CareerMemory) {
  const next = sanitizeMemory({ ...memory, updatedAt: new Date().toISOString() })
  const db = await getDatabase().catch(() => null)

  if (!db) {
    memoryFallback.set(userId, next)
    return next
  }

  await db
    .collection<CareerMemory & { userId: string }>("career_memory")
    .updateOne({ userId }, { $set: { ...next, userId } }, { upsert: true })

  return next
}

export async function getApplications(userId: string) {
  const db = await getDatabase().catch(() => null)
  if (!db) return applicationsFallback.get(userId) || defaultApplications

  const stored = await db.collection<{ userId: string; applications: TrackedApplication[] }>("application_trackers").findOne({ userId })
  return stored?.applications?.length ? stored.applications : defaultApplications
}

export async function saveApplications(userId: string, applications: TrackedApplication[]) {
  const next = applications.map((application) => ({
    ...application,
    company: application.company.slice(0, 120),
    role: application.role.slice(0, 120),
  }))
  const db = await getDatabase().catch(() => null)

  if (!db) {
    applicationsFallback.set(userId, next)
    return next
  }

  await db.collection("application_trackers").updateOne({ userId }, { $set: { userId, applications: next } }, { upsert: true })
  return next
}

export async function saveResumeUpload(upload: Omit<ResumeUpload, "id" | "createdAt">) {
  const next: ResumeUpload = {
    ...upload,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const db = await getDatabase().catch(() => null)

  if (!db) {
    const uploads = uploadsFallback.get(upload.userId) || []
    uploads.unshift(next)
    uploadsFallback.set(upload.userId, uploads.slice(0, 5))
    return next
  }

  await db.collection<ResumeUpload>("resume_uploads").insertOne(next)
  return next
}

function sanitizeMemory(memory: CareerMemory) {
  return {
    preferredRoles: String(memory.preferredRoles || defaultCareerMemory.preferredRoles).slice(0, 500),
    technologies: String(memory.technologies || defaultCareerMemory.technologies).slice(0, 1000),
    experienceLevel: String(memory.experienceLevel || defaultCareerMemory.experienceLevel).slice(0, 180),
    targetCompanies: String(memory.targetCompanies || defaultCareerMemory.targetCompanies).slice(0, 500),
    resumeText: memory.resumeText ? String(memory.resumeText).slice(0, 20000) : undefined,
    resumeUploadId: memory.resumeUploadId ? String(memory.resumeUploadId).slice(0, 160) : undefined,
    updatedAt: memory.updatedAt,
  }
}
