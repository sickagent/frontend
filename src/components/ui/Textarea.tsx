import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-fg-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          w-full rounded-xl bg-surface-2 border border-border
          px-4 py-3 text-sm text-fg placeholder:text-fg-dimmed
          focus:outline-none focus:border-sick-500/50 focus:ring-1 focus:ring-sick-500/20
          transition-all duration-200 resize-y min-h-[80px]
          ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  ),
);

Textarea.displayName = 'Textarea';
