import { NextRequest } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"
import { verifySession } from "@/lib/dal"
import { logAudit } from "@/lib/audit"

export async function GET() {
  try {
    const session = await verifySession()
    const { tenantId, role } = session

    if (role !== "super_admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection("tenants")
      .doc(tenantId)
      .collection("users")
      .orderBy("createdAt", "desc")
      .get()

    const users = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        isActive: data.isActive,
      }
    })

    return Response.json({ users })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch users"
    return Response.json({ error: message }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    const { tenantId, role: callerRole } = session

    if (callerRole !== "super_admin") {
      return Response.json({ error: "Only super_admin can add users" }, { status: 403 })
    }

    const { email, displayName, password, role: newRole } = await req.json()

    if (!email || !displayName || !password) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const targetRole = newRole === "super_admin" ? "super_admin" : "member"

    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    })

    const uid = userRecord.uid

    await adminDb.collection("tenants").doc(tenantId).collection("users").doc(uid).set({
      uid,
      email,
      displayName,
      role: targetRole,
      createdAt: new Date(),
      createdBy: session.uid,
      isActive: true,
    })

    await adminAuth.setCustomUserClaims(uid, {
      tenantId,
      role: targetRole,
    })

    await logAudit(tenantId, {
      action: "user:create",
      actorId: session.uid,
      actorEmail: session.email || "",
      targetId: uid,
      targetEmail: email,
      details: `Created user ${displayName} as ${targetRole}`,
    })

    return Response.json({
      success: true,
      uid,
      email,
      displayName,
      role: targetRole,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ""
    if (message.includes("EMAIL_EXISTS")) {
      return Response.json({ error: "Email already in use" }, { status: 409 })
    }
    return Response.json({ error: message || "Failed to create user" }, { status: 500 })
  }
}
