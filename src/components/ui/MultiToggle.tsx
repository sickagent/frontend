interface MultiToggleProps {
  options: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
  label: string;
}

export function MultiToggle({ options, selected, onChange, label }: MultiToggleProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-fg-muted uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                active
                  ? 'bg-sick-500/10 text-sick-400 border-sick-500/30'
                  : 'bg-surface-2 text-fg-muted border-border hover:text-fg-secondary hover:border-surface-4'
              }`}
            >
              {opt.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
