import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border flex items-center justify-center text-fg-muted mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-fg-secondary mb-1">{title}</h3>
      <p className="text-sm text-fg-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
