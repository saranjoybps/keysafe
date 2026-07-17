"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { getAuthInstance } from "@/lib/firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  Menu,
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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/credentials", label: "Credentials", icon: Key },
  { href: "/dashboard/shared", label: "Shared", icon: Share2 },
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
        if (!cancelled) router.push("/login")
        return
      }

      try {
        const tokenResult = await firebaseUser.getIdTokenResult()
        const claims = tokenResult.claims
        if (!cancelled) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            tenantId: (claims.tenantId as string) || "",
            role: (claims.role as "super_admin" | "member") || "member",
          })
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const currentUser = auth.currentUser
    if (currentUser) resolveUser(currentUser)

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      resolveUser(firebaseUser)
    })

    return () => { cancelled = true; unsubscribe() }
  }, [router])

  async function handleLogout() {
    await signOut(getAuthInstance())
    await fetch("/api/auth/logout", { method: "POST" })
    toast.success("Signed out")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <span className="inline-block h-8 w-8 rounded-full border-2 border-muted" />
          <span className="absolute inset-0 inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const isSuperAdmin = user.role === "super_admin"

  const allNavItems = isSuperAdmin
    ? [...navItems, { href: "/dashboard/users", label: "Team", icon: Users }, { href: "/dashboard/audit", label: "Audit", icon: Activity }]
    : navItems

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <UserContext.Provider value={{ user }}>
      <div className="flex min-h-screen bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar-bg transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20">
              <Shield size={16} className="text-primary" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">KeySafe</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {allNavItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-fg hover:bg-sidebar-hover hover:text-white"
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-3 pb-4">
            <div className="rounded-xl bg-sidebar-accent p-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">
                    {user.displayName || "User"}
                  </p>
                  <p className="truncate text-[11px] text-sidebar-fg">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-2.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-sidebar-fg transition-colors hover:bg-sidebar-hover hover:text-white"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-black/[0.04] bg-background/80 px-5 backdrop-blur-xl lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-primary">
                  <Shield size={10} />
                  Admin
                </span>
              )}
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-5 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </UserContext.Provider>
  )
}
