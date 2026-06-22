import { z } from "zod"

import { actionRegistry } from "@/lib/hireguardian-data"

const actionIds = Object.keys(actionRegistry) as [keyof typeof actionRegistry, ...(keyof typeof actionRegistry)[]]

export const agentRunSchema = z.object({
  actionId: z.enum(actionIds),
  approvalToken: z.string().max(2000).optional(),
  input: z
    .object({
      resumeText: z.string().max(20000).optional(),
      jobDescription: z.string().max(12000).optional(),
      company: z.string().max(160).optional(),
      role: z.string().max(160).optional(),
      experience: z.string().max(4000).optional(),
      targetSkills: z.string().max(4000).optional(),
      answer: z.string().max(8000).optional(),
      notes: z.string().max(8000).optional(),
      memory: z.string().max(8000).optional(),
      resumeUploadId: z.string().max(160).optional(),
    })
    .passthrough(),
})

export type AgentRunRequest = z.infer<typeof agentRunSchema>
