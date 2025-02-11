import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function Spinner({ className, ...props }: SpinnerProps): void {
  return (
    <div
      className={cn(
        'h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      {...props}
    >
      <span className='sr-only'>Loading...</span>
    </div>
  );
}
