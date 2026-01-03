import * as React from "react"

import { cn } from "@/lib/utils"

// Midday-style Textarea - full border box with visible focus
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, style, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full bg-white px-3 py-2 text-sm text-[#121212]",
        "border border-[#DCDAD2] rounded-none",
        "placeholder:text-[#878787]",
        "focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212]/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f5f5]",
        "resize-y transition-colors duration-150",
        className
      )}
      style={{
        boxSizing: 'border-box',
        ...style,
      }}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
