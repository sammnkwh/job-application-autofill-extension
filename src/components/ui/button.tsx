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
          "bg-[#1A1A1A] text-white hover:bg-[#333333] rounded-none border-0",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 rounded-none border-0",
        outline:
          "border-[1px] border-solid border-[#DCDAD2] bg-white text-[#1A1A1A] hover:bg-[#f5f5f5] rounded-none",
        secondary:
          "bg-[#f5f5f5] text-[#1A1A1A] hover:bg-[#e5e5e5] rounded-none border-0",
        ghost: "text-[#606060] hover:bg-[#f5f5f5] hover:text-[#1A1A1A] rounded-none",
        link: "text-[#1A1A1A] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
