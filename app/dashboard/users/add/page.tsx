"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../../layout"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Select from "@/components/ui/select"
import Card, { CardHeader } from "@/components/ui/card"
import BackLink from "@/components/ui/back-link"

export default function AddUserPage() {
  const { user } = useUser()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"member" | "super_admin">("member")
  const [loading, setLoading] = useState(false)

  if (user?.role !== "super_admin") { router.push("/dashboard"); return null }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, displayName, password, role }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success(`${displayName} added`); router.push("/dashboard/users")
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
    finally { setLoading(false) }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <BackLink href="/dashboard/users" label="Team" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Add team member</h1>
        <p className="text-sm text-muted-foreground">Create an account for your organization</p>
      </div>

      <Card>
        <CardHeader className="border-b border-black/[0.04]">
          <p className="text-[13px] font-medium text-foreground">Details</p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-[13px] font-medium text-foreground">Full name</label>
            <Input id="name" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-foreground">Email</label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-foreground">Temporary password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-[13px] font-medium text-foreground">Role</label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as "member" | "super_admin")}>
              <option value="member">Member</option>
              <option value="super_admin">Super Admin</option>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading}><UserPlus size={16} /> Add member</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
