import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          variant === 'outline' ? 'border border-gray-300 hover:bg-gray-100' : 
          variant === 'ghost' ? 'bg-transparent hover:bg-gray-100' :
          variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${size === 'sm' ? 'text-sm px-3 py-1' : size === 'lg' ? 'text-lg px-6 py-3' : ''} ${className || ''}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
