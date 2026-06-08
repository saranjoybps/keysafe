"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "../../layout"
import Link from "next/link"
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Globe,
  ExternalLink,
  UserPlus,
  UserX,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react"
import toast from "react-hot-toast"

interface SharedUser {
  userId: string
  email: string
  permission: string
}

interface AllUser {
  uid: string
  email: string
  displayName: string
}

export default function CredentialDetailPage() {
  const params = useParams()
  const router = useRouter()
  useUser()
  const [credential, setCredential] = useState<{
    id: string
    serviceName: string
    url: string
    username: string
    password: string
    createdBy: string
    createdAt: string
    updatedAt: string
    sharedWith: SharedUser[]
    allUsers: AllUser[]
    isOwner: boolean
    isSuperAdmin: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function fetchCredential() {
      try {
        const res = await fetch(`/api/credentials/${params.id}`)
        if (!res.ok) {
          if (res.status === 403 || res.status === 404) {
            router.push("/dashboard/credentials")
            return
          }
          throw new Error("Failed to fetch")
        }
        const data = await res.json()
        setCredential(data)
      } catch {
        toast.error("Failed to load credential")
        router.push("/dashboard/credentials")
      } finally {
        setLoading(false)
      }
    }
    fetchCredential()
  }, [params.id, router])

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current)
      }
    }
  }, [])

  function revealPassword() {
    setRevealed(true)
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current)
    revealTimeoutRef.current = setTimeout(() => {
      setRevealed(false)
    }, 5000)
  }

  function hidePassword() {
    setRevealed(false)
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current)
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Failed to copy")
    }
  }

  async function handleGrant() {
    if (!selectedUser || !credential) return

    try {
      const res = await fetch(`/api/credentials/${credential.id}/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to grant access")
      }

      toast.success("Access granted")
      setSelectedUser("")
      const refreshed = await fetch(`/api/credentials/${params.id}`)
      if (refreshed.ok) {
        const data = await refreshed.json()
        setCredential(data)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    }
  }

  async function handleDelete() {
    if (!credential) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/credentials/${credential.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete")
      }
      toast.success("Credential deleted")
      router.push("/dashboard/credentials")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  async function handleRevoke(userId: string) {
    try {
      const res = await fetch(`/api/credentials/${credential!.id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to revoke access")
      }

      toast.success("Access revoked")
      const refreshed = await fetch(`/api/credentials/${params.id}`)
      if (refreshed.ok) {
        const data = await refreshed.json()
        setCredential(data)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!credential) return null

  const canManage = credential.isOwner || credential.isSuperAdmin
  const unsharedUsers = credential.allUsers.filter(
    (u) =>
      u.uid !== credential.createdBy &&
      !credential.sharedWith.some((s) => s.userId === u.uid)
  )

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/credentials"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeft size={16} />
          Back to Credentials
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {credential.serviceName}
            </h1>
            {credential.url && (
              <a
                href={credential.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
              >
                <Globe size={14} />
                {credential.url.replace(/^https?:\/\//, "")}
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          {canManage && (
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/credentials/${credential.id}/edit`}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Pencil size={14} />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Username
            </label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {credential.username}
              </span>
              <button
                onClick={() => copyToClipboard(credential.username, "Username")}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
              Password
            </label>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm text-zinc-900 dark:text-zinc-50">
                {revealed ? credential.password : "••••••••••••"}
              </span>
              {revealed ? (
                <button
                  onClick={hidePassword}
                  className="text-zinc-400 hover:text-zinc-600"
                  title="Hide password"
                >
                  <EyeOff size={16} />
                </button>
              ) : (
                <button
                  onClick={revealPassword}
                  className="text-zinc-400 hover:text-zinc-600"
                  title="Reveal password (auto-hides in 5s)"
                >
                  <Eye size={16} />
                </button>
              )}
              <button
                onClick={() => copyToClipboard(credential.password, "Password")}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <Copy size={14} />
              </button>
            </div>
            {revealed && (
              <p className="mt-1 text-xs text-amber-500">
                Password will auto-hide in 5 seconds
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            Created {new Date(credential.createdAt).toLocaleDateString()}
          </span>
          {credential.updatedAt !== credential.createdAt && (
            <span>
              Updated {new Date(credential.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Delete Credential</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Are you sure you want to delete <strong>{credential.serviceName}</strong>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleting(false) }}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {canManage && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Shared With
          </h2>

          {credential.sharedWith.length > 0 ? (
            <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {credential.sharedWith.map((s) => (
                <li
                  key={s.userId}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      {s.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {s.email}
                      </p>
                      <p className="text-xs text-zinc-400 capitalize">{s.permission}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(s.userId)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <UserX size={16} />
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Not shared with anyone yet
            </p>
          )}

          {unsharedUsers.length > 0 && (
            <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Grant Access
              </h3>
              <div className="mt-2 flex gap-2">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="block flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">Select a team member...</option>
                  {unsharedUsers.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.displayName} ({u.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGrant}
                  disabled={!selectedUser}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserPlus size={16} />
                  Grant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
