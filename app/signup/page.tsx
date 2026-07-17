"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { getAuthInstance } from "@/lib/firebase"
import Link from "next/link"
import toast from "react-hot-toast"
import { Eye, EyeOff, Shield, ArrowRight } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, tenantName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
      await signInWithEmailAndPassword(getAuthInstance(), email, password)
      toast.success("Welcome to KeySafe")
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[360px] space-y-10">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <Shield size={22} className="text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Create organization</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up KeySafe for your team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-[13px] font-medium text-foreground">Your name</label>
            <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tenant" className="text-[13px] font-medium text-foreground">Organization name</label>
            <Input id="tenant" type="text" required value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Acme Corp" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-foreground">Email</label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-foreground">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground" tabIndex={-1}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create organization
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="font-medium text-foreground transition-colors hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
