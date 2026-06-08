"use client"

import { useState, useEffect } from "react"
import { useUser } from "../layout"
import { useRouter } from "next/navigation"
import { Plus, Shield, Pencil } from "lucide-react"
import Link from "next/link"

interface UserItem {
  uid: string
  email: string
  displayName: string
  role: "super_admin" | "member"
  createdAt: string
  isActive: boolean
}

export default function UsersPage() {
  const { user } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== "super_admin") {
      router.push("/dashboard")
      return
    }
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users")
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [user, router])

  if (user?.role !== "super_admin") return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Team Members</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage users in your organization
          </p>
        </div>
        <Link
          href="/dashboard/users/add"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Add User
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-sm font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u.uid} className="bg-white text-sm dark:bg-zinc-900">
                  <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {u.displayName.charAt(0).toUpperCase()}
                      </div>
                      {u.displayName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "super_admin"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      <Shield size={12} />
                      {u.role === "super_admin" ? "Super Admin" : "Member"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/users/${u.uid}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <Pencil size={14} />
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-zinc-200 sm:hidden dark:divide-zinc-800">
          {users.map((u) => (
            <div key={u.uid} className="bg-white px-4 py-4 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {u.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                    {u.displayName}
                  </p>
                  <p className="truncate text-sm text-zinc-500">{u.email}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    u.role === "super_admin"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  }`}
                >
                  <Shield size={12} />
                  {u.role === "super_admin" ? "Admin" : "Member"}
                </span>
              </div>
              <Link
                href={`/dashboard/users/${u.uid}/edit`}
                className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Pencil size={14} />
                Edit
              </Link>
            </div>
          ))}
          {users.length === 0 && (
            <div className="px-4 py-12 text-center text-zinc-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  )
}
