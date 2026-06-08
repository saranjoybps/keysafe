import { NextRequest } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"
import { createSession } from "@/lib/session"
import { generateKey, encryptTenantKey } from "@/lib/encryption"
import { logAudit } from "@/lib/audit"

export async function POST(req: NextRequest) {
  try {
    const adminAuth = getAdminAuth()
    const adminDb = getAdminDb()
    const { name, email, password, tenantName } = await req.json()

    if (!name || !email || !password || !tenantName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    })

    const uid = userRecord.uid
    const tenantId = `tenant_${uid.substring(0, 12)}`

    const tenantKey = generateKey()
    const encryptedKey = encryptTenantKey(tenantKey)

    await adminDb.collection("tenants").doc(tenantId).set({
      name: tenantName,
      displayName: tenantName,
      createdAt: new Date(),
      createdBy: uid,
      encryptionKey: encryptedKey,
    })

    await adminDb.collection("tenants").doc(tenantId).collection("users").doc(uid).set({
      uid,
      email,
      displayName: name,
      role: "super_admin",
      createdAt: new Date(),
      createdBy: uid,
      isActive: true,
    })

    await adminAuth.setCustomUserClaims(uid, {
      tenantId,
      role: "super_admin",
    })

    await createSession({
      uid,
      tenantId,
      role: "super_admin",
      email,
    })

    await logAudit(tenantId, {
      action: "auth:login",
      actorId: uid,
      actorEmail: email,
      details: `User signed up and created tenant "${tenantName}"`,
    })

    return Response.json({
      success: true,
      tenantId,
      uid,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signup failed"
    if (message.includes("EMAIL_EXISTS")) {
      return Response.json({ error: "Email already in use" }, { status: 409 })
    }
    if (message.includes("configuration corresponding to the provided identifier")) {
      return Response.json({
        error: "Firebase Authentication is not fully configured. Go to Firebase Console > Authentication > Sign-in method and enable Email/Password. Also ensure Identity Platform (GCIP) is enabled in GCP Console > APIs & Services > Identity Platform API.",
      }, { status: 500 })
    }
    return Response.json({ error: message }, { status: 500 })
  }
}
