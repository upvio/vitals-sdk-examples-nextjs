import type { ComponentProps } from 'react'

type SelectProps = ComponentProps<'select'>

export function Select({ className = '', ...props }: SelectProps) {
  const base =
    'w-full rounded-md border border-input bg-background' +
    ' px-2 py-2 text-foreground' +
    ' focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <select
      className={`${base}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}
