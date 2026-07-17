"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Save } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Card, { CardHeader } from "@/components/ui/card"
import Spinner from "@/components/ui/spinner"
import BackLink from "@/components/ui/back-link"

export default function EditCredentialPage() {
  const params = useParams()
  const router = useRouter()
  const [serviceName, setServiceName] = useState("")
  const [url, setUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchCredential() {
      try {
        const res = await fetch(`/api/credentials/${params.id}`)
        if (!res.ok) { if (res.status === 403 || res.status === 404) { router.push("/dashboard/credentials"); return } throw new Error("Failed") }
        const data = await res.json()
        setServiceName(data.serviceName || ""); setUrl(data.url || ""); setUsername(data.username || "")
      } catch { toast.error("Failed to load"); router.push("/dashboard/credentials") }
      finally { setFetching(false) }
    }
    fetchCredential()
  }, [params.id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const body: Record<string, string> = { serviceName, url, username }
      if (password) body.password = password
      const res = await fetch(`/api/credentials/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Updated"); router.push(`/dashboard/credentials/${params.id}`)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Something went wrong") }
    finally { setLoading(false) }
  }

  if (fetching) return <Spinner />

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <BackLink href={`/dashboard/credentials/${params.id}`} label="Credential" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Edit credential</h1>
        <p className="text-sm text-muted-foreground">Leave password blank to keep current</p>
      </div>

      <Card>
        <CardHeader className="border-b border-black/[0.04]">
          <p className="text-[13px] font-medium text-foreground">Details</p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label htmlFor="service" className="text-[13px] font-medium text-foreground">Service name</label>
            <Input id="service" type="text" required value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="url" className="text-[13px] font-medium text-foreground">
              URL <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-[13px] font-medium text-foreground">Username / Email</label>
            <Input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-foreground">
              New password <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading}><Save size={16} /> Save changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
