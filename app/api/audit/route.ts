import { NextRequest } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession()
    const { tenantId, role } = session

    if (role !== "super_admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit") || "50"),
      200
    )

    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get()

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        action: data.action,
        actorId: data.actorId,
        actorEmail: data.actorEmail || "",
        targetId: data.targetId || "",
        targetEmail: data.targetEmail || "",
        details: data.details || "",
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
      }
    })

    return Response.json({ logs })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch audit logs"
    return Response.json({ error: message }, { status: 401 })
  }
}
