import { FileBarChart, CheckCircle2, TrendingUp, ThumbsUp, Trophy, Clock, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES, STATUSES, SEVERITY, SEVERITY_ORDER } from '../services/constants.js'
import { trustTier } from '../services/credibility.js'
import { getLeaderboard } from '../services/store.js'

// How long a report took from first submitted to its current state, in hours.
const resolutionHrs = (r) => (r.updatedAt - (r.statusHistory[0]?.at ?? r.createdAt)) / 3600000
const avgHrs = (list) => (list.length ? Math.round(list.reduce((sum, r) => sum + resolutionHrs(r), 0) / list.length) : null)

// Public transparency dashboard — open stats, simple charts, and the
// civic-engagement leaderboard. Rejected (spam/invalid) reports are
// excluded so the open data stays trustworthy.
export default function Dashboard() {
  const { publicReports } = useApp()
  const total = publicReports.length || 1
  const resolved = publicReports.filter((r) => r.status === 'resolved')
  const verifications = publicReports.reduce((a, r) => a + r.votes.length, 0)
  const leaderboard = getLeaderboard(5)

  const avgResolutionHrs = avgHrs(resolved)

  const byStatus = Object.keys(STATUSES).map((s) => ({ key: s, label: STATUSES[s].label, count: publicReports.filter((r) => r.status === s).length }))
  const byCategory = Object.entries(CATEGORIES).map(([k, c]) => ({ key: k, ...c, count: publicReports.filter((r) => r.category === k).length }))

  // Per-category and per-severity track record — the two-way half of the
  // credibility story: citizens can audit the city's own performance, not
  // just have their reports audited by it.
  const byCategoryPerf = Object.entries(CATEGORIES)
    .map(([k, c]) => {
      const inCat = publicReports.filter((r) => r.category === k)
      const resolvedInCat = inCat.filter((r) => r.status === 'resolved')
      return { key: k, ...c, total: inCat.length, resolved: resolvedInCat.length,
        rate: inCat.length ? Math.round((resolvedInCat.length / inCat.length) * 100) : null, avgHrs: avgHrs(resolvedInCat) }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const bySeverityPerf = SEVERITY_ORDER.map((k) => {
    const inSev = publicReports.filter((r) => r.severity === k)
    const resolvedInSev = inSev.filter((r) => r.status === 'resolved')
    return { key: k, ...SEVERITY[k], total: inSev.length, resolved: resolvedInSev.length, avgHrs: avgHrs(resolvedInSev) }
  })

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-extrabold">Transparency dashboard</h1>
      <p className="mb-6 text-sm muted">Open data on civic issues — how many are reported, verified, and resolved. Reports rejected as invalid are excluded.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Big Icon={FileBarChart} value={publicReports.length} label="Total reports" />
        <Big Icon={CheckCircle2} value={resolved.length} label="Resolved" />
        <Big Icon={TrendingUp} value={`${Math.round((resolved.length / total) * 100)}%`} label="Resolution rate" />
        <Big Icon={ThumbsUp} value={verifications} label="Citizen verifications" />
        <Big Icon={Clock} value={avgResolutionHrs != null ? `${avgResolutionHrs}h` : '—'} label="Avg. time to resolve" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="By status">
          {byStatus.map((s) => <Bar key={s.key} label={s.label} count={s.count} total={total} color="var(--primary)" />)}
        </Panel>
        <Panel title="By category">
          {byCategory.map((c) => <Bar key={c.key} label={c.label} count={c.count} total={total} color={c.color} />)}
        </Panel>
      </div>

      <div className="mt-6 card p-6">
        <div className="mb-1 flex items-center gap-2">
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          <h2 className="text-base font-bold">Response by urgency</h2>
        </div>
        <p className="mb-4 text-sm muted">Whether reports marked more urgent actually get resolved faster — the promise the severity signal is held to.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {bySeverityPerf.map((s) => {
            const Icon = s.Icon
            return (
              <div key={s.key} className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)' }}>
                <span className="soft-pill !px-2 !py-0.5" style={{ background: s.color + '18', color: s.color }}>
                  <Icon size={12} strokeWidth={2.5} /> {s.label}
                </span>
                <div className="mt-2 font-display text-2xl font-extrabold">{s.avgHrs != null ? `${s.avgHrs}h` : '—'}</div>
                <div className="text-xs muted">{s.resolved}/{s.total} resolved</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="text-base font-bold">Performance by category</h2>
          <p className="mt-1 text-sm muted">Every category's track record, in the open — not just one aggregate number.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide muted" style={{ background: 'var(--surface-2)' }}>
              <tr>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Reports</th>
                <th className="px-4 py-3 font-semibold">Resolved</th>
                <th className="px-4 py-3 font-semibold">Resolution rate</th>
                <th className="px-4 py-3 font-semibold">Avg. time to resolve</th>
              </tr>
            </thead>
            <tbody>
              {byCategoryPerf.map((c) => {
                const Icon = c.Icon
                return (
                  <tr key={c.key} className="border-t">
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold">{Icon && <Icon size={15} style={{ color: c.color }} />} {c.label}</span>
                    </td>
                    <td className="px-4 py-3">{c.total}</td>
                    <td className="px-4 py-3">{c.resolved}</td>
                    <td className="px-4 py-3">{c.rate != null ? `${c.rate}%` : '—'}</td>
                    <td className="px-4 py-3 font-semibold">{c.avgHrs != null ? `${c.avgHrs}h` : '—'}</td>
                  </tr>
                )
              })}
              {byCategoryPerf.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center muted">No public reports yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold"><Trophy size={18} style={{ color: 'var(--accent)' }} /> Top contributors</h2>
        {leaderboard.length === 0 ? (
          <p className="text-sm muted">No citizen activity yet.</p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((u, i) => {
              const tier = trustTier(u.trustScore)
              return (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-sm font-bold muted">{i + 1}</span>
                  <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: tier.color }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold">{u.name}</span>
                      <span className="soft-pill !px-2 !py-0.5" style={{ background: tier.color + '18', color: tier.color }}>{tier.label}</span>
                    </div>
                    <p className="text-xs muted">{u.reportsCount} reports · {u.resolvedCount} resolved</p>
                  </div>
                  <span className="font-display text-lg font-extrabold" style={{ color: 'var(--primary)' }}>{u.trustScore}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Big({ Icon, value, label }) {
  return (
    <div className="card p-5">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'var(--primary-soft)', color: 'var(--primary-soft-text)' }}><Icon size={18} /></div>
      <div className="font-display text-3xl font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide muted">{label}</div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      <div className="space-y-3.5">{children}</div>
    </div>
  )
}

function Bar({ label, count, total, color }) {
  const pct = Math.round((count / total) * 100)
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="muted">{count} · {pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'var(--surface-2)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
