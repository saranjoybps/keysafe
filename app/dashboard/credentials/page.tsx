"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Key, Globe } from "lucide-react"
import Button from "@/components/ui/button"
import Card from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import PageHeader from "@/components/ui/page-header"
import Spinner from "@/components/ui/spinner"

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
  const router = useRouter()
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
      } catch { /* silently fail */ } finally {
        setLoading(false)
      }
    }
    fetchCredentials()
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Credentials"
        description="Your saved credentials"
        action={
          <Button onClick={() => router.push("/dashboard/credentials/new")} size="sm">
            Add credential
          </Button>
        }
      />

      {credentials.length === 0 ? (
        <EmptyState
          icon={Key}
          title="No credentials yet"
          description="Store your first credential to get started"
          action={<Button onClick={() => router.push("/dashboard/credentials/new")} size="sm">Add credential</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {credentials.map((cred, i) => {
            const sharedCount = (cred as { sharedWith?: Array<unknown> }).sharedWith?.length || 0
            return (
              <div
                key={cred.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) return
                  router.push(`/dashboard/credentials/${cred.id}`)
                }}
                className="cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <Card hover className="p-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-foreground">{cred.serviceName}</h3>
                    {cred.url && (
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 inline-flex items-center gap-1 text-[13px] text-primary transition-colors hover:text-primary/80"
                      >
                        <Globe size={11} />
                        <span className="truncate max-w-[180px]">{cred.url.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                    <p className="mt-1.5 font-mono text-xs text-muted-foreground">{cred.username}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{new Date(cred.createdAt).toLocaleDateString()}</span>
                    {sharedCount > 0 && (
                      <span className="rounded-lg bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Shared {sharedCount}
                      </span>
                    )}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
