import { STATUSES } from '../services/constants.js'

// Small status pill with an icon. Works in light and dark mode.
export default function StatusBadge({ status }) {
  const s = STATUSES[status] || STATUSES.pending
  const Icon = s.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.badge}`}>
      <Icon size={13} strokeWidth={2.5} />
      {s.label}
    </span>
  )
}
