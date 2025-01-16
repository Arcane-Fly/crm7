import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export function CardSkeleton() {
  return (
    <div className='space-y-3'>
      <Skeleton className='h-[125px] w-full rounded-xl' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-[200px]' />
        <Skeleton className='h-4 w-[160px]' />
      </div>
    </div>
  )
}

export function RateCalculatorSkeleton() {
  return (
    <div className='space-y-4' data-testid='rate-calculator-skeleton'>
      <Skeleton className='h-8 w-[200px]' />
      <Skeleton className='h-10 w-full' />
      <Skeleton className='h-10 w-[120px]' />
      <Skeleton className='h-[200px] w-full rounded-xl' />
    </div>
  )
}
