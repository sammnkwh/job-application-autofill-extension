import * as React from "react"

import { cn } from "@/lib/utils"

// Midday-style Input component
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full border border-[#e5e5e5] bg-transparent px-3 py-2 text-sm text-[#121212] transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[#878787]",
          "focus:outline-none focus:border-[#121212] focus:ring-0",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f5f5]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
