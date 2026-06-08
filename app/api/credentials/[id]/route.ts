import { NextRequest } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"
import { getTenantEncryptionKey, decryptPassword, encryptPassword } from "@/lib/encryption"
import { logAudit } from "@/lib/audit"

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/credentials/[id]">
) {
  try {
    const { id } = await ctx.params
    const session = await verifySession()
    const { tenantId, uid } = session

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
    const sharedUser = (data.sharedWith || []).find(
      (s: { userId: string }) => s.userId === uid
    )
    const isSuperAdmin = session.role === "super_admin"

    if (!isOwner && !sharedUser && !isSuperAdmin) {
      return Response.json({ error: "Access denied" }, { status: 403 })
    }

    const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()
    const tenantData = tenantDoc.data()!

    let decryptedPassword = ""
    try {
      const key = getTenantEncryptionKey(tenantData.encryptionKey)
      decryptedPassword = decryptPassword(data.password, data.iv, data.authTag, key)
    } catch {
      decryptedPassword = "[decryption failed]"
    }

    const usersSnapshot = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("users")
      .get()

    const allUsers = usersSnapshot.docs.map((d) => ({
      uid: d.data().uid,
      email: d.data().email,
      displayName: d.data().displayName,
    }))

    return Response.json({
      id: doc.id,
      serviceName: data.serviceName,
      url: data.url,
      username: data.username,
      password: decryptedPassword,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      sharedWith: data.sharedWith || [],
      allUsers,
      isOwner,
      isSuperAdmin,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch credential"
    return Response.json({ error: message }, { status: 401 })
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/credentials/[id]">
) {
  try {
    const { id } = await ctx.params
    const session = await verifySession()
    const { tenantId, uid } = session

    const adminDb = getAdminDb()
    const docRef = adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("credentials")
      .doc(id)

    const doc = await docRef.get()
    if (!doc.exists) {
      return Response.json({ error: "Credential not found" }, { status: 404 })
    }

    const data = doc.data()!
    const isOwner = data.createdBy === uid
    const isSuperAdmin = session.role === "super_admin"

    if (!isOwner && !isSuperAdmin) {
      return Response.json({ error: "Access denied" }, { status: 403 })
    }

    const { serviceName, url, username, password } = await req.json()

    const updateData: Record<string, unknown> = {
      serviceName,
      url: url || "",
      username,
      updatedAt: new Date(),
    }

    if (password) {
      const tenantDoc = await adminDb.collection("tenants").doc(tenantId).get()
      const tenantData = tenantDoc.data()!
      const key = getTenantEncryptionKey(tenantData.encryptionKey)
      const { ciphertext, iv, authTag } = encryptPassword(password, key)
      updateData.password = ciphertext
      updateData.iv = iv
      updateData.authTag = authTag
    }

    await docRef.update(updateData)

    await logAudit(tenantId, {
      action: "credential:update",
      actorId: uid,
      actorEmail: session.email || "",
      targetId: id,
      details: `Updated credential "${data.serviceName}"`,
    })

    return Response.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update credential"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/credentials/[id]">
) {
  try {
    const { id } = await ctx.params
    const session = await verifySession()
    const { tenantId, uid } = session

    const adminDb = getAdminDb()
    const docRef = adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("credentials")
      .doc(id)

    const doc = await docRef.get()
    if (!doc.exists) {
      return Response.json({ error: "Credential not found" }, { status: 404 })
    }

    const data = doc.data()!
    const isOwner = data.createdBy === uid
    const isSuperAdmin = session.role === "super_admin"

    if (!isOwner && !isSuperAdmin) {
      return Response.json({ error: "Access denied" }, { status: 403 })
    }

    await docRef.delete()

    await logAudit(tenantId, {
      action: "credential:delete",
      actorId: uid,
      actorEmail: session.email || "",
      targetId: id,
      details: `Deleted credential "${data.serviceName}"`,
    })

    return Response.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete credential"
    return Response.json({ error: message }, { status: 500 })
  }
}
