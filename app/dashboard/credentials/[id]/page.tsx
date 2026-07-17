"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "../../layout"
import Link from "next/link"
import { Copy, Eye, EyeOff, Globe, ExternalLink, UserPlus, Clock, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/components/ui/button"
import Card, { CardHeader, CardContent } from "@/components/ui/card"
import Spinner from "@/components/ui/spinner"
import Modal from "@/components/ui/modal"
import BackLink from "@/components/ui/back-link"
import Select from "@/components/ui/select"

interface SharedUser { userId: string; email: string; permission: string }
interface AllUser { uid: string; email: string; displayName: string }

export default function CredentialDetailPage() {
  const params = useParams()
  const router = useRouter()
  useUser()
  const [credential, setCredential] = useState<{
    id: string; serviceName: string; url: string; username: string; password: string
    createdBy: string; createdAt: string; updatedAt: string
    sharedWith: SharedUser[]; allUsers: AllUser[]; isOwner: boolean; isSuperAdmin: boolean
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
          if (res.status === 403 || res.status === 404) { router.push("/dashboard/credentials"); return }
          throw new Error("Failed to fetch")
        }
        setCredential(await res.json())
      } catch { toast.error("Failed to load credential"); router.push("/dashboard/credentials") }
      finally { setLoading(false) }
    }
    fetchCredential()
  }, [params.id, router])

  useEffect(() => () => { if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current) }, [])

  function revealPassword() {
    setRevealed(true)
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current)
    revealTimeoutRef.current = setTimeout(() => setRevealed(false), 5000)
  }
  function hidePassword() {
    setRevealed(false)
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current)
  }

  async function copyToClipboard(text: string, label: string) {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied`) }
    catch { toast.error("Failed to copy") }
  }

  async function handleGrant() {
    if (!selectedUser || !credential) return
    try {
      const res = await fetch(`/api/credentials/${credential.id}/grant`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedUser }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      toast.success("Access granted"); setSelectedUser("")
      const r = await fetch(`/api/credentials/${params.id}`)
      if (r.ok) setCredential(await r.json())
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
  }

  async function handleDelete() {
    if (!credential) return; setDeleting(true)
    try {
      const res = await fetch(`/api/credentials/${credential.id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      toast.success("Credential deleted"); router.push("/dashboard/credentials")
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Something went wrong"); setDeleting(false); setShowDeleteConfirm(false) }
  }

  async function handleRevoke(userId: string) {
    try {
      const res = await fetch(`/api/credentials/${credential!.id}/revoke`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed") }
      toast.success("Access revoked")
      const r = await fetch(`/api/credentials/${params.id}`)
      if (r.ok) setCredential(await r.json())
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
  }

  if (loading) return <Spinner />
  if (!credential) return null

  const canManage = credential.isOwner || credential.isSuperAdmin
  const unsharedUsers = credential.allUsers.filter(u => u.uid !== credential.createdBy && !credential.sharedWith.some(s => s.userId === u.uid))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackLink href="/dashboard/credentials" label="Credentials" />

      <Card>
        <div className="flex items-start justify-between p-5">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{credential.serviceName}</h1>
            {credential.url && (
              <a href={credential.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[13px] text-primary transition-colors hover:text-primary/80">
                <Globe size={13} />
                {credential.url.replace(/^https?:\/\//, "")}
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          {canManage && (
            <div className="flex items-center gap-1">
              <Link href={`/dashboard/credentials/${credential.id}/edit`} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Pencil size={13} /> Edit
              </Link>
              <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>

        <CardContent className="space-y-4 border-t border-black/[0.04] pt-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Username</label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">{credential.username}</span>
              <button onClick={() => copyToClipboard(credential.username, "Username")} className="text-muted-foreground transition-colors hover:text-foreground"><Copy size={13} /></button>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">
                {revealed ? credential.password : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              </span>
              <button onClick={revealed ? hidePassword : revealPassword} className="text-muted-foreground transition-colors hover:text-foreground" title={revealed ? "Hide" : "Reveal (5s)"}>
                {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button onClick={() => copyToClipboard(credential.password, "Password")} className="text-muted-foreground transition-colors hover:text-foreground"><Copy size={13} /></button>
            </div>
            {revealed && <p className="mt-1 text-[11px] text-primary">Auto-hides in 5 seconds</p>}
          </div>
        </CardContent>

        <div className="border-t border-black/[0.04] px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock size={11} />
            Created {new Date(credential.createdAt).toLocaleDateString()}
            {credential.updatedAt !== credential.createdAt && ` \u00b7 Updated ${new Date(credential.updatedAt).toLocaleDateString()}`}
          </span>
        </div>
      </Card>

      <Modal open={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleting(false) }} title="Delete credential"
        footer={<>
          <Button variant="secondary" onClick={() => { setShowDeleteConfirm(false); setDeleting(false) }} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
        </>}>
        <p className="text-sm text-muted-foreground">
          Delete <span className="font-medium text-foreground">{credential.serviceName}</span>? This cannot be undone.
        </p>
      </Modal>

      {canManage && (
        <Card>
          <CardHeader className="border-b border-black/[0.04]">
            <p className="text-[13px] font-medium text-foreground">Shared with</p>
          </CardHeader>
          <CardContent className="pt-4">
            {credential.sharedWith.length > 0 ? (
              <ul className="space-y-2">
                {credential.sharedWith.map(s => (
                  <li key={s.userId} className="flex items-center justify-between rounded-xl py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
                        {s.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.email}</p>
                        <p className="text-[11px] capitalize text-muted-foreground">{s.permission}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRevoke(s.userId)} className="text-[12px] font-medium text-destructive transition-colors hover:text-destructive/80">Revoke</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Not shared yet</p>
            )}

            {unsharedUsers.length > 0 && (
              <div className="mt-4 border-t border-black/[0.04] pt-4">
                <p className="text-[13px] font-medium text-foreground">Grant access</p>
                <div className="mt-2 flex gap-2">
                  <Select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="flex-1">
                    <option value="">Select member...</option>
                    {unsharedUsers.map(u => <option key={u.uid} value={u.uid}>{u.displayName} ({u.email})</option>)}
                  </Select>
                  <Button onClick={handleGrant} disabled={!selectedUser} size="sm"><UserPlus size={14} /> Grant</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
