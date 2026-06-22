"use client"

type ClientSession = {
  userId: string
  csrfToken: string
  createdAt: number
}

let sessionPromise: Promise<ClientSession> | undefined

export function getClientSession() {
  if (!sessionPromise) {
    sessionPromise = fetch("/api/session", { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("Could not initialize secure app session.")
      return response.json() as Promise<ClientSession>
    })
  }

  return sessionPromise
}

export async function csrfHeaders() {
  const session = await getClientSession()
  return {
    "Content-Type": "application/json",
    "X-HireGuardian-CSRF": session.csrfToken,
  }
}
