import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-16 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Icon size={22} className="text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
