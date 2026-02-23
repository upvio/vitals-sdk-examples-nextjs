import type { ComponentProps } from 'react'

type TextareaProps = ComponentProps<'textarea'>

export function Textarea({ className = '', ...props }: TextareaProps) {
  const base =
    'w-full rounded-md border border-input bg-background' +
    ' px-2 py-2 font-mono text-sm text-foreground' +
    ' focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <textarea
      className={`${base}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}
