import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'badge badge-default',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
