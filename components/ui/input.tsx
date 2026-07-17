import { forwardRef } from "react"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, type, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`h-10 w-full rounded-xl bg-muted px-3.5 text-sm text-foreground shadow-xs transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-card ${icon ? "pl-9" : ""} ${className}`}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
