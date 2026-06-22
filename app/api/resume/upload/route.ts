import { createHash } from "crypto"
import { NextResponse } from "next/server"

import { assertCsrf, getOrCreateSession } from "@/lib/app-session"
import { jsonError } from "@/lib/api-helpers"
import { getCareerMemory, saveCareerMemory, saveResumeUpload } from "@/lib/user-data-store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const maxUploadBytes = 4 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const session = await getOrCreateSession()
    assertCsrf(request, session)

    const form = await request.formData()
    const file = form.get("resume")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 })
    }

    if (file.size > maxUploadBytes) {
      return NextResponse.json({ error: "Resume must be 4MB or smaller." }, { status: 413 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const resumeText = await extractResumeText(file, bytes)
    const cloudinary = await uploadToCloudinary(file, bytes).catch(() => null)
    const upload = await saveResumeUpload({
      userId: session.userId,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      resumeText,
      storage: cloudinary ? "cloudinary" : "mongodb",
      storageUrl: cloudinary?.secure_url,
    })

    const currentMemory = await getCareerMemory(session.userId)
    const memory = await saveCareerMemory(session.userId, {
      ...currentMemory,
      resumeText,
      resumeUploadId: upload.id,
    })

    return NextResponse.json({ upload, memory })
  } catch (error) {
    return jsonError(error)
  }
}

async function extractResumeText(file: File, bytes: Buffer) {
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse")
    const parser = new PDFParse({ data: new Uint8Array(bytes) })
    const parsed = await parser.getText()
    await parser.destroy()
    return parsed.text.trim().slice(0, 20000)
  }

  if (type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name)) {
    return bytes.toString("utf8").trim().slice(0, 20000)
  }

  return `Uploaded resume file: ${file.name}. Text extraction is supported for PDF and text-based resumes.`
}

async function uploadToCloudinary(file: File, bytes: Buffer) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return null

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const folder = "hireguardian/resumes"
  const publicId = createHash("sha256").update(`${file.name}:${timestamp}`).digest("hex").slice(0, 24)
  const signatureBase = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = createHash("sha1").update(signatureBase).digest("hex")
  const form = new FormData()
  form.append("file", new Blob([new Uint8Array(bytes)], { type: file.type || "application/octet-stream" }), file.name)
  form.append("api_key", apiKey)
  form.append("timestamp", timestamp)
  form.append("folder", folder)
  form.append("public_id", publicId)
  form.append("signature", signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  })

  if (!response.ok) return null
  return (await response.json()) as { secure_url?: string }
}
