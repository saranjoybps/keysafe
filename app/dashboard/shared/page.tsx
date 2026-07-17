"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Share2, Globe } from "lucide-react"
import Card from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import PageHeader from "@/components/ui/page-header"
import Spinner from "@/components/ui/spinner"

interface SharedCredential { id: string; serviceName: string; url: string; username: string; createdBy: string; createdAt: string; sharedWith: Array<{ userId: string; email: string; permission: string }> }

export default function SharedWithMePage() {
  const router = useRouter()
  const [sharedCredentials, setSharedCredentials] = useState<SharedCredential[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShared() {
      try {
        const res = await fetch("/api/credentials/shared")
        if (res.ok) { const data = await res.json(); setSharedCredentials(data.credentials || []) }
      } catch { /* silently fail */ } finally { setLoading(false) }
    }
    fetchShared()
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Shared with me" description="Credentials others have shared with you" />

      {sharedCredentials.length === 0 ? (
        <EmptyState icon={Share2} title="Nothing shared yet" description="When someone shares a credential, it will appear here" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sharedCredentials.map((cred, i) => (
            <div key={cred.id} onClick={() => router.push(`/dashboard/credentials/${cred.id}`)} className="cursor-pointer animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <Card hover className="p-4">
                <h3 className="truncate text-sm font-medium text-foreground">{cred.serviceName}</h3>
                {cred.url && (
                  <div className="mt-1 flex items-center gap-1 text-[13px] text-primary">
                    <Globe size={11} />
                    <span className="truncate max-w-[180px]">{cred.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                <p className="mt-1.5 font-mono text-xs text-muted-foreground">{cred.username}</p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{new Date(cred.createdAt).toLocaleDateString()}</span>
                  <span className="rounded-lg bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">Shared</span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
