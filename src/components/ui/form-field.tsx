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
  incomplete?: boolean
  incompleteMessage?: string
}

export function FormField({
  label,
  htmlFor,
  helperText,
  required,
  children,
  className,
  incomplete,
  incompleteMessage,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-[#121212]">
        {label}
        {required && <span className="text-[#606060] ml-0.5">*</span>}
      </Label>
      {incomplete ? (
        <div
          className="rounded-md"
          style={{
            border: '2px dashed #F59E0B',
            padding: '1px',
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
      {incomplete && incompleteMessage && (
        <p className="text-sm text-[#9CA3AF]">{incompleteMessage}</p>
      )}
      {helperText && !incomplete && (
        <p className="text-sm text-[#525252]">{helperText}</p>
      )}
    </div>
  )
}
