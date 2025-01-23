import { cn } from '@/lib/utils'

type SkeletonLoaderProps = {
  lines?: number
  className?: string
  lineClassName?: string
}

export function SkeletonLoader({ lines = 3, className, lineClassName }: SkeletonLoaderProps) {
  return (
    <div
      role='status'
      aria-label='Loading content'
      className={cn('animate-pulse space-y-2', className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 rounded bg-muted',
            i === 0 && 'w-3/4',
            i === lines - 1 && 'w-1/2',
            lineClassName
          )}
        />
      ))}
      <span className='sr-only'>Loading...</span>
    </div>
  )
}
