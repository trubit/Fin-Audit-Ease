import React, { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Spinner } from '@/components/feedback/Spinner/Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'text' | 'ghost'
  readonly size?: 'xs' | 'sm' | 'md' | 'lg'
  readonly isLoading?: boolean
  readonly isIconOnly?: boolean
  readonly leftIcon?: ReactNode
  readonly rightIcon?: ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isIconOnly = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const sizeClass =
    size === 'xs'
      ? 'btn-xs'
      : size === 'sm'
      ? 'btn-sm'
      : size === 'lg'
      ? 'btn-lg'
      : 'btn-md'

  const iconOnlyClass = isIconOnly ? 'btn-icon-only' : ''

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`btn btn-${variant} ${sizeClass} ${iconOnlyClass} ${className}`.trim()}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Spinner
            size="sm"
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
          />
          {!isIconOnly && <span>{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="btn-icon" aria-hidden="true">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="btn-icon" aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
