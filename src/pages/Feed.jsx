import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ReportCard from '../components/ReportCard.jsx'
import { CATEGORIES, STATUSES } from '../services/constants.js'
import { credibilityInfo } from '../services/credibility.js'

const SORTS = { newest: 'Newest', credible: 'Most credible', verified: 'Most verified' }

// All complaints + category/status filters + search + sort.
export default function Feed() {
  const { publicReports, reports, users } = useApp()
  const [cat, setCat] = useState('all')
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    const list = publicReports.filter((r) => {
      if (cat !== 'all' && r.category !== cat) return false
      if (status !== 'all' && r.status !== status) return false
      if (q && !`${r.title} ${r.description} ${r.address}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    if (sort === 'verified') return [...list].sort((a, b) => b.votes.length - a.votes.length)
    if (sort === 'credible') return [...list].sort((a, b) => credibilityInfo(b, reports, users).score - credibilityInfo(a, reports, users).score)
    return list
  }, [publicReports, reports, users, cat, status, q, sort])

  return (
    <div className="fade-up">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Community feed</h1>
          <p className="text-sm muted">{filtered.length} report{filtered.length !== 1 && 's'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input !w-auto !py-2.5 text-sm font-semibold">
            {Object.entries(SORTS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reports…" className="input !py-2.5 pl-9 sm:w-72" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Chip active={cat === 'all'} onClick={() => setCat('all')}>All categories</Chip>
        {Object.entries(CATEGORIES).map(([k, c]) => {
          const Icon = c.Icon
          return <Chip key={k} active={cat === k} onClick={() => setCat(k)}><Icon size={14} /> {c.label}</Chip>
        })}
        <span className="mx-1 h-5 w-px" style={{ background: 'var(--border)' }} />
        {['all', ...Object.keys(STATUSES)].map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === 'all' ? 'Any status' : STATUSES[s].label}</Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center muted">No reports match your filters.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  )
}

function Chip({ active, children, ...props }) {
  return <button {...props} aria-pressed={active} className={`chip ${active ? 'chip-active' : ''}`}>{children}</button>
}
