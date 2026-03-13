interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group">
      <span className="text-sm text-fg-secondary group-hover:text-fg transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative w-10 rounded-full transition-colors cursor-pointer ${value ? 'bg-sick-500' : 'bg-surface-4'}`}
        style={{ height: 22 }}
      >
        <span
          className={`absolute top-0.5 left-0.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-[18px]' : ''}`}
          style={{ width: 18, height: 18 }}
        />
      </button>
    </label>
  );
}
