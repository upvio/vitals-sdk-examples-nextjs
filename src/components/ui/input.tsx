import type { ComponentProps } from 'react'

type InputProps = ComponentProps<'input'>

export function Input({ className = '', ...props }: InputProps) {
  const base =
    'w-full rounded-md border border-input bg-background' +
    ' px-2 py-2 text-foreground' +
    ' focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <input
      className={`${base}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}
