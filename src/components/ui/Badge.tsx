type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-fg-secondary border-border',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-sick-500/10 text-sick-400 border-sick-500/20',
  purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = 'default', children, className = '', dot }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-xs font-medium rounded-full border
        ${variants[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success' ? 'bg-emerald-400' :
          variant === 'warning' ? 'bg-amber-400' :
          variant === 'danger' ? 'bg-red-400' :
          variant === 'info' ? 'bg-sick-400' :
          variant === 'purple' ? 'bg-violet-400' :
          'bg-fg-muted'
        }`} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    online: { variant: 'success', label: 'Online' },
    offline: { variant: 'default', label: 'Offline' },
    busy: { variant: 'warning', label: 'Busy' },
    open: { variant: 'info', label: 'Open' },
    accepted: { variant: 'purple', label: 'Accepted' },
    in_progress: { variant: 'warning', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    failed: { variant: 'danger', label: 'Failed' },
    cancelled: { variant: 'default', label: 'Cancelled' },
    pending: { variant: 'warning', label: 'Pending' },
    closed: { variant: 'default', label: 'Closed' },
    archived: { variant: 'default', label: 'Archived' },
  };
  const { variant, label } = map[status] ?? { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}
