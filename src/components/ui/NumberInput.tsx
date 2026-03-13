interface NumberInputProps {
  value: number | undefined;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function NumberInput({ value, onChange, label, min, max, step, suffix }: NumberInputProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-fg-muted">{label}</label>
        {suffix && <span className="text-[10px] text-fg-dimmed">{suffix}</span>}
      </div>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-9 rounded-lg bg-surface-2 border border-border px-3 text-sm text-fg focus:outline-none focus:border-sick-500/50 transition-colors"
      />
    </div>
  );
}
