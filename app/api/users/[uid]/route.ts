import { NextRequest } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"
import { logAudit } from "@/lib/audit"

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/users/[uid]">
) {
  try {
    const { uid: targetUid } = await ctx.params
    const session = await verifySession()
    const { tenantId, uid: actorUid } = session

    if (session.role !== "super_admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const { displayName, role } = await req.json()
    const adminDb = getAdminDb()
    const adminAuth = getAdminAuth()

    const userDocRef = adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("users")
      .doc(targetUid)

    const userDoc = await userDocRef.get()
    if (!userDoc.exists) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    const currentData = userDoc.data()!
    const updates: Record<string, unknown> = {}
    const changes: string[] = []

    if (displayName && displayName !== currentData.displayName) {
      updates.displayName = displayName
      changes.push(`name: ${currentData.displayName} → ${displayName}`)
      await adminAuth.updateUser(targetUid, { displayName })
    }

    if (role && role !== currentData.role) {
      updates.role = role
      changes.push(`role: ${currentData.role} → ${role}`)
      await adminAuth.setCustomUserClaims(targetUid, {
        tenantId,
        role,
      })
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ success: true, message: "No changes" })
    }

    await userDocRef.update(updates)

    await logAudit(tenantId, {
      action: "user:update",
      actorId: actorUid,
      actorEmail: session.email || "",
      targetId: targetUid,
      targetEmail: currentData.email,
      details: changes.join("; "),
    })

    return Response.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update user"
    return Response.json({ error: message }, { status: 500 })
  }
}
