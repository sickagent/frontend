import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Size = 'sm' | 'md';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: Size;
  variant?: 'ghost' | 'muted';
}

const sizeStyles: Record<Size, string> = {
  sm: 'p-1 rounded',
  md: 'p-1.5 rounded-lg',
};

const variantStyles = {
  ghost: 'hover:bg-surface-3 text-fg-muted hover:text-fg-secondary transition-colors',
  muted: 'hover:bg-surface-4 text-fg-muted hover:text-fg-secondary transition-colors',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', variant = 'ghost', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    />
  ),
);

IconButton.displayName = 'IconButton';
