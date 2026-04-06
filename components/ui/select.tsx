import * as React from "react"

export const Select: React.FC<{ value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }> = ({ value, onValueChange, children }) => {
  return <div className="relative">{children}</div>
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => (
  <button ref={ref} className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`} {...props}>
    {children}
    <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => <span>{placeholder}</span>

export const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`relative z-50 mt-1 max-h-60 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md ${className || ''}`} {...props}>
    <div className="p-1">{children}</div>
  </div>
))
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-gray-100 ${className || ''}`} {...props}>
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"
