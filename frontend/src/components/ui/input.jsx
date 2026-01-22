import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "transition-all duration-200",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-sky-400/50",
          "focus-visible:border-sky-400",
          "dark:focus-visible:ring-sky-400/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
