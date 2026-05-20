import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'input',
            error && 'border-[var(--red)] focus:border-[var(--red)] focus:shadow-[0_0_0_3px_rgba(191,109,109,0.1)]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--red)]">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
