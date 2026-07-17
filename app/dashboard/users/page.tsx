"use client"

import { useState, useEffect } from "react"
import { useUser } from "../layout"
import { useRouter } from "next/navigation"
import { Shield, Pencil } from "lucide-react"
import Link from "next/link"
import Card from "@/components/ui/card"
import Button from "@/components/ui/button"
import PageHeader from "@/components/ui/page-header"
import Spinner from "@/components/ui/spinner"

interface UserItem { uid: string; email: string; displayName: string; role: "super_admin" | "member"; createdAt: string; isActive: boolean }

export default function UsersPage() {
  const { user } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "super_admin") { router.push("/dashboard"); return }
    async function fetchUsers() {
      try { const res = await fetch("/api/users"); if (res.ok) { const data = await res.json(); setUsers(data.users || []) } }
      catch { /* silently fail */ } finally { setLoading(false) }
    }
    fetchUsers()
  }, [user, router])

  if (user?.role !== "super_admin") return null
  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Team members"
        description="Manage your organization"
        action={<Button onClick={() => router.push("/dashboard/users/add")} size="sm">Add member</Button>}
      />

      <Card>
        <div className="divide-y divide-black/[0.04]">
          {users.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">No team members yet</div>
          ) : users.map((u, i) => (
            <div key={u.uid} className="flex items-center justify-between px-4 py-3.5 sm:px-5 animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {(u.displayName || u.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{u.displayName}</p>
                  <p className="truncate text-[13px] text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${u.role === "super_admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Shield size={10} />
                  {u.role === "super_admin" ? "Admin" : "Member"}
                </span>
                <Link href={`/dashboard/users/${u.uid}/edit`} className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Pencil size={12} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
