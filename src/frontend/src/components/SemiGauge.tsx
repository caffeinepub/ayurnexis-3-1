interface SemiGaugeProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
}

function getArcColor(pct: number): string {
  if (pct >= 0.7) return "oklch(0.64 0.168 145)";
  if (pct >= 0.4) return "oklch(0.78 0.130 87)";
  return "oklch(0.54 0.174 24)";
}

export function SemiGauge({
  value,
  max = 100,
  label,
  unit = "",
  size = 140,
}: SemiGaugeProps) {
  const pct = Math.min(Math.max(value / max, 0), 1);
  const r = (size / 2) * 0.75;
  const cx = size / 2;
  const cy = size / 2;
  const strokeW = size * 0.08;

  const startAngle = 200;
  const endAngle = -20;
  const sweepDeg = 220;
  const valueDeg = endAngle + (1 - pct) * sweepDeg;

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(startDeg: number, stopDeg: number) {
    const s = polarToXY(startDeg, r);
    const e = polarToXY(stopDeg, r);
    const diff = (startDeg - stopDeg + 360) % 360;
    const large = diff > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  }

  const color = getArcColor(pct);
  const displayVal = value.toFixed(value >= 10 ? 0 : 1);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        role="img"
        aria-label={`${label}: ${displayVal}${unit}`}
        width={size}
        height={size * 0.7}
        viewBox={`0 0 ${size} ${size * 0.7}`}
      >
        <title>{`${label}: ${displayVal}${unit}`}</title>
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="oklch(0.38 0.076 175 / 0.4)"
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        <path
          d={describeArc(startAngle, valueDeg)}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        <text
          x={cx}
          y={cy * 0.9}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.18}
          fontWeight="700"
          fill="oklch(0.94 0.018 162)"
          fontFamily="system-ui, sans-serif"
        >
          {displayVal}
          {unit}
        </text>
      </svg>
      <span className="text-xs text-muted-foreground font-medium text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
