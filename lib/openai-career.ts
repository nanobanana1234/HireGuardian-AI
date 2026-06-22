import type { ActionId } from "@/lib/hireguardian-data"

type GenerationInput = Record<string, unknown>
type CareerGeneration = {
  output: string
  degraded: boolean
  provider: "openai" | "deterministic-fallback"
  reason?: string
}

const systemPrompt = `You are HireGuardian AI, a trusted multi-agent career assistant.
Return polished, specific career output grounded only in the supplied user facts.
Never invent employers, degrees, certifications, or achievements.
Keep the response practical and ready for the product UI.
Include a short "Terminal3 verification note" that explains which agent action was protected and why.`

export async function generateCareerOutput(actionId: ActionId, input: GenerationInput) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return buildFallback(actionId, input, "OpenAI key is not configured.")
  }

  try {
    const OpenAI = (await import("openai")).default
    const client = new OpenAI({ apiKey })
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({ actionId, ...input }, null, 2),
            },
          ],
        },
      ],
      text: {
        verbosity: "medium",
      },
    })

    if (!response.output_text) {
      return buildFallback(actionId, input, "The model returned no text.")
    }

    return {
      output: response.output_text,
      degraded: false,
      provider: "openai",
    } satisfies CareerGeneration
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown OpenAI error"
    return buildFallback(actionId, input, reason)
  }
}

function buildFallback(actionId: ActionId, input: GenerationInput, reason: string): CareerGeneration {
  return {
    output: buildDeterministicDemoOutput(
      actionId,
      input,
      `Degraded mode: live OpenAI generation was not available. Reason: ${reason}`,
    ),
    degraded: true,
    provider: "deterministic-fallback",
    reason,
  }
}

function buildDeterministicDemoOutput(actionId: ActionId, input: GenerationInput, note: string) {
  const company = String(input.company || "the target company")
  const role = String(input.role || "Software Engineer")
  const skills = String(input.targetSkills || "React, Node.js, MongoDB, secure authentication, APIs")

  if (actionId === "resume.score") {
    return `ATS Score: 88/100

Strong signals
- Clear match for ${role} responsibilities.
- Good evidence around React, Node.js, MongoDB, and product ownership.
- Resume is readable and action-oriented.

Missing keywords
- Docker
- AWS
- Redis
- CI/CD

Recommended rewrite
Add one bullet that proves deployment ownership and one bullet that quantifies API or dashboard impact.

Terminal3 verification note
ATS Agent used the resume.analyze permission only. The signed action does not grant edit or submit permissions.

${note}`
  }

  if (actionId === "cover-letter.generate") {
    return `Dear Hiring Team,

I am excited to apply for the ${role} role at ${company}. My background building React, Node.js, and MongoDB applications maps directly to your need for engineers who can ship user-facing features and dependable backend APIs.

In my recent work, I have built dashboards, reusable UI systems, authentication flows, and API integrations while keeping performance and maintainability in focus. I would bring that same ownership mindset to ${company}, especially around ${skills}.

Thank you for your time. I would welcome the opportunity to discuss how my experience can support your team.

Terminal3 verification note
Cover Letter Agent generated this letter with the cover-letter.generate permission and did not receive permission to submit applications.

${note}`
  }

  if (actionId === "jobs.match") {
    return `Recommended matches

1. Frontend Platform Engineer — 92% fit
   Why: Strong React, TypeScript, dashboard, and design-system overlap.

2. Full Stack Engineer — 88% fit
   Why: Strong Node.js and MongoDB fit; add AWS and Docker evidence.

3. Product Engineer — 84% fit
   Why: Good product ownership signal; quantify delivery outcomes.

Next action
Run the ATS Agent against the highest-fit posting, then let the Resume Agent tailor the top three bullets.

Terminal3 verification note
Job Match Agent used jobs.match only. It cannot edit the profile or submit an application.

${note}`
  }

  if (actionId === "interview.simulate") {
    return `Mock interview set

1. Walk me through a React feature you owned end to end.
2. How would you design authentication for a Node.js API?
3. What tradeoffs did you make when using MongoDB?
4. Explain how you would add Docker and CI/CD to an existing app.

Feedback rubric
- Use a 60-second structure: context, decision, implementation, result.
- Quantify scale, latency, users, or delivery impact.
- Mention one security or reliability tradeoff in every system-design answer.

Terminal3 verification note
Interview Agent used interview.simulate and cannot modify resume data.

${note}`
  }

  if (actionId === "skills.roadmap") {
    return `4-week roadmap

Week 1: Docker
- Containerize a Node + React app.
- Write a Dockerfile and compose file.

Week 2: AWS basics
- Deploy one API and one static frontend.
- Learn IAM, S3, CloudFront, and logging basics.

Week 3: Redis
- Add caching to a job search endpoint.
- Measure latency before and after.

Week 4: CI/CD
- Add lint, build, and deployment checks.
- Document rollback steps.

Terminal3 verification note
ATS Agent created the roadmap from resume gaps. It did not change the user's profile.

${note}`
  }

  if (actionId === "application.prepare" || actionId === "application.submit") {
    return `Application packet for ${company}

Included
- Tailored resume summary for ${role}
- Company-specific cover letter
- Interview prep checklist
- Risk flags: missing Docker/AWS evidence should be addressed before submission

Approval state
The packet is ready for human approval. Submission remains blocked until the user approves the Terminal3-protected action.

Terminal3 verification note
Application Agent can prepare packets. The submit action requires explicit approval and a signed Terminal3 invocation.

${note}`
  }

  return `Optimized resume draft

Professional summary
Software Engineer with 3 years of experience building React, TypeScript, Node.js, and MongoDB products. Strong ownership across dashboard UX, API integration, reusable frontend systems, and secure authentication workflows.

Experience highlights
- Built and maintained React dashboards with reusable components, improving consistency across product workflows.
- Developed Node.js APIs backed by MongoDB for profile, authentication, and application-tracking use cases.
- Improved user-facing performance by tightening API response patterns and reducing duplicated UI logic.
- Collaborated across product and design to ship reliable features with clear documentation.

Keywords to add where truthful
Docker, AWS, Redis, CI/CD, system design, access control.

Terminal3 verification note
Resume Agent used resume.edit permission only. Application submission remains outside this agent's authorization.

${note}`
}
