interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export default function Card({ className = "", hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04] ${hover ? "transition-all duration-200 hover:shadow-md hover:ring-black/[0.08] hover:-translate-y-0.5" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 pb-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
