import * as React from "react"
import { cn } from "@/lib/utils"

// Color and label thresholds
const THRESHOLDS = [
  { max: 25, color: '#9CA3AF', label: 'Getting Started' },
  { max: 50, color: '#F59E0B', label: 'Good' },
  { max: 75, color: '#84CC16', label: 'Strong' },
  { max: 100, color: '#22C55E', label: 'Complete' },
] as const

function getThreshold(value: number) {
  for (const threshold of THRESHOLDS) {
    if (value <= threshold.max) {
      return threshold
    }
  }
  return THRESHOLDS[THRESHOLDS.length - 1]
}

interface MissingSection {
  name: string
  missing: number
}

interface SegmentedProgressProps {
  value: number
  className?: string
  missingSections?: MissingSection[]
  showLabel?: boolean
}

const SegmentedProgress = React.forwardRef<
  HTMLDivElement,
  SegmentedProgressProps
>(({ value, className, missingSections = [], showLabel = true }, ref) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const threshold = getThreshold(value)
  const segments = 4

  // Calculate how many segments should be filled
  const filledSegments = Math.ceil((value / 100) * segments)

  // Filter to only show sections that have missing items
  const incompleteSections = missingSections.filter(s => s.missing > 0)

  return (
    <div className={cn("space-y-2", className)} ref={ref}>
      {/* Label row */}
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#606060]">Profile Completeness</span>
          <div className="flex items-center gap-2">
            <span
              className="font-medium"
              style={{ color: threshold.color }}
            >
              {threshold.label}
            </span>
            <span className="text-[#606060]">{value}%</span>
          </div>
        </div>
      )}

      {/* Progress bar container */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Profile ${value}% complete - ${threshold.label}`}
      >
        {/* Segmented bar */}
        <div className="flex gap-1 h-2">
          {Array.from({ length: segments }).map((_, index) => {
            const isFilled = index < filledSegments
            const isPartial = index === filledSegments - 1 && value % 25 !== 0

            // Calculate partial fill percentage for the last filled segment
            const partialFill = isPartial
              ? ((value % 25) / 25) * 100
              : 100

            return (
              <div
                key={index}
                className="flex-1 rounded-full overflow-hidden"
                style={{ backgroundColor: '#E5E5E5' }}
              >
                {isFilled && (
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: isPartial ? `${partialFill}%` : '100%',
                      backgroundColor: threshold.color,
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Tooltip */}
        {showTooltip && incompleteSections.length > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50"
            role="tooltip"
          >
            <div className="bg-[#1A1A1A] text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
              <p className="font-medium mb-1">Sections needing attention:</p>
              <ul className="space-y-0.5">
                {incompleteSections.map((section) => (
                  <li key={section.name} className="text-[#A1A1A1]">
                    {section.name} ({section.missing} missing)
                  </li>
                ))}
              </ul>
              {/* Tooltip arrow */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1A1A1A]" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

SegmentedProgress.displayName = "SegmentedProgress"

export { SegmentedProgress, getThreshold, THRESHOLDS }
export type { MissingSection, SegmentedProgressProps }
