"use client"

import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { getAuthInstance } from "@/lib/firebase"
import Link from "next/link"
import toast from "react-hot-toast"
import { ArrowLeft, ArrowRight, CheckCircle2, Shield } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(getAuthInstance(), email)
      setSent(true)
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
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Reset password</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {sent ? "Check your inbox" : "Enter your email to get a reset link"}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-foreground">Email</label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="pt-2">
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Send reset link
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center rounded-2xl bg-primary/5 py-8 text-center">
            <CheckCircle2 size={36} className="text-primary" />
            <p className="mt-3 px-6 text-sm font-medium text-foreground">
              Reset link sent to <span className="text-primary">{email}</span>
            </p>
            <p className="mt-1 px-6 text-xs text-muted-foreground">
              Check your spam if you don&apos;t see it
            </p>
          </div>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
