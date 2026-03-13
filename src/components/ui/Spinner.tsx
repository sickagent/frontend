export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-surface-3" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-sick-500 animate-spin" />
      </div>
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-sm text-fg-muted">Loading...</p>
      </div>
    </div>
  );
}
