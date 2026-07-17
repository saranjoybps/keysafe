import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface BackLinkProps {
  href: string
  label: string
}

export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Link>
  )
}
