import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Sharp corner button variants with white text
const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#121212] text-white hover:bg-[#1A1A1A] rounded-none border-0 [&]:text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 rounded-none border-0",
        outline:
          "border border-[#D1D5DB] !bg-[#FFFFFF] text-[#1A1A1A] hover:!bg-[#FFFFFF] hover:border-[#1A1A1A] rounded-none transition-all",
        secondary:
          "bg-[#f5f5f5] text-[#1A1A1A] hover:bg-[#e5e5e5] rounded-none border-0",
        ghost: "text-[#606060] hover:bg-[#f5f5f5] hover:text-[#1A1A1A] rounded-none",
        link: "text-[#1A1A1A] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const isDefaultVariant = variant === undefined || variant === "default"
    const isOutlineVariant = variant === "outline"

    const computedStyle = {
      borderRadius: 0,
      ...(isDefaultVariant ? { color: '#FFFFFF' } : {}),
      ...(isOutlineVariant ? {
        color: '#1A1A1A'
      } : {}),
      ...style
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
