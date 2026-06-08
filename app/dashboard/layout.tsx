"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { getAuthInstance } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  Menu,
  X,
  LayoutDashboard,
  Key,
  Share2,
  Users,
  LogOut,
  Shield,
  Activity,
} from "lucide-react"
import toast from "react-hot-toast"

interface UserInfo {
  uid: string
  email: string
  displayName: string
  tenantId: string
  role: "super_admin" | "member"
}

const UserContext = createContext<{ user: UserInfo | null }>({ user: null })
export const useUser = () => useContext(UserContext)

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/credentials", label: "Credentials", icon: Key },
  { href: "/dashboard/shared", label: "Shared with Me", icon: Share2 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const auth = getAuthInstance()

    async function resolveUser(firebaseUser: typeof auth.currentUser) {
      if (!firebaseUser) {
        const sessionRes = await fetch("/api/auth/session-check")
        if (sessionRes.ok) {
          const data = await sessionRes.json()
          if (data.authenticated && data.uid) {
            setUser({
              uid: data.uid,
              email: data.email || "",
              displayName: data.displayName || "",
              tenantId: data.tenantId || "",
              role: data.role || "member",
            })
            setLoading(false)
            return
          }
        }
        if (!cancelled) {
          router.push("/login")
        }
        return
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claims = tokenResult.claims
        const tenantId = (claims.tenantId as string) || ""
        const role = (claims.role as "super_admin" | "member") || "member"

        if (!cancelled) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            tenantId,
            role,
          })
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const currentUser = auth.currentUser
    if (currentUser) {
      resolveUser(currentUser)
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      resolveUser(firebaseUser)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [router])

  async function handleLogout() {
    await signOut(getAuthInstance())
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Signed out")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isSuperAdmin = user.role === "super_admin"

  const allNavItems = isSuperAdmin
    ? [
        ...navItems,
        { href: "/dashboard/users", label: "Users", icon: Users },
        { href: "/dashboard/audit", label: "Audit Log", icon: Activity },
      ]
    : navItems

  return (
    <UserContext.Provider value={{ user }}>
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform dark:bg-zinc-900 dark:shadow-zinc-800 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static lg:translate-x-0`}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="text-blue-600" size={24} />
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">KeySafe</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {allNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-zinc-500 hover:text-zinc-700 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="hidden sm:inline">{user.displayName}</span>
              <span className="hidden sm:inline">/</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {isSuperAdmin ? "Super Admin" : "Member"}
              </span>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  )
}
