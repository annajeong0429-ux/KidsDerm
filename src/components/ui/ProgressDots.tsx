export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current ? "w-5 bg-brand-600" : "w-1.5 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

export function StepProgress({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1 px-4 pt-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full ${i <= current ? "bg-brand-600" : "bg-border"}`}
        />
      ))}
    </div>
  );
}
