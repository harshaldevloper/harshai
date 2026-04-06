import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {children}
    </div>
  )
}

export const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`relative z-50 grid w-full max-w-lg gap-4 bg-white p-6 shadow-lg sm:rounded-lg ${className || ''}`} {...props} />
))
DialogContent.displayName = "DialogContent"

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`} {...props} />
)
DialogHeader.displayName = "DialogHeader"

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...props} />
))
DialogTitle.displayName = "DialogTitle"
