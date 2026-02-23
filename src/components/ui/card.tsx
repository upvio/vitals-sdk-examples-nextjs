import type {
  ComponentPropsWithoutRef,
  ElementType,
} from 'react'

type CardProps<T extends ElementType = 'div'> = {
  as?: T
  className?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>

export function Card<T extends ElementType = 'div'>({
  as,
  className = '',
  ...rest
}: CardProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  const base =
    'rounded-lg border border-border bg-card p-6 shadow-sm'

  return (
    <Tag
      className={`${base}${className ? ` ${className}` : ''}`}
      {...rest}
    />
  )
}
