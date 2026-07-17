"use client"

import { useState, useEffect } from "react"
import { useUser } from "../layout"
import { useRouter } from "next/navigation"
import { Activity, Key, UserPlus, UserX, LogIn, Trash2, Share2, Edit, Search } from "lucide-react"
import Card from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import PageHeader from "@/components/ui/page-header"
import Spinner from "@/components/ui/spinner"
import Input from "@/components/ui/input"

interface AuditLog { id: string; action: string; actorEmail: string; targetEmail: string; details: string; timestamp: string }

const actionConfig: Record<string, { label: string; icon: typeof Activity; color: string; bg: string }> = {
  "auth:login": { label: "Login", icon: LogIn, color: "text-success", bg: "bg-success/10" },
  "user:create": { label: "Created", icon: UserPlus, color: "text-primary", bg: "bg-primary/10" },
  "user:update": { label: "Updated", icon: Edit, color: "text-primary", bg: "bg-primary/10" },
  "credential:create": { label: "Created", icon: Key, color: "text-primary", bg: "bg-primary/10" },
  "credential:update": { label: "Updated", icon: Edit, color: "text-muted-foreground", bg: "bg-muted" },
  "credential:delete": { label: "Deleted", icon: Trash2, color: "text-destructive", bg: "bg-destructive/10" },
  "credential:grant": { label: "Granted", icon: Share2, color: "text-success", bg: "bg-success/10" },
  "credential:revoke": { label: "Revoked", icon: UserX, color: "text-destructive", bg: "bg-destructive/10" },
}

function getConfig(action: string) {
  return actionConfig[action] || { label: action, icon: Activity, color: "text-muted-foreground", bg: "bg-muted" }
}

export default function AuditPage() {
  const { user } = useUser()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    if (user?.role !== "super_admin") { router.push("/dashboard"); return }
    async function fetchLogs() {
      try { const res = await fetch("/api/audit"); if (res.ok) { const data = await res.json(); setLogs(data.logs || []) } }
      catch { /* silently fail */ } finally { setLoading(false) }
    }
    fetchLogs()
  }, [user, router])

  if (user?.role !== "super_admin") return null

  const filtered = filter
    ? logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()) || l.actorEmail.toLowerCase().includes(filter.toLowerCase()) || l.targetEmail.toLowerCase().includes(filter.toLowerCase()) || l.details.toLowerCase().includes(filter.toLowerCase()))
    : logs

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Audit log" description="Track all activity in your organization" />

      <div className="relative max-w-sm">
        <Input type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter activities..." icon={<Search size={14} />} />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={Activity} title={filter ? "No matches" : "No activity yet"} description={filter ? "Try a different search" : "Activity will appear as your team uses KeySafe"} />
      ) : (
        <div className="space-y-2">
          {filtered.map((log, i) => {
            const cfg = getConfig(log.action)
            const Icon = cfg.icon
            return (
              <Card key={log.id} className="animate-fade-up p-3" style={{ animationDelay: `${(i % 20) * 25}ms` }}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                    <Icon size={14} className={cfg.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-lg px-1.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[11px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{log.details || `${log.actorEmail} performed ${log.action}`}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      by {log.actorEmail}{log.targetEmail && ` \u2192 ${log.targetEmail}`}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
