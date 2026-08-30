// Small circular progress ring used to visualise a 0-100 score
// (report credibility, reporter trust) without a charting library.
export default function RadialGauge({ value, color, size = 56, stroke = 6 }) {
  const v = Math.max(0, Math.min(100, value))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (v / 100) * c

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".32em" fontSize={size * 0.3} fontWeight="800" fill="var(--text)">
        {Math.round(v)}
      </text>
    </svg>
  )
}
