"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "../../../layout"
import { Save } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Select from "@/components/ui/select"
import Card, { CardHeader } from "@/components/ui/card"
import Spinner from "@/components/ui/spinner"
import BackLink from "@/components/ui/back-link"

interface UserData { uid: string; displayName: string; email: string; role: "super_admin" | "member" }

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<"member" | "super_admin">("member")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user?.role !== "super_admin") { router.push("/dashboard"); return }
    async function fetchUser() {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const data = await res.json()
          const found = (data.users || []).find((u: UserData) => u.uid === params.uid)
          if (found) { setDisplayName(found.displayName); setRole(found.role) }
          else { toast.error("User not found"); router.push("/dashboard/users") }
        }
      } catch { toast.error("Failed to load user"); router.push("/dashboard/users") }
      finally { setFetching(false) }
    }
    fetchUser()
  }, [user, params.uid, router])

  if (user?.role !== "super_admin") return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch(`/api/users/${params.uid}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName, role }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("User updated"); router.push("/dashboard/users")
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
    finally { setLoading(false) }
  }

  if (fetching) return <Spinner />

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <BackLink href="/dashboard/users" label="Team" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Edit team member</h1>
        <p className="text-sm text-muted-foreground">Update name or role</p>
      </div>

      <Card>
        <CardHeader className="border-b border-black/[0.04]">
          <p className="text-[13px] font-medium text-foreground">Details</p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-[13px] font-medium text-foreground">Full name</label>
            <Input id="name" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-[13px] font-medium text-foreground">Role</label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as "member" | "super_admin")}>
              <option value="member">Member</option>
              <option value="super_admin">Super Admin</option>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading}><Save size={16} /> Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
