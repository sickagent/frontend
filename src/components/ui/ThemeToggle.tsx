import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeChoice } from '@/hooks/useTheme';

const options: { value: ThemeChoice; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-surface-2 border border-border">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`p-1.5 rounded-md transition-all cursor-pointer ${
            theme === value
              ? 'bg-surface-0 text-fg shadow-sm'
              : 'text-fg-muted hover:text-fg-secondary'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
