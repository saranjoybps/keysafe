interface BadgeProps {
  variant?: "default" | "secondary" | "destructive" | "success"
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = "default", className = "", children }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-muted text-muted-foreground",
    destructive: "bg-destructive/10 text-destructive",
    success: "bg-success/10 text-success",
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
