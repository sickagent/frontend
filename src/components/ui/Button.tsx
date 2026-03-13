import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-sick-500 hover:bg-sick-400 text-white shadow-lg shadow-sick-500/20 hover:shadow-sick-400/30 active:bg-sick-600',
  secondary:
    'bg-surface-3 hover:bg-surface-4 text-fg-secondary border border-border hover:border-surface-4',
  ghost:
    'bg-transparent hover:bg-surface-3 text-fg-muted hover:text-fg-secondary',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:pointer-events-none
        cursor-pointer select-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
