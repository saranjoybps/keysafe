"use client"

import { useState, useEffect } from "react"
import { useUser } from "./layout"
import { Key, Users, Share2, Shield } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalCredentials: number
  sharedWithMe: number
  totalUsers: number
  myCredentials: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stats>({
    totalCredentials: 0,
    sharedWithMe: 0,
    totalUsers: 0,
    myCredentials: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/credentials")
        if (res.ok) {
          const data = await res.json()
          setStats({
            totalCredentials: data.total || 0,
            sharedWithMe: data.sharedWithMe || 0,
            totalUsers: data.totalUsers || 0,
            myCredentials: data.myCredentials || 0,
          })
        }
      } catch {
        // silently fail
      }
    }
    fetchStats()
  }, [])

  const isSuperAdmin = user?.role === "super_admin"

  const cards = [
    {
      label: "My Credentials",
      value: stats.myCredentials,
      icon: Key,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      href: "/dashboard/credentials",
    },
    {
      label: "Shared with Me",
      value: stats.sharedWithMe,
      icon: Share2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      href: "/dashboard/shared",
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Team Members",
            value: stats.totalUsers,
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50 dark:bg-violet-900/20",
            href: "/dashboard/users",
          },
        ]
      : []),
    {
      label: "Total Credentials",
      value: stats.totalCredentials,
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      href: "/dashboard/credentials",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome back{user?.displayName ? `, ${user.displayName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Here&apos;s your organization overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`rounded-xl border border-zinc-200 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 ${card.bg}`}
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2 ${card.bg}`}>
                  <Icon className={card.color} size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {card.value}
                  </p>
                  <p className="text-sm text-zinc-500">{card.label}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/credentials/new"
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Key size={20} className="text-blue-600" />
            Add New Credential
          </Link>
          {isSuperAdmin && (
            <Link
              href="/dashboard/users/add"
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Users size={20} className="text-violet-600" />
              Invite Team Member
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
