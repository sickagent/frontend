import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-fg-muted">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full h-11 rounded-xl bg-surface-2 border border-border
          px-4 text-sm text-fg
          focus:outline-none focus:border-sick-500/50 focus:ring-1 focus:ring-sick-500/20
          transition-all duration-200 appearance-none
          bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
          bg-no-repeat bg-[right_12px_center]
          ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label: l }) => (
          <option key={value} value={value}>{l}</option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  ),
);

Select.displayName = 'Select';
