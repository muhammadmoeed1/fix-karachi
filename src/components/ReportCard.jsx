import { Link } from 'react-router-dom'
import { ThumbsUp, MapPin, ArrowRight } from 'lucide-react'
import { CATEGORIES, timeAgo } from '../services/constants.js'
import StatusBadge from './StatusBadge.jsx'
import { CredibilityBadge } from './Credibility.jsx'
import SeverityBadge from './SeverityBadge.jsx'
import FlagButton from './FlagButton.jsx'
import { useApp } from '../context/AppContext.jsx'

// A single complaint card (used in Feed and My Reports).
export default function ReportCard({ report }) {
  const { user, toggleVote } = useApp()
  const cat = CATEGORIES[report.category] || {}
  const Icon = cat.Icon
  const voted = user && report.votes.includes(user.id)
  const isOwner = user && report.userId === user.id

  return (
    <article className="card fade-up flex flex-col overflow-hidden transition hover:-translate-y-0.5">
      {report.photo ? (
        <Link to={`/report/${report.id}`}>
          <img src={report.photo} alt={report.title} className="h-40 w-full object-cover" />
        </Link>
      ) : (
        <Link to={`/report/${report.id}`} className="flex h-24 items-center justify-center" style={{ background: cat.color + '12' }}>
          {Icon && <Icon size={32} strokeWidth={1.6} style={{ color: cat.color }} />}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="soft-pill" style={{ background: cat.color + '18', color: cat.color }}>
            {Icon && <Icon size={13} strokeWidth={2.5} />} {cat.label}
          </span>
          <StatusBadge status={report.status} />
        </div>

        <Link to={`/report/${report.id}`}>
          <h3 className="text-base font-bold leading-snug hover:opacity-80">{report.title}</h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm muted">{report.description}</p>

        <div className="mt-2 flex items-center gap-1.5 text-xs muted">
          <MapPin size={13} /> {report.address || 'Pinned location'} · {timeAgo(report.createdAt)}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <CredibilityBadge report={report} />
          <SeverityBadge severity={report.severity} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => user && toggleVote(report.id)}
              disabled={!user || isOwner}
              className={`btn ${voted ? 'btn-primary' : 'btn-outline'} !py-1.5 !px-3 !text-xs disabled:opacity-50`}
              title={isOwner ? "You can't verify your own report" : user ? 'Confirm you have this issue too' : 'Sign in to verify'}
            >
              <ThumbsUp size={14} /> {voted ? 'Verified' : 'Me too'} · {report.votes.length}
            </button>
            <FlagButton report={report} />
          </div>
          <Link to={`/report/${report.id}`} className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
            Details <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  )
}
