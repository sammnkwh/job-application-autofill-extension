import * as React from "react"

import { cn } from "@/lib/utils"

// Midday-style Textarea
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full border border-[#e5e5e5] bg-transparent px-3 py-2 text-sm text-[#121212] transition-colors",
        "placeholder:text-[#878787]",
        "focus:outline-none focus:border-[#121212] focus:ring-0",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f5f5]",
        "resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
