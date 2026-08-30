import { Link } from 'react-router-dom'
import { Plus, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES } from '../services/constants.js'
import ReportCard from '../components/ReportCard.jsx'

export default function MyReports() {
  const { reports, user, offlineQueue } = useApp()
  const mine = reports.filter((r) => r.userId === user.id)

  return (
    <div className="fade-up">
      <h1 className="text-2xl font-extrabold">My reports</h1>
      <p className="mb-6 text-sm muted">{mine.length} report{mine.length !== 1 && 's'}</p>

      {offlineQueue.length > 0 && (
        <div className="mb-6 space-y-2">
          {offlineQueue.map((q) => {
            const cat = CATEGORIES[q.data.category] || {}
            return (
              <div key={q.id} className="card flex items-center gap-3 p-4" style={{ background: 'var(--accent-soft)' }}>
                <WifiOff size={18} style={{ color: 'var(--accent-soft-text)' }} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold" style={{ color: 'var(--accent-soft-text)' }}>{q.data.title}</p>
                  <p className="text-xs" style={{ color: 'var(--accent-soft-text)' }}>{cat.label} · Queued offline — will submit automatically once you're back online</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {mine.length === 0 && offlineQueue.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="muted">You haven't reported any issues yet.</p>
          <Link to="/report" className="btn btn-primary mt-4"><Plus size={16} /> Report your first issue</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map((r) => <ReportCard key={r.id} report={r} />)}
        </div>
      )}
    </div>
  )
}
