"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Save } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Card, { CardHeader } from "@/components/ui/card"
import BackLink from "@/components/ui/back-link"

export default function NewCredentialPage() {
  const router = useRouter()
  const [serviceName, setServiceName] = useState("")
  const [url, setUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName, url, username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      toast.success("Credential saved")
      router.push("/dashboard/credentials")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="space-y-1">
        <BackLink href="/dashboard/credentials" label="Credentials" />
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Add credential</h1>
        <p className="text-sm text-muted-foreground">Store a credential securely</p>
      </div>

      <Card>
        <CardHeader className="border-b border-black/[0.04]">
          <p className="text-[13px] font-medium text-foreground">Details</p>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label htmlFor="service" className="text-[13px] font-medium text-foreground">Service name</label>
            <Input id="service" type="text" required value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="AWS Console" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="url" className="text-[13px] font-medium text-foreground">
              URL <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://console.aws.amazon.com" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-[13px] font-medium text-foreground">Username / Email</label>
            <Input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin@example.com" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-foreground">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading}>
              <Save size={16} />
              Save credential
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
