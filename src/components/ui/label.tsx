import type { ComponentProps } from 'react'

type LabelProps = ComponentProps<'label'>

export function Label({ className = '', ...props }: LabelProps) {
  const base =
    'mb-1 block text-sm font-semibold uppercase text-foreground'

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor forwarded via props
    <label
      className={`${base}${className ? ` ${className}` : ''}`}
      {...props}
    />
  )
}
