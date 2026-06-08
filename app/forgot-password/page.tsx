"use client"

import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { getAuthInstance } from "@/lib/firebase"
import Link from "next/link"
import toast from "react-hot-toast"
import { Shield, ArrowLeft, Mail, Send } from "lucide-react"

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
      toast.success("Check your email for the reset link")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Link
          href="/login"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Shield className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Reset password</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {sent
                ? "Check your inbox for the reset link"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send size={16} />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="rounded-lg bg-emerald-50 p-4 text-center text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              Reset link sent to <span className="font-semibold">{email}</span>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500">
            Remember your password?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
