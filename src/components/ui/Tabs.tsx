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
    <div className="flex gap-1.5 border-b border-border/40 pb-px">
      {items.map(({ id, label, icon, count }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px cursor-pointer ${
            value === id
              ? 'text-sick-400 border-sick-500'
              : 'text-fg-muted border-transparent hover:text-fg-secondary hover:border-surface-4'
          }`}
        >
          {icon}
          {label}
          {count != null && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              value === id ? 'bg-sick-500/10 text-sick-400' : 'bg-surface-3 text-fg-muted'
            }`}>
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
