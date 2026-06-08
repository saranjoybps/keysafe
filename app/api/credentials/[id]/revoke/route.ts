import { NextRequest } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/credentials/[id]/revoke">
) {
  try {
    const { id } = await ctx.params
    const session = await verifySession()
    const { tenantId, uid, role } = session

    const adminDb = getAdminDb()
    const doc = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("credentials")
      .doc(id)
      .get()

    if (!doc.exists) {
      return Response.json({ error: "Credential not found" }, { status: 404 })
    }

    const data = doc.data()!
    const isOwner = data.createdBy === uid
    const isSuperAdmin = role === "super_admin"

    if (!isOwner && !isSuperAdmin) {
      return Response.json({ error: "Only the owner or super_admin can revoke access" }, { status: 403 })
    }

    const { userId } = await req.json()

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 })
    }

    const currentShared = data.sharedWith || []
    const updatedShared = currentShared.filter(
      (s: { userId: string }) => s.userId !== userId
    )

    await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("credentials")
      .doc(id)
      .update({
        sharedWith: updatedShared,
        updatedAt: new Date(),
      })

    return Response.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to revoke access"
    return Response.json({ error: message }, { status: 500 })
  }
}
