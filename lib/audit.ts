import "server-only"
import { getAdminDb } from "./firebase-admin"

export interface AuditEntry {
  action: string
  actorId: string
  actorEmail: string
  targetId?: string
  targetEmail?: string
  details?: string
  timestamp: Date
}

export async function logAudit(
  tenantId: string,
  entry: Omit<AuditEntry, "timestamp">
): Promise<void> {
  const adminDb = getAdminDb()
  await adminDb
    .collection("tenants")
    .doc(tenantId)
    .collection("auditLogs")
    .add({
      ...entry,
      timestamp: new Date(),
    })
}
