import { getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"

export async function GET() {
  try {
    const session = await verifySession()
    const { tenantId, uid } = session

    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("credentials")
      .orderBy("createdAt", "desc")
      .get()

    const sharedCredentials = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          serviceName: data.serviceName,
          url: data.url,
          username: data.username,
          createdBy: data.createdBy,
          sharedWith: data.sharedWith || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        }
      })
      .filter(
        (c) =>
          c.createdBy !== uid &&
          c.sharedWith.some((s: { userId: string }) => s.userId === uid)
      )

    return Response.json({ credentials: sharedCredentials })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch shared credentials"
    return Response.json({ error: message }, { status: 401 })
  }
}
