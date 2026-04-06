import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
        variant === 'outline' ? 'border-gray-300' :
        variant === 'secondary' ? 'border-transparent bg-gray-200' :
        variant === 'destructive' ? 'border-transparent bg-red-600 text-white' :
        'border-transparent bg-blue-600 text-white'
      } ${className || ''}`}
      {...props}
    />
  )
)
Badge.displayName = "Badge"
