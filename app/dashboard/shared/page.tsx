"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Share2, Globe, ExternalLink } from "lucide-react"

interface SharedCredential {
  id: string
  serviceName: string
  url: string
  username: string
  createdBy: string
  createdAt: string
  sharedWith: Array<{ userId: string; email: string; permission: string }>
}

export default function SharedWithMePage() {
  const [sharedCredentials, setSharedCredentials] = useState<SharedCredential[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShared() {
      try {
        const res = await fetch("/api/credentials/shared")
        if (res.ok) {
          const data = await res.json()
          setSharedCredentials(data.credentials || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchShared()
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
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Shared with Me</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Credentials that others have shared with you
        </p>
      </div>

      {sharedCredentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
          <Share2 size={40} className="text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Nothing shared yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            When someone shares a credential with you, it will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sharedCredentials.map((cred) => (
            <Link
              key={cred.id}
              href={`/dashboard/credentials/${cred.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
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
              <div className="mt-4 flex items-center gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-400 dark:border-zinc-800">
                <span>{new Date(cred.createdAt).toLocaleDateString()}</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Shared
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
