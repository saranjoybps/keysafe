export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-20 ${className}`}>
      <div className="relative">
        <span className="inline-block h-8 w-8 rounded-full border-2 border-muted" />
        <span className="absolute inset-0 inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  )
}
