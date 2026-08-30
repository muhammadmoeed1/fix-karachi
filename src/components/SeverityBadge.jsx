import { SEVERITY } from '../services/constants.js'

// How urgent a report is — shown alongside (never merged into) the
// CredibilityBadge, so "is this real" and "how fast does it need eyes"
// stay two distinct, legible signals instead of one opaque priority number.
export default function SeverityBadge({ severity, size = 'sm' }) {
  const s = SEVERITY[severity] || SEVERITY.medium
  const Icon = s.Icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
      style={{ background: s.color + '18', color: s.color }}
      title={s.hint}
    >
      <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2.5} /> {s.label}
    </span>
  )
}
