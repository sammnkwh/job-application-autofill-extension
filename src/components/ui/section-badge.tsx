import * as React from "react"
import { cn } from "@/lib/utils"

// Checkmark icon component
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.5 4.5L6.5 11.5L3 8"
      stroke="#22C55E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface SectionBadgeProps {
  complete: boolean
  missingCount?: number
  className?: string
  optional?: boolean
}

const SectionBadge = React.forwardRef<HTMLSpanElement, SectionBadgeProps>(
  ({ complete, missingCount = 0, className, optional = false }, ref) => {
    if (complete) {
      return (
        <span
          ref={ref}
          className={cn("inline-flex items-center", className)}
          title="Section complete"
          aria-label="Section complete"
        >
          <CheckIcon />
        </span>
      )
    }

    if (missingCount > 0) {
      const optionalSuffix = optional ? ' (optional)' : ''
      const displayText = `${missingCount} missing${optionalSuffix}`
      const titleText = `${missingCount} field${missingCount > 1 ? 's' : ''} missing${optionalSuffix}`

      return (
        <span
          ref={ref}
          className={cn(
            "inline-flex items-center text-xs text-[#9CA3AF] font-normal",
            className
          )}
          title={titleText}
          aria-label={titleText}
        >
          {displayText}
        </span>
      )
    }

    return null
  }
)

SectionBadge.displayName = "SectionBadge"

export { SectionBadge }
export type { SectionBadgeProps }
