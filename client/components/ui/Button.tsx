import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
    }
    const sizes = {
      sm: 'btn-sm',
      md: 'btn-md',
      lg: 'btn-lg',
    }
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'btn',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
