"use client"

import { useState, useEffect } from "react"
import { useUser } from "./layout"
import { Key, Users, Share2, Shield, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import Card from "@/components/ui/card"
import PageHeader from "@/components/ui/page-header"

interface Stats {
  totalCredentials: number
  sharedWithMe: number
  totalUsers: number
  myCredentials: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({ totalCredentials: 0, sharedWithMe: 0, totalUsers: 0, myCredentials: 0 })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/credentials")
        if (res.ok) {
          const data = await res.json()
          setStats({ totalCredentials: data.total || 0, sharedWithMe: data.sharedWithMe || 0, totalUsers: data.totalUsers || 0, myCredentials: data.myCredentials || 0 })
        }
      } catch { /* silently fail */ }
    }
    fetchStats()
  }, [])

  const isSuperAdmin = user?.role === "super_admin"

  const statCards = [
    { label: "Credentials", value: stats.myCredentials, icon: Key, href: "/dashboard/credentials" },
    { label: "Shared with me", value: stats.sharedWithMe, icon: Share2, href: "/dashboard/shared" },
    ...(isSuperAdmin ? [{ label: "Team", value: stats.totalUsers, icon: Users, href: "/dashboard/users" }] : []),
    { label: "Total", value: stats.totalCredentials, icon: Shield, href: "/dashboard/credentials" },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title={`Hello, ${user?.displayName || "there"}`}
        description="Here&apos;s your organization overview"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <Link key={card.label} href={card.href}>
              <Card hover className="p-5">
                <div className="animate-count-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Icon size={17} className="text-primary" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{card.value}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{card.label}</p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="p-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h2>
        <div className="mt-3 space-y-2">
          <Link
            href="/dashboard/credentials/new"
            className="group flex items-center justify-between rounded-xl bg-muted/60 p-3.5 transition-colors hover:bg-muted"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Key size={15} className="text-primary" />
              </div>
              Add credential
            </span>
            <ArrowUpRight size={15} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          {isSuperAdmin && (
            <Link
              href="/dashboard/users/add"
              className="group flex items-center justify-between rounded-xl bg-muted/60 p-3.5 transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Users size={15} className="text-primary" />
                </div>
                Invite team member
              </span>
              <ArrowUpRight size={15} className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </Card>
    </div>
  )
}
