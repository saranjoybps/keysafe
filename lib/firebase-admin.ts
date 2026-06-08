import "server-only"

import admin from "firebase-admin"
import { existsSync } from "fs"
import { join } from "path"

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!
  }

  const keyFilePath = join(process.cwd(), "lib", "firebase-admin-key.json")

  if (existsSync(keyFilePath)) {
    return admin.initializeApp({
      credential: admin.credential.cert(keyFilePath),
    })
  }

  const projectId = process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK missing credentials. Either provide lib/firebase-admin-key.json or set FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and FIREBASE_SERVICE_ACCOUNT_PROJECT_ID in .env.local"
    )
  }

  privateKey = privateKey.trim()
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  privateKey = privateKey.replace(/\\n/g, "\n")

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

let _adminAuth: admin.auth.Auth | null = null
let _adminDb: admin.firestore.Firestore | null = null

function ensureInit() {
  if (!_adminAuth) {
    const app = getAdminApp()
    _adminAuth = app.auth()
    _adminDb = app.firestore()
  }
}

export function getAdminAuth(): admin.auth.Auth {
  ensureInit()
  return _adminAuth!
}

export function getAdminDb(): admin.firestore.Firestore {
  ensureInit()
  return _adminDb!
}
