import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800',
        className,
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <Skeleton className="mb-3 h-5 w-3/4" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-4 h-3 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
