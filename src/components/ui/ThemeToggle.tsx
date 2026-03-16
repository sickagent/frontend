import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeChoice } from '@/hooks/useTheme';

const options: { value: ThemeChoice; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle({ expand }: { expand?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-3 border border-border ${expand ? 'w-full' : ''}`}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center justify-center gap-1.5 rounded-md transition-all cursor-pointer ${
            expand ? 'flex-1 py-1.5' : 'p-1.5'
          } ${
            theme === value
              ? 'bg-surface-0 text-fg shadow-sm'
              : 'text-fg-muted hover:text-fg-secondary'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {expand && <span className="text-xs font-medium">{label}</span>}
        </button>
      ))}
    </div>
  );
}
