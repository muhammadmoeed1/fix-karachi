import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, ShieldX, ThumbsUp, Flag, ListChecks, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { CATEGORIES, STATUSES, STATUS_ORDER, timeAgo, severityWeight } from '../../services/constants.js'
import { credibilityInfo } from '../../services/credibility.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import { CredibilityBadge } from '../../components/Credibility.jsx'
import SeverityBadge from '../../components/SeverityBadge.jsx'
import ConfirmModal from '../../components/ConfirmModal.jsx'

const VERDICT_FILTERS = { all: 'All', ...Object.fromEntries(Object.entries(STATUSES).map(([k, v]) => [k, v.label])), verified: 'Officially verified', rejected: 'Rejected' }

// Backlog size per category, in real report counts — not fabricated team
// headcounts or capacity we have no data model for. Honest is more useful
// than an org chart the data can't actually back up.
const LOAD_LEVELS = [
  { max: 0, label: 'No backlog', color: '#5b6a66' },
  { max: 2, label: 'Light load', color: '#0d7a6f' },
  { max: 5, label: 'Moderate load', color: '#e8912b' },
  { max: Infinity, label: 'Heavy load', color: '#d9455f' },
]
const loadLevel = (open) => LOAD_LEVELS.find((l) => open <= l.max)

// Admin workflow — a Needs Review queue (surfaced by flags / low credibility)
// for the "is this real?" decision, and a full table for the day-to-day
// status pipeline. Two separate jobs: validity verdict vs. progress stage.
export default function AdminPanel() {
  const { reports, users, updateStatus, setAdminVerdict } = useApp()
  const [tab, setTab] = useState('review')
  const [filter, setFilter] = useState('all')
  // A rejection tanks the reporter's trust score and hides their report
  // from the public feed with no "undo" in this UI — worth a confirm step,
  // unlike Verify, which is the low-risk path an admin wants to move fast on.
  const [rejectTarget, setRejectTarget] = useState(null)

  const needsReview = useMemo(() => {
    return reports
      .filter((r) => !r.adminVerdict)
      // Flagged / low-credibility reports need a validity check. Critical-severity
      // reports need eyes fast regardless of score — urgency shouldn't wait on trust.
      .map((r) => ({ report: r, info: credibilityInfo(r, reports, users) }))
      .filter(({ report, info }) => report.flags.length > 0 || info.score < 35 || report.severity === 'critical')
      .sort((a, b) =>
        severityWeight(b.report.severity) - severityWeight(a.report.severity) ||
        b.report.flags.length - a.report.flags.length ||
        a.info.score - b.info.score)
  }, [reports, users])

  const list = [...reports]
    .filter((r) => {
      if (filter === 'all') return true
      if (filter === 'verified') return r.adminVerdict === 'verified'
      if (filter === 'rejected') return r.adminVerdict === 'rejected'
      return r.status === filter
    })
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity) || b.votes.length - a.votes.length)

  const workload = useMemo(() => {
    const open = reports.filter((r) => r.adminVerdict !== 'rejected' && r.status !== 'resolved')
    return Object.entries(CATEGORIES)
      .map(([k, c]) => {
        const inCat = open.filter((r) => r.category === k)
        const oldest = inCat.reduce((o, r) => (!o || r.createdAt < o.createdAt ? r : o), null)
        return { key: k, ...c, open: inCat.length, critical: inCat.filter((r) => r.severity === 'critical').length, oldest }
      })
      .filter((c) => c.open > 0)
      .sort((a, b) => b.open - a.open)
  }, [reports])

  return (
    <div className="fade-up">
      <div className="mb-1.5 flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: 'var(--primary)' }}><ShieldCheck size={18} /></span>
        <h1 className="text-2xl font-extrabold">Admin panel</h1>
      </div>
      <p className="mb-5 text-sm muted">Decide whether reports are valid, then manage the resolution pipeline.</p>

      <div className="mb-5 inline-flex gap-1 rounded-xl border p-1" role="tablist" style={{ background: 'var(--surface-2)' }}>
        <button role="tab" aria-selected={tab === 'review'} onClick={() => setTab('review')} className={`tab-btn ${tab === 'review' ? 'tab-btn-active' : ''}`}>
          Needs Review {needsReview.length > 0 && <span className="danger-pill ml-1 !px-1.5 !py-0">{needsReview.length}</span>}
        </button>
        <button role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')} className={`tab-btn ${tab === 'all' ? 'tab-btn-active' : ''}`}>All Reports</button>
        <button role="tab" aria-selected={tab === 'workload'} onClick={() => setTab('workload')} className={`tab-btn ${tab === 'workload' ? 'tab-btn-active' : ''}`}>Workload</button>
      </div>

      {tab === 'review' && (
        needsReview.length === 0 ? (
          <div className="card p-10 text-center">
            <ListChecks size={28} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
            <p className="font-semibold">Nothing needs review right now.</p>
            <p className="text-sm muted">Flagged reports and low-credibility submissions will show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {needsReview.map(({ report: r, info }) => (
              <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/report/${r.id}`} className="font-bold hover:opacity-80">{r.title}</Link>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs muted">
                    <span>{CATEGORIES[r.category]?.label}</span>
                    <span>· {timeAgo(r.createdAt)}</span>
                    <span className="inline-flex items-center gap-1"><ThumbsUp size={12} /> {r.votes.length}</span>
                    {r.flags.length > 0 && <span className="danger-pill !px-2 !py-0.5"><Flag size={11} /> {r.flags.length} flag{r.flags.length !== 1 && 's'}</span>}
                    <SeverityBadge severity={r.severity} />
                    <CredibilityBadge report={r} />
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => setAdminVerdict(r.id, 'verified')} className="btn btn-primary !py-2 !text-xs"><ShieldCheck size={14} /> Verify</button>
                  <button onClick={() => setRejectTarget(r)} className="btn btn-danger !py-2 !text-xs"><ShieldX size={14} /> Reject</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'all' && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {Object.entries(VERDICT_FILTERS).map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={`chip ${filter === k ? 'chip-active' : ''}`}>{label}</button>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide muted" style={{ background: 'var(--surface-2)' }}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Issue</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Severity</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Credibility</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => {
                    const Icon = CATEGORIES[r.category]?.Icon
                    return (
                      <tr key={r.id} className="border-t hover:bg-[var(--surface-2)]">
                        <td className="px-4 py-3">
                          <Link to={`/report/${r.id}`} className="font-bold hover:opacity-80">{r.title}</Link>
                          <div className="text-xs muted">{r.address || 'Pinned'} · {timeAgo(r.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5">{Icon && <Icon size={15} style={{ color: CATEGORIES[r.category].color }} />} {CATEGORIES[r.category]?.label}</span>
                        </td>
                        <td className="hidden px-4 py-3 sm:table-cell"><SeverityBadge severity={r.severity} /></td>
                        <td className="hidden px-4 py-3 sm:table-cell"><CredibilityBadge report={r} /></td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3">
                          <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="input !py-1.5 !px-2.5 !w-auto text-sm font-semibold">
                            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUSES[s].label}</option>)}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                  {list.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center muted">No reports.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'workload' && (
        workload.length === 0 ? (
          <div className="card p-10 text-center">
            <ListChecks size={28} className="mx-auto mb-2" style={{ color: 'var(--primary)' }} />
            <p className="font-semibold">No open backlog right now.</p>
            <p className="text-sm muted">Every category is caught up — nothing pending or in progress.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workload.map((c) => {
              const Icon = c.Icon
              const load = loadLevel(c.open)
              return (
                <div key={c.key} className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-bold">{Icon && <Icon size={16} style={{ color: c.color }} />} {c.label}</span>
                    <span className="soft-pill !px-2 !py-0.5" style={{ background: load.color + '18', color: load.color }}>{load.label}</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-extrabold">{c.open}</span>
                    <span className="text-xs muted">open report{c.open !== 1 && 's'}</span>
                  </div>
                  {c.critical > 0 && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#d9455f' }}>
                      <AlertTriangle size={12} /> {c.critical} critical
                    </div>
                  )}
                  {c.oldest && (
                    <Link to={`/report/${c.oldest.id}`} className="mt-3 block text-xs muted hover:opacity-80">
                      Oldest waiting <span className="font-semibold" style={{ color: 'var(--text)' }}>{timeAgo(c.oldest.createdAt)}</span> — {c.oldest.title}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      <ConfirmModal
        open={!!rejectTarget}
        title="Reject this report?"
        message={rejectTarget && `"${rejectTarget.title}" will be marked as not valid and hidden from the public feed. This also lowers ${rejectTarget.userName}'s trust score, and can't be undone from here.`}
        confirmLabel="Reject report"
        danger
        onConfirm={() => { setAdminVerdict(rejectTarget.id, 'rejected'); setRejectTarget(null) }}
        onCancel={() => setRejectTarget(null)}
      />
    </div>
  )
}
