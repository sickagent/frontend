import type { ReactNode } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
}

export function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-flex min-w-full gap-2 rounded-2xl border border-border/50 bg-surface-1/80 p-1.5 sm:min-w-0">
        {items.map(({ id, label, icon, count }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-all cursor-pointer ${
              value === id
                ? 'bg-surface-0 text-sick-400 shadow-sm ring-1 ring-sick-500/20'
                : 'text-fg-muted hover:bg-surface-2 hover:text-fg-secondary'
            }`}
          >
            {icon}
            {label}
            {count != null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  value === id ? 'bg-sick-500/10 text-sick-400' : 'bg-surface-3 text-fg-muted'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
