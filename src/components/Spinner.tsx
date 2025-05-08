import { cn } from "../lib/utils"

 

export type SpinnerProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg' | number
}
export const Spinner = ({ className, size }: SpinnerProps) => {
  const finalSize = ((size?: string | number) => {
    if (typeof size === 'string') {
      switch (size) {
        case 'sm':
          return 24
        case 'md':
          return 36
        case 'lg':
          return 48
        default:
          return 24
      }
    } else if (typeof size === 'number') return size
    else return 24
  })(size)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={finalSize}
      height={finalSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}