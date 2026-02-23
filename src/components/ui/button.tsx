import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  fullWidth,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'rounded-md text-sm hover:opacity-90 disabled:opacity-50'
  const variants = {
    primary: 'bg-primary text-primary-foreground font-medium px-4 py-2',
    secondary: 'bg-secondary text-secondary-foreground px-3 py-1.5',
  }

  return (
    <button
      className={
        `${base} ${variants[variant]}` +
        `${fullWidth ? ' w-full' : ''}` +
        `${className ? ` ${className}` : ''}`
      }
      {...props}
    />
  )
}
