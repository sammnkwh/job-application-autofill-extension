"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { Plus, X } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  style,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("", className)}
      style={{
        border: 'none',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: '1px solid #E5E7EB',
        margin: 0,
        padding: 0,
        background: 'transparent',
        boxShadow: 'none',
        ...style,
      }}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header
      className="flex bg-transparent"
      style={{ border: 'none', margin: 0, padding: 0 }}
    >
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group w-full flex flex-1 items-center justify-between py-[40px] text-left bg-transparent outline-none disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        style={{
          border: 'none',
          fontFamily: "'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        {...props}
      >
        <div className="flex-1 pr-8 pl-0 flex items-center">
          {children}
        </div>
        <Plus
          data-icon="plus"
          className="shrink-0 h-5 w-5 text-[#9CA3AF] group-hover:text-[#4B5563] transition-colors group-data-[state=open]:hidden"
        />
        <X
          data-icon="x"
          className="shrink-0 h-5 w-5 text-[#9CA3AF] group-hover:text-[#4B5563] transition-colors hidden group-data-[state=open]:block"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-visible bg-transparent data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      style={{
        border: 'none',
        fontFamily: "'Geist', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      {...props}
    >
      <div className={cn("pt-0 pl-0 bg-transparent", className)} style={{ border: 'none', paddingBottom: 40 }}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
