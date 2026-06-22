"use client"

import { useMemo, useRef, useState } from "react"
import { AudioLines, Loader2, Mic2, ShieldCheck, SkipForward, Square, Volume2 } from "lucide-react"

import { csrfHeaders } from "@/lib/client-session"
import { demoJobDescription, demoResume } from "@/lib/hireguardian-data"

type WebSpeechRecognitionResult = {
  readonly isFinal: boolean
  readonly [index: number]: { transcript: string }
}

type WebSpeechRecognitionEvent = {
  readonly resultIndex: number
  readonly results: {
    readonly length: number
    readonly [index: number]: WebSpeechRecognitionResult
  }
}

type WebSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type WebSpeechWindow = Window & {
  SpeechRecognition?: new () => WebSpeechRecognition
  webkitSpeechRecognition?: new () => WebSpeechRecognition
}

type AgentPayload = {
  output?: string
  authorization?: {
    proof?: {
      mode: string
      permission: string
      proofId: string
    }
  }
  error?: string
}

type Terminal3ProofSummary = NonNullable<AgentPayload["authorization"]>["proof"]

const fallbackQuestions = [
  "Walk me through the most relevant project in your resume for this role.",
  "How would you design a secure and observable API workflow for this product?",
  "Which missing skill would you close first, and how would you prove progress in two weeks?",
]

export default function VoiceInterviewMode() {
  const recognitionRef = useRef<WebSpeechRecognition | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState(fallbackQuestions)
  const [transcript, setTranscript] = useState("")
  const [agentOutput, setAgentOutput] = useState("")
  const [proof, setProof] = useState<Terminal3ProofSummary | null>(null)
  const [error, setError] = useState("")

  const activeQuestion = questions[questionIndex] || questions[0]
  const speechAvailable = typeof window !== "undefined" && "speechSynthesis" in window
  const recognitionAvailable = useMemo(() => {
    if (typeof window === "undefined") return false
    const speechWindow = window as WebSpeechWindow
    return Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
  }, [])

  const feedback = useMemo(() => {
    const words = transcript.trim().split(/\s+/).filter(Boolean)
    if (!words.length) return "Answer feedback appears after you speak or type a response."
    if (words.length < 30) return "Good start. Add a concrete situation, action, result, and one metric before moving on."
    if (!/\d|percent|%|latency|users|revenue|time|days|weeks/i.test(transcript)) {
      return "Clear answer. Strengthen it with one measurable result or business impact."
    }
    return "Strong answer shape. It includes enough detail for the Interview Agent to score evidence and follow up."
  }, [transcript])

  async function generateRound() {
    setIsGenerating(true)
    setError("")
    setTranscript("")

    try {
      const response = await fetch("/api/agent/run", {
        method: "POST",
        headers: await csrfHeaders(),
        body: JSON.stringify({
          actionId: "interview.simulate",
          input: {
            company: "Google",
            role: "Software Engineer",
            resumeText: demoResume,
            jobDescription: demoJobDescription,
            notes: "Create concise voice-friendly interview questions.",
          },
        }),
      })
      const payload = (await response.json()) as AgentPayload

      if (!response.ok) {
        throw new Error(payload.error || "Interview Agent request failed.")
      }

      const parsedQuestions = extractQuestions(payload.output || "")
      setAgentOutput(payload.output || "")
      setQuestions(parsedQuestions.length ? parsedQuestions : fallbackQuestions)
      setQuestionIndex(0)
      setProof(payload.authorization?.proof || null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Voice interview setup failed.")
    } finally {
      setIsGenerating(false)
    }
  }

  function speakQuestion() {
    if (!speechAvailable) {
      setError("Speech synthesis is not available in this browser.")
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(activeQuestion)
    utterance.rate = 0.92
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  function startListening() {
    if (!recognitionAvailable) {
      setError("Speech recognition is not available in this browser. You can still type the answer.")
      return
    }

    const speechWindow = window as WebSpeechWindow
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) return

    recognitionRef.current?.abort()
    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognition.onresult = (event) => {
      let nextTranscript = ""
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        nextTranscript += event.results[index][0].transcript
      }
      setTranscript((current) => `${current} ${nextTranscript}`.trim())
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => {
      setIsListening(false)
      setError("Speech capture stopped. Check microphone permission and try again.")
    }
    recognitionRef.current = recognition
    setError("")
    setIsListening(true)
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  function nextQuestion() {
    stopListening()
    window.speechSynthesis?.cancel()
    setTranscript("")
    setQuestionIndex((current) => (current + 1) % questions.length)
  }

  return (
    <section className="glass-panel rounded-3xl p-5 md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-300/10 text-fuchsia-100">
              <AudioLines className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-white">Voice interview mode</h2>
              <p className="text-sm text-white/58">Interview Agent · interview.simulate</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-white/68">
            Generate a signed interview round, play each prompt aloud, capture the answer, and keep the proof attached
            to the mock interview session.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5" />
            Terminal3 signed
          </span>
          <button
            onClick={generateRound}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic2 className="h-4 w-4" />}
            Generate voice round
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/48 p-4">
          <p className="text-xs font-medium uppercase text-white/42">Prompt {questionIndex + 1} of {questions.length}</p>
          <p className="mt-4 min-h-24 text-xl font-semibold leading-8 text-white">{activeQuestion}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={speakQuestion}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200/40"
            >
              <Volume2 className="h-4 w-4" />
              Speak prompt
            </button>
            {isListening ? (
              <button
                onClick={stopListening}
                className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-950 transition hover:bg-white"
              >
                <Square className="h-4 w-4" />
                Stop answer
              </button>
            ) : (
              <button
                onClick={startListening}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2.5 text-sm font-semibold text-cyan-950 transition hover:bg-white"
              >
                <Mic2 className="h-4 w-4" />
                Record answer
              </button>
            )}
            <button
              onClick={nextQuestion}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-200/40"
            >
              <SkipForward className="h-4 w-4" />
              Next
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/45">
            Browser speech support varies. Typed answers work everywhere; microphone capture works in Chromium-based
            browsers with permission.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/48 p-4">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase text-white/42">Candidate answer</span>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={7}
              className="w-full resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-cyan-200/45"
              placeholder="Speak or type your answer here..."
            />
          </label>
          <div className="mt-4 rounded-2xl bg-white/[0.045] p-4">
            <p className="text-sm font-semibold text-white">Live feedback</p>
            <p className="mt-2 text-sm leading-6 text-white/68">{feedback}</p>
          </div>
          {proof ? (
            <div className="mt-4 rounded-2xl border border-emerald-200/15 bg-emerald-300/8 p-4 text-xs text-white/64">
              <p className="font-medium text-emerald-100">Terminal3 proof attached</p>
              <p className="mt-2 font-mono">mode={proof.mode}</p>
              <p className="mt-1 font-mono">permission={proof.permission}</p>
              <p className="mt-1 font-mono truncate">proof={proof.proofId}</p>
            </div>
          ) : null}
          {agentOutput ? (
            <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/68">
              <summary className="cursor-pointer font-semibold text-white">View generated rubric</summary>
              <pre className="mt-3 whitespace-pre-wrap font-sans leading-6">{agentOutput}</pre>
            </details>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-2xl border border-rose-200/20 bg-rose-300/10 p-4 text-sm text-rose-50">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function extractQuestions(output: string) {
  return output
    .split("\n")
    .map((line) =>
      line
        .replace(/^#+\s*/, "")
        .replace(/^[-*\d.)\s]+/, "")
        .replace(/^question\s*\d+[:.)-]?\s*/i, "")
        .replace(/\*\*/g, "")
        .trim(),
    )
    .filter(isVoiceQuestion)
    .slice(0, 5)
}

function isVoiceQuestion(line: string) {
  if (!line) return false
  if (/interview questions|answer rubric|practice plan|simulated interview/i.test(line)) return false
  if (line.endsWith("?")) return true
  return /^(can you|could you|would you|how would|how do|what|why|when|which|explain|describe|walk me|tell me)/i.test(line)
}
