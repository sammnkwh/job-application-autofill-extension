import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormFieldProps {
  label: string
  htmlFor?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  helperText,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-[#121212]">
        {label}
        {required && <span className="text-[#606060] ml-0.5">*</span>}
      </Label>
      {children}
      {helperText && (
        <p className="text-sm text-[#606060]">{helperText}</p>
      )}
    </div>
  )
}
