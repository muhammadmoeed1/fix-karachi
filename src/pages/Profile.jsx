import { FileText, CheckCircle2, ShieldCheck, ShieldX, Info } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { trustTier } from '../services/credibility.js'
import RadialGauge from '../components/RadialGauge.jsx'

export default function Profile() {
  const { user, reports, users } = useApp()
  const me = users.find((u) => u.id === user.id) || { trustScore: 50 }
  const mine = reports.filter((r) => r.userId === user.id)
  const resolved = mine.filter((r) => r.status === 'resolved').length
  const verified = mine.filter((r) => r.adminVerdict === 'verified').length
  const rejected = mine.filter((r) => r.adminVerdict === 'rejected').length
  const tier = trustTier(me.trustScore)

  return (
    <div className="fade-up mx-auto max-w-2xl space-y-6">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-6">
          <RadialGauge value={me.trustScore} color={tier.color} size={92} stroke={9} />
          <div>
            <p className="text-sm muted">Trust score</p>
            <h1 className="text-2xl font-extrabold">{user.name}</h1>
            <span className="soft-pill mt-1.5" style={{ background: tier.color + '18', color: tier.color }}>{tier.label}</span>
          </div>
        </div>
        <p className="mt-5 flex items-start gap-2 text-sm muted">
          <Info size={15} className="mt-0.5 shrink-0" />
          Trust score rises when admins officially verify your reports (+10) and falls when a report is rejected as invalid or spam (−15). It factors into every report's credibility score.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat Icon={FileText} value={mine.length} label="Reports filed" />
        <Stat Icon={CheckCircle2} value={resolved} label="Resolved" />
        <Stat Icon={ShieldCheck} value={verified} label="Officially verified" />
        <Stat Icon={ShieldX} value={rejected} label="Rejected" />
      </div>
    </div>
  )
}

function Stat({ Icon, value, label }) {
  return (
    <div className="card p-5 text-center">
      <Icon size={18} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
      <div className="font-display text-2xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide muted">{label}</div>
    </div>
  )
}
