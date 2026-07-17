import { forwardRef } from "react"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", icon, children, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <select
          ref={ref}
          className={`h-10 w-full appearance-none rounded-xl bg-muted px-3.5 text-sm text-foreground shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-card ${icon ? "pl-9" : ""} ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  }
)

Select.displayName = "Select"

export default Select
