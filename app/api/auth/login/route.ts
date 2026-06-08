import { NextRequest } from "next/server"
import { getAdminAuth } from "@/lib/firebase-admin"
import { createSession } from "@/lib/session"
import { logAudit } from "@/lib/audit"

export async function POST(req: NextRequest) {
  try {
    const adminAuth = getAdminAuth()
    const { idToken } = await req.json()

    if (!idToken) {
      return Response.json({ error: "Missing idToken" }, { status: 400 })
    }

    const decoded = await adminAuth.verifyIdToken(idToken)
    const uid = decoded.uid

    const userRecord = await adminAuth.getUser(uid)
    const claims = userRecord.customClaims || {}

    const tenantId = (claims.tenantId as string) || ""
    const role = (claims.role as "super_admin" | "member") || "member"

    if (!tenantId) {
      return Response.json({ error: "No tenant found for this user" }, { status: 403 })
    }

    const actorEmail = decoded.email || ""

    await createSession({
      uid,
      tenantId,
      role,
      email: actorEmail,
    })

    await logAudit(tenantId, {
      action: "auth:login",
      actorId: uid,
      actorEmail,
      details: `User logged in`,
    })

    return Response.json({
      success: true,
      tenantId,
      role,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed"
    return Response.json({ error: message }, { status: 401 })
  }
}
