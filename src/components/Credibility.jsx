import { useState } from 'react'
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX, ChevronDown } from 'lucide-react'
import { credibilityInfo } from '../services/credibility.js'
import { useApp } from '../context/AppContext.jsx'
import RadialGauge from './RadialGauge.jsx'

const ICONS = { official: ShieldCheck, high: ShieldCheck, trusted: ShieldCheck, review: ShieldAlert, rejected: ShieldX, pending: ShieldQuestion, new: ShieldQuestion }

// Compact pill for cards/lists — "how do we know this complaint is real"
// distilled into one glanceable badge.
export function CredibilityBadge({ report, size = 'sm' }) {
  const { reports, users } = useApp()
  const info = credibilityInfo(report, reports, users)
  const Icon = ICONS[info.key] || ShieldQuestion
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'}`}
      style={{ background: info.color + '18', color: info.color }}
      title={`Credibility score: ${info.score}/100`}
    >
      <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2.5} /> {info.label}
    </span>
  )
}

// Full breakdown panel for the report detail page — the transparency
// the platform promises: never a black-box verdict.
export function CredibilityPanel({ report }) {
  const { reports, users } = useApp()
  const [open, setOpen] = useState(false)
  const info = credibilityInfo(report, reports, users)
  const Icon = ICONS[info.key] || ShieldQuestion

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <RadialGauge value={info.score} color={info.color} size={64} stroke={7} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-bold" style={{ color: info.color }}>
            <Icon size={16} strokeWidth={2.5} /> {info.label}
          </div>
          <p className="mt-0.5 text-sm muted">
            {info.locked === 'verified' && 'A city admin has confirmed this report is genuine.'}
            {info.locked === 'rejected' && 'A city admin reviewed this and found it invalid or spam.'}
            {!info.locked && 'Computed from community verifications, photo evidence, nearby corroborating reports, and the reporter\'s track record.'}
          </p>
        </div>
      </div>

      {info.breakdown && (
        <>
          <button onClick={() => setOpen((o) => !o)} className="btn btn-ghost mt-3 !px-2 !py-1.5 text-xs">
            <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} /> {open ? 'Hide' : 'Show'} how this score was calculated
          </button>
          {open && (
            <ul className="pop-in mt-2 space-y-1.5 border-t pt-3 text-sm">
              {info.breakdown.map((b) => (
                <li key={b.label} className="flex items-center justify-between">
                  <span className="muted">{b.label}</span>
                  <span className={`font-mono font-bold ${b.value < 0 ? 'text-rose-500' : b.value > 0 ? '' : 'muted'}`} style={b.value > 0 ? { color: 'var(--primary)' } : undefined}>
                    {b.value > 0 ? '+' : ''}{b.value}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
