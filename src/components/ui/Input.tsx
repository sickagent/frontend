import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-fg-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full h-11 rounded-xl bg-surface-2 border border-border
            px-4 text-sm text-fg placeholder:text-fg-dimmed
            focus:outline-none focus:border-sick-500/50 focus:ring-1 focus:ring-sick-500/20
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
