"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Key, Plus, Globe, ExternalLink } from "lucide-react"

interface CredentialItem {
  id: string
  serviceName: string
  url: string
  username: string
  createdBy: string
  createdAt: string
  sharedWith: Array<{ userId: string; email: string; permission: string }>
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<CredentialItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const res = await fetch("/api/credentials")
        if (res.ok) {
          const data = await res.json()
          setCredentials(data.credentials || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchCredentials()
  }, [])

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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Credentials</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your saved credentials
          </p>
        </div>
        <Link
          href="/dashboard/credentials/new"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Credential
        </Link>
      </div>

      {credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
          <Key size={40} className="text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">No credentials yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Add your first credential to get started</p>
          <Link
            href="/dashboard/credentials/new"
            className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Credential
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred) => {
            const sharedCount = (cred as { sharedWith?: Array<unknown> }).sharedWith?.length || 0
            return (
              <Link
                key={cred.id}
                href={`/dashboard/credentials/${cred.id}`}
                className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {cred.serviceName}
                    </h3>
                    {cred.url && (
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500"
                      >
                        <Globe size={12} />
                        <span className="truncate max-w-[200px]">{cred.url.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                    <p className="mt-1 text-sm text-zinc-500">{cred.username}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
                  <span>{new Date(cred.createdAt).toLocaleDateString()}</span>
                  {sharedCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      Shared {sharedCount}
                    </span>
                  )}
                  <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                    View &rarr;
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
