import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"
import { getAdminAuth } from "@/lib/firebase-admin"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")?.value
    const session = await decrypt(sessionCookie)

    if (!session?.uid || !session?.tenantId) {
      return Response.json({ authenticated: false }, { status: 200 })
    }

    let displayName = ""
    try {
      const adminAuth = getAdminAuth()
      const userRecord = await adminAuth.getUser(session.uid)
      displayName = userRecord.displayName || ""
    } catch {
      // non-critical
    }

    return Response.json({
      authenticated: true,
      uid: session.uid,
      tenantId: session.tenantId,
      role: session.role,
      email: session.email,
      displayName,
    })
  } catch {
    return Response.json({ authenticated: false }, { status: 200 })
  }
}
