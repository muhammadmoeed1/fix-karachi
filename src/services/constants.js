// Shared config: categories, statuses, helpers. One source of truth.
import {
  Construction, Trash2, Lightbulb, Droplets, Clock, Loader, CheckCircle2,
  Droplet, ShieldAlert, TrafficCone, Siren,
  ArrowDownCircle, MinusCircle, ArrowUpCircle, AlertTriangle,
} from 'lucide-react'

export const CATEGORIES = {
  pothole:      { label: 'Pothole / Road Damage', Icon: Construction, color: '#d97706' },
  garbage:      { label: 'Garbage Overflow',       Icon: Trash2,       color: '#16a34a' },
  streetlight:  { label: 'Broken Streetlight',     Icon: Lightbulb,    color: '#ca8a04' },
  sewerage:     { label: 'Sewerage Leakage',       Icon: Droplets,     color: '#0891b2' },
  water_supply: { label: 'Water Supply',           Icon: Droplet,      color: '#2563eb' },
  safety:       { label: 'Public Safety',          Icon: ShieldAlert,  color: '#7c3aed' },
  traffic:      { label: 'Traffic / Signals',      Icon: TrafficCone,  color: '#4f46e5' },
  emergency:    { label: 'Emergency',              Icon: Siren,        color: '#dc2626' },
}

// How urgent a report is — a separate signal from credibility (which asks
// "is this real?"). Severity asks "how fast does this need eyes?" so the
// two never get conflated into one implicit priority number.
export const SEVERITY = {
  low:      { label: 'Low',      Icon: ArrowDownCircle, color: '#5b6a66', weight: 1, hint: 'Minor issue — no immediate risk.' },
  medium:   { label: 'Medium',   Icon: MinusCircle,     color: '#ca8a04', weight: 2, hint: 'Should be addressed within a reasonable time.' },
  high:     { label: 'High',     Icon: ArrowUpCircle,   color: '#e8912b', weight: 3, hint: 'Serious issue — needs prompt attention.' },
  critical: { label: 'Critical', Icon: AlertTriangle,   color: '#d9455f', weight: 4, hint: 'Immediate safety risk — flagged for urgent review.' },
}
export const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical']
export const severityWeight = (key) => SEVERITY[key]?.weight ?? SEVERITY.medium.weight

export const STATUSES = {
  pending: {
    label: 'Pending', Icon: Clock,
    badge: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  },
  in_progress: {
    label: 'In Progress', Icon: Loader,
    badge: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  },
  resolved: {
    label: 'Resolved', Icon: CheckCircle2,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  },
}

export const STATUS_ORDER = ['pending', 'in_progress', 'resolved']

export const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
