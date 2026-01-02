import * as React from "react"

import { cn } from "@/lib/utils"

// Midday-style Input component - full border box with visible focus
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full bg-white px-3 py-2 text-sm text-[#121212]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[#878787]",
          "focus:outline-none focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f5f5]",
          "transition-colors duration-150",
          className
        )}
        style={{
          border: '1px solid #DCDAD2',
          borderRadius: 0,
          boxSizing: 'border-box',
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
