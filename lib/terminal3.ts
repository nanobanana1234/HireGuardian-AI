import { createHash, createHmac, randomBytes } from "crypto"
import { SigningKey } from "ethers"

import { createApprovalToken, type AppSession, verifyApprovalToken } from "@/lib/app-session"
import { actionRegistry, agents, getAction, getAgent, type ActionId } from "@/lib/hireguardian-data"

type Terminal3Usage = {
  available?: string
  entries: Array<{
    kind: string
    amount: string
    direction: string
    timestamp: string
  }>
}

export type Terminal3Status = {
  configured: boolean
  connected: boolean
  mode: "live-sdk" | "not-configured" | "sdk-error"
  environment: "testnet" | "production"
  nodeUrl?: string
  did?: string
  expectedDid?: string
  authenticatedAt?: string
  usage?: Terminal3Usage
  sdkPackage: string
  error?: string
}

export type Terminal3Proof = {
  proofId: string
  mode: Terminal3Status["mode"]
  actionId: ActionId
  actionLabel: string
  agentId: string
  agentDid: string
  userDid?: string
  tenantDid?: string
  permission: string
  terminalFunction: string
  vcId: string
  nonce: string
  requestHash: string
  agentSignature: string
  userSignature: string
  credential: {
    contract: string
    functions: string[]
    scopes: string[]
    validUntil: string
  }
  sdkPrimitives: string[]
  liveStatus: Terminal3Status
}

type AuthorizationInput = {
  actionId: ActionId
  approvalToken?: string
  inputSummary: string
  session: AppSession
}

type AuthorizationResult =
  | { status: "authorized"; proof: Terminal3Proof }
  | { status: "pending_approval"; message: string; approvalToken: string }
  | { status: "denied"; message: string }

let cachedStatus: { expiresAt: number; value: Terminal3Status } | undefined

export async function getTerminal3Status(force = false): Promise<Terminal3Status> {
  if (!force && cachedStatus && cachedStatus.expiresAt > Date.now()) {
    return cachedStatus.value
  }

  const apiKey = process.env.T3N_API_KEY
  const expectedDid = process.env.T3N_DID
  const environment = normalizeEnvironment(process.env.T3N_ENVIRONMENT)
  const sdkPackage = "@terminal3/t3n-sdk"

  if (!apiKey) {
    return {
      configured: false,
      connected: false,
      mode: "not-configured",
      environment,
      expectedDid,
      sdkPackage,
      error: "T3N_API_KEY is not configured.",
    }
  }

  try {
    const sdk = await import("@terminal3/t3n-sdk")
    sdk.setEnvironment(environment)

    const wasmComponent = await withTimeout(sdk.loadWasmComponent(), 30000)
    const address = sdk.eth_get_address(apiKey)
    const client = new sdk.T3nClient({
      wasmComponent,
      timeout: 30000,
      handlers: {
        EthSign: sdk.metamask_sign(address, undefined, apiKey),
      },
    })

    await withTimeout(client.handshake(), 30000)
    const did = await withTimeout(client.authenticate(sdk.createEthAuthInput(address)), 30000)
    if (expectedDid && did.value !== expectedDid) {
      throw new Error("Terminal3 authenticated DID did not match T3N_DID.")
    }

    const usage = await client
      .getUsage({ limit: 5 })
      .then((page) => ({
        available: typeof page.balance?.available === "number" ? sdk.formatTokens(page.balance.available) : undefined,
        entries: (page.entries || []).slice(0, 5).map((entry) => ({
          kind: entry.kind,
          amount: sdk.formatTokens(entry.amount),
          direction: entry.direction,
          timestamp: new Date(entry.timestamp_ms).toISOString(),
        })),
      }))
      .catch(() => undefined)

    const status: Terminal3Status = {
      configured: true,
      connected: true,
      mode: "live-sdk",
      environment,
      nodeUrl: sdk.getNodeUrl(),
      did: did.value,
      expectedDid,
      authenticatedAt: new Date().toISOString(),
      usage,
      sdkPackage,
    }

    cachedStatus = { expiresAt: Date.now() + 1000 * 60 * 3, value: status }
    return status
  } catch (error) {
    const status: Terminal3Status = {
      configured: true,
      connected: false,
      mode: "sdk-error",
      environment,
      expectedDid,
      sdkPackage,
      error: sanitizeError(error),
    }

    cachedStatus = { expiresAt: Date.now() + 1000 * 30, value: status }
    return status
  }
}

export async function authorizeProtectedAction(input: AuthorizationInput): Promise<AuthorizationResult> {
  const action = getAction(input.actionId)
  const agent = action ? getAgent(action.agentId) : undefined

  if (!action || !agent) {
    return { status: "denied", message: "Unknown protected action." }
  }

  if (!agent.permissions.includes(action.permission)) {
    return {
      status: "denied",
      message: `${agent.name} is not allowed to perform ${action.permission}.`,
    }
  }

  if (action.requiresApproval) {
    const approval = verifyApprovalToken(input.approvalToken, input.session, input.actionId, input.inputSummary)

    if (!approval.valid && approval.reason !== "missing") {
      return {
        status: "denied",
        message: `${approvalDenialMessage(approval.reason)} Run the approval step again before signing.`,
      }
    }

    if (!approval.valid) {
      return {
        status: "pending_approval",
        message: `${action.label} requires explicit human approval before Terminal3 signs the action.`,
        approvalToken: createApprovalToken(input.session, input.actionId, input.inputSummary),
      }
    }
  }

  const proof = await buildTerminal3Proof(input.actionId, input.inputSummary)
  return { status: "authorized", proof }
}

async function buildTerminal3Proof(actionId: ActionId, inputSummary: string): Promise<Terminal3Proof> {
  const action = actionRegistry[actionId]
  const agent = agents.find((item) => item.id === action.agentId)!
  const liveStatus = await getTerminal3Status()
  const sdk = await import("@terminal3/t3n-sdk")
  const apiKey = process.env.T3N_API_KEY

  if (!apiKey) {
    throw new Error("T3N_API_KEY is required to create a Terminal3 proof.")
  }
  if (!liveStatus.connected || !liveStatus.did) {
    throw new Error(liveStatus.error || "Terminal3 live SDK authentication is required before signing.")
  }

  const tenantKeyBytes = hexToBytes(apiKey)
  const agentPrivateKey = deriveAgentPrivateKey(apiKey, agent.id)
  const agentKeyBytes = hexToBytes(agentPrivateKey)
  const agentSigningKey = new SigningKey(agentPrivateKey)
  const agentPubkey = hexToBytes(agentSigningKey.compressedPublicKey)
  const vcId = randomBytes(sdk.VC_ID_LEN)
  const nonce = randomBytes(sdk.NONCE_LEN)
  const requestHash = createHash("sha256")
    .update(
      stableJson({
        actionId,
        inputSummary,
        agentId: agent.id,
        permission: action.permission,
        terminalFunction: action.terminalFunction,
      }),
    )
    .digest()

  const now = Math.floor(Date.now() / 1000)
  const tenantDid = liveStatus.did
  const agentDid = deterministicAgentDid(agent.id)
  const scopes = scopeForAction(actionId)
  const contract = process.env.T3N_CONTRACT_NAME || "tee:hireguardian"
  const functions = [action.terminalFunction]

  const credential = sdk.buildDelegationCredential({
    user_did: tenantDid,
    agent_pubkey: agentPubkey,
    org_did: tenantDid,
    contract,
    functions,
    scopes,
    metadata: {
      product: "HireGuardian AI",
      agent: agent.id,
      permission: action.permission,
    },
    not_before_secs: now - 60,
    not_after_secs: now + 60 * 60,
    vc_id: vcId,
  })
  const credentialJcs = sdk.canonicaliseCredential(credential)
  const userSignature = sdk.signCredential(credentialJcs, tenantKeyBytes).sig
  const agentSignature = sdk.signAgentInvocation(sdk.buildInvocationPreimage(vcId, nonce, requestHash), agentKeyBytes)

  return {
    proofId: cryptoRandomId(),
    mode: "live-sdk",
    actionId,
    actionLabel: action.label,
    agentId: agent.id,
    agentDid,
    userDid: tenantDid,
    tenantDid,
    permission: action.permission,
    terminalFunction: action.terminalFunction,
    vcId: sdk.b64uEncodeBytes(vcId),
    nonce: sdk.b64uEncodeBytes(nonce),
    requestHash: sdk.b64uEncodeBytes(requestHash),
    agentSignature: maskValue(sdk.b64uEncodeBytes(agentSignature)),
    userSignature: maskValue(sdk.b64uEncodeBytes(userSignature)),
    credential: {
      contract: credential.contract,
      functions: credential.functions,
      scopes: credential.scopes,
      validUntil: new Date(Number(credential.not_after_secs) * 1000).toISOString(),
    },
    sdkPrimitives: [
      "T3nClient.handshake",
      "T3nClient.authenticate",
      "T3nClient.getUsage",
      "buildDelegationCredential",
      "canonicaliseCredential",
      "signCredential",
      "buildInvocationPreimage",
      "signAgentInvocation",
    ],
    liveStatus: {
      ...liveStatus,
      mode: "live-sdk",
    },
  }
}

function normalizeEnvironment(value: string | undefined): "testnet" | "production" {
  return value === "production" ? "production" : "testnet"
}

function hexToBytes(value: string) {
  const hex = value.startsWith("0x") ? value.slice(2) : value
  if (!/^[a-fA-F0-9]{64}$/.test(hex)) {
    throw new Error("Terminal3 API key must be a 32-byte hex private key.")
  }

  return new Uint8Array(Buffer.from(hex, "hex"))
}

function deriveAgentPrivateKey(apiKey: string, agentId: string) {
  return `0x${createHmac("sha256", apiKey).update(`hireguardian:${agentId}`).digest("hex")}`
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortObject(value))
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortObject)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, sortObject(item)]),
    )
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString("base64url")
  }

  return value
}

function deterministicAgentDid(agentId: string) {
  return `did:t3n:${createHash("sha1").update(`hireguardian:${agentId}`).digest("hex")}`
}

function scopeForAction(actionId: ActionId) {
  if (actionId.startsWith("resume.")) return ["career.resume", "career.profile"]
  if (actionId.startsWith("application.")) return ["career.resume", "career.application", "career.profile"]
  if (actionId.startsWith("interview.")) return ["career.resume", "career.interview"]
  if (actionId.startsWith("jobs.")) return ["career.resume", "career.jobs"]
  return ["career.profile"]
}

function maskValue(value: string) {
  if (value.length <= 14) return "[redacted]"
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

function approvalDenialMessage(reason: string) {
  if (reason === "expired") return "Approval token expired."
  if (reason === "session") return "Approval token belongs to a different session."
  if (reason === "action") return "Approval token belongs to a different protected action."
  if (reason === "input") return "Approval token no longer matches this request."
  return "Approval token is invalid."
}

function cryptoRandomId() {
  return randomBytes(9).toString("hex")
}

function sanitizeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message
    .replace(/0x[a-fA-F0-9]{24,}/g, "0x[redacted]")
    .replace(/sk-[A-Za-z0-9_-]{12,}/g, "sk-[redacted]")
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>

  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`Terminal3 SDK request timed out after ${ms}ms`)), ms)
    }),
  ]).finally(() => clearTimeout(timeout))
}
