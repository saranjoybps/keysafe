import { NextRequest } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"
import { encryptPassword, getTenantEncryptionKey } from "@/lib/encryption"

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

    const allCredentials = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        serviceName: data.serviceName,
        url: data.url,
        username: data.username,
        createdBy: data.createdBy,
        sharedWith: data.sharedWith || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })

    const myCredentials = allCredentials.filter((c) => c.createdBy === uid)
    const sharedWithMe = allCredentials.filter(
      (c) =>
        c.createdBy !== uid &&
        c.sharedWith.some((s: { userId: string }) => s.userId === uid)
    )

    const usersSnapshot = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("users")
      .get()

    return Response.json({
      credentials: myCredentials,
      sharedWithMe: sharedWithMe.length,
      total: allCredentials.length,
      myCredentials: myCredentials.length,
      totalUsers: usersSnapshot.docs.length,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch credentials"
    return Response.json({ error: message }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    const { tenantId, uid } = session

    const { serviceName, url, username, password } = await req.json()

    if (!serviceName || !username || !password) {
      return Response.json({ error: "Missing required fields (serviceName, username, password)" }, { status: 400 })
    }

    const adminDb = getAdminDb()
    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()
    if (!tenantDoc.exists) {
      return Response.json({ error: "Tenant not found" }, { status: 404 })
    }

    const tenantData = tenantDoc.data()!
    const key = getTenantEncryptionKey(tenantData.encryptionKey)

    const { ciphertext, iv, authTag } = encryptPassword(password, key)

    const credentialRef = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("credentials")
      .add({
        serviceName,
        url: url || "",
        username,
        password: ciphertext,
        iv,
        authTag,
        createdBy: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        sharedWith: [],
      })

    return Response.json({
      success: true,
      id: credentialRef.id,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create credential"
    return Response.json({ error: message }, { status: 500 })
  }
}
