"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "../../../layout"
import { ArrowLeft, Save, Shield } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface UserData {
  uid: string
  displayName: string
  email: string
  role: "super_admin" | "member"
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [displayName, setDisplayName] = useState("")
  const [role, setRole] = useState<"member" | "super_admin">("member")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (user?.role !== "super_admin") {
      router.push("/dashboard")
      return
    }

    async function fetchUser() {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const data = await res.json()
          const found = (data.users || []).find(
            (u: UserData) => u.uid === params.uid
          )
          if (found) {
            setDisplayName(found.displayName)
            setRole(found.role)
          } else {
            toast.error("User not found")
            router.push("/dashboard/users")
          }
        }
      } catch {
        toast.error("Failed to load user")
        router.push("/dashboard/users")
      } finally {
        setFetching(false)
      }
    }
    fetchUser()
  }, [user, params.uid, router])

  if (user?.role !== "super_admin") return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/users/${params.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user")
      }

      toast.success("User updated")
      router.push("/dashboard/users")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href="/dashboard/users"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Edit Team Member</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update name or role for this team member
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Shield size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Member Details</p>
            <p className="text-xs text-zinc-500">Update the information below</p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Role
          </label>
          <div className="relative mt-1">
            <Shield size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "member" | "super_admin")}
              className="block w-full rounded-lg border border-zinc-300 py-2.5 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="member">Member</option>
              <option value="super_admin">Super Admin</option>
            </select>
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
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  )
}
