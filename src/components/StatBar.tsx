"use client";

type StatBarProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  invertColors?: boolean;
};

/**
 * A horizontal bar that fills with a red→yellow→green gradient
 * proportionally to the value within [min, max].
 *
 * When `invertColors` is true the color mapping is inverted
 * (green at low values, red at high) — useful for wear percentages.
 */
export function StatBar({ label, value, min, max, unit, invertColors = false }: StatBarProps) {
  const range = max - min;
  const ratio = range > 0 ? Math.max(0, Math.min(1, (value - min) / range)) : 0;
  const percent = Math.round(ratio * 100);

  // Hue: 0 = red, 60 = yellow, 120 = green
  const hue = invertColors ? 120 - ratio * 120 : ratio * 120;

  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <span className="w-12 shrink-0 text-right text-sm tabular-nums font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
        {unit ? <span className="ml-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">{unit}</span> : null}
      </span>
      <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: `hsl(${hue}, 72%, 48%)`,
          }}
          role="meter"
          aria-label={`${label}: ${value}${unit ?? ""}`}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
