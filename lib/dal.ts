import "server-only"
import { cookies } from "next/headers"
import { decrypt, type SessionPayload } from "./session"

export async function verifySession(): Promise<SessionPayload> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")?.value
  const session = await decrypt(sessionCookie)

  if (!session?.uid || !session?.tenantId) {
    throw new Error("Unauthorized")
  }

  return session
}
