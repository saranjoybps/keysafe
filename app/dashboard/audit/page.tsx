"use client"

import { useState, useEffect } from "react"
import { useUser } from "../layout"
import { useRouter } from "next/navigation"
import {
  Activity,
  Key,
  UserPlus,
  UserX,
  LogIn,
  Shield,
  Trash2,
  Share2,
  Edit,
} from "lucide-react"

interface AuditLog {
  id: string
  action: string
  actorEmail: string
  targetEmail: string
  details: string
  timestamp: string
}

const actionConfig: Record<
  string,
  { label: string; icon: typeof Activity; color: string; bg: string }
> = {
  "auth:login": {
    label: "Login",
    icon: LogIn,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  "user:create": {
    label: "User Created",
    icon: UserPlus,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  "user:update": {
    label: "User Updated",
    icon: Edit,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  "credential:create": {
    label: "Credential Created",
    icon: Key,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  "credential:update": {
    label: "Credential Updated",
    icon: Edit,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  "credential:delete": {
    label: "Credential Deleted",
    icon: Trash2,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  "credential:grant": {
    label: "Access Granted",
    icon: Share2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  "credential:revoke": {
    label: "Access Revoked",
    icon: UserX,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
}

function getActionConfig(action: string) {
  return (
    actionConfig[action] || {
      label: action,
      icon: Activity,
      color: "text-zinc-600",
      bg: "bg-zinc-50 dark:bg-zinc-900/20",
    }
  )
}

export default function AuditPage() {
  const { user } = useUser()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    if (user?.role !== "super_admin") {
      router.push("/dashboard")
      return
    }
    async function fetchLogs() {
      try {
        const res = await fetch("/api/audit")
        if (res.ok) {
          const data = await res.json()
          setLogs(data.logs || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [user, router])

  if (user?.role !== "super_admin") return null

  const filtered = filter
    ? logs.filter(
        (l) =>
          l.action.toLowerCase().includes(filter.toLowerCase()) ||
          l.actorEmail.toLowerCase().includes(filter.toLowerCase()) ||
          l.targetEmail.toLowerCase().includes(filter.toLowerCase()) ||
          l.details.toLowerCase().includes(filter.toLowerCase())
      )
    : logs

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Audit Log</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Track all activities across your organization
        </p>
      </div>

      <div className="relative">
        <Activity
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by action, email, or details..."
          className="block w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
          <Activity size={40} className="text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            {filter ? "No matching activities" : "No activities yet"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {filter
              ? "Try a different filter term"
              : "Activities will appear here as your team uses KeySafe"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log, i) => {
            const cfg = getActionConfig(log.action)
            const Icon = cfg.icon
            return (
              <div
                key={log.id}
                className="animate-fade-in flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                style={{ animationDelay: `${(i % 20) * 30}ms` }}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}
                >
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {log.details || `${log.actorEmail} performed ${log.action}`}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    by {log.actorEmail}
                    {log.targetEmail && ` → ${log.targetEmail}`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
