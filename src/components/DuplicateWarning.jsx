import { Link } from 'react-router-dom'
import { AlertTriangle, ThumbsUp } from 'lucide-react'
import { CredibilityBadge } from './Credibility.jsx'

// Shown while filling out the report form when nearby reports of the
// same category already exist (Haversine distance, see services/credibility.js).
// Steers citizens toward verifying an existing report instead of forking
// the same issue into duplicate entries that dilute each other's signal.
export default function DuplicateWarning({ matches, onVerifyInstead }) {
  if (!matches.length) return null
  return (
    <div className="card p-4" style={{ borderColor: 'var(--accent)' }}>
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={18} style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Possible duplicate nearby</p>
          <p className="text-sm muted">
            {matches.length} similar report{matches.length > 1 ? 's' : ''} already exist{matches.length === 1 ? 's' : ''} within {Math.round(matches[matches.length - 1].distance)}m of this pin.
            Verifying an existing report gets it resolved faster than splitting attention across duplicates.
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {matches.slice(0, 3).map(({ report, distance }) => (
          <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
            <div className="min-w-0">
              <Link to={`/report/${report.id}`} target="_blank" rel="noreferrer" className="font-semibold hover:opacity-80">{report.title}</Link>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs muted">
                <span>{Math.round(distance)}m away</span>
                <CredibilityBadge report={report} />
              </div>
            </div>
            <button type="button" onClick={() => onVerifyInstead(report.id)} className="btn btn-primary shrink-0 !px-3 !py-1.5 !text-xs">
              <ThumbsUp size={13} /> Verify this
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
