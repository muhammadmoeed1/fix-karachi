import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, ThumbsUp, MapPin, User, ShieldCheck, ShieldX } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES, STATUSES, STATUS_ORDER, timeAgo } from '../services/constants.js'
import { trustTier } from '../services/credibility.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { CredibilityPanel } from '../components/Credibility.jsx'
import SeverityBadge from '../components/SeverityBadge.jsx'
import FlagButton from '../components/FlagButton.jsx'
import CommentThread from '../components/CommentThread.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function ReportDetail() {
  const { id } = useParams()
  const { reports, users, user, toggleVote, setAdminVerdict } = useApp()
  const report = reports.find((r) => r.id === id)
  const [confirmReject, setConfirmReject] = useState(false)

  if (!report) {
    return <div className="card p-10 text-center muted">Report not found. <Link to="/feed" className="font-bold" style={{ color: 'var(--primary)' }}>Back to feed</Link></div>
  }

  const cat = CATEGORIES[report.category] || {}
  const Icon = cat.Icon
  const isOwner = user && report.userId === user.id
  const voted = user && report.votes.includes(user.id)
  const reporter = users.find((u) => u.id === report.userId)
  const tier = reporter ? trustTier(reporter.trustScore) : null
  const pin = L.divIcon({
    className: '',
    html: `<div class="civic-pin" style="background:${cat.color}"><svg width="11" height="11" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/></svg></div>`,
    iconSize: [30, 30], iconAnchor: [15, 28],
  })

  return (
    <div className="fade-up mx-auto max-w-3xl">
      <Link to="/feed" className="inline-flex items-center gap-1.5 text-sm font-semibold muted hover:opacity-80"><ArrowLeft size={16} /> Back to feed</Link>

      {report.adminVerdict === 'rejected' && (
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl p-4 text-sm font-semibold" style={{ background: 'var(--danger-soft)', color: 'var(--danger-soft-text)' }}>
          <ShieldX size={18} /> This report was reviewed by a city admin and marked as not valid. It is hidden from the public feed and map.
        </div>
      )}

      <div className="card mt-3 overflow-hidden">
        {report.photo && <img src={report.photo} alt={report.title} className="h-64 w-full object-cover" />}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="soft-pill" style={{ background: cat.color + '18', color: cat.color }}>
              {Icon && <Icon size={13} strokeWidth={2.5} />} {cat.label}
            </span>
            <SeverityBadge severity={report.severity} />
            <StatusBadge status={report.status} />
          </div>

          <h1 className="mt-3 text-2xl font-extrabold">{report.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm muted">
            <span className="inline-flex items-center gap-1"><User size={14} /> {report.userName}</span>
            {tier && <span className="soft-pill !px-2 !py-0.5" style={{ background: tier.color + '18', color: tier.color }}>{tier.label}</span>}
            <span>· {timeAgo(report.createdAt)}</span>
            <span className="inline-flex items-center gap-1">· <MapPin size={14} /> {report.address || 'Pinned location'}</span>
          </div>

          <p className="mt-4 leading-relaxed">{report.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button onClick={() => user && toggleVote(report.id)} disabled={!user || isOwner}
              className={`btn ${voted ? 'btn-primary' : 'btn-outline'} disabled:opacity-50`}
              title={isOwner ? "You can't verify your own report" : undefined}>
              <ThumbsUp size={16} /> {voted ? 'Verified' : 'I have this issue too'} · {report.votes.length}
            </button>
            <FlagButton report={report} className="!py-2.5 !px-4 !text-sm" />

            {user?.role === 'admin' && !report.adminVerdict && (
              <>
                <button onClick={() => setAdminVerdict(report.id, 'verified')} className="btn btn-primary !py-2.5"><ShieldCheck size={16} /> Verify as genuine</button>
                <button onClick={() => setConfirmReject(true)} className="btn btn-danger !py-2.5"><ShieldX size={16} /> Reject as invalid</button>
              </>
            )}
          </div>

          {/* Credibility */}
          <div className="mt-6">
            <CredibilityPanel report={report} />
          </div>

          {/* Status timeline */}
          <div className="mt-8">
            <h2 className="mb-4 text-base font-bold">Progress</h2>
            <div className="flex items-center">
              {STATUS_ORDER.map((s, i) => {
                const done = report.statusHistory.some((h) => h.status === s)
                const SIcon = STATUSES[s].Icon
                return (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className="grid h-10 w-10 place-items-center rounded-full text-white transition"
                        style={{ background: done ? 'var(--primary)' : 'var(--surface-2)', color: done ? '#fff' : 'var(--muted)' }}>
                        <SIcon size={18} />
                      </div>
                      <span className="mt-1.5 text-xs font-semibold muted">{STATUSES[s].label}</span>
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className="mx-2 h-1 flex-1 rounded" style={{ background: done ? 'var(--primary)' : 'var(--border)' }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border">
            <MapContainer center={[report.lat, report.lng]} zoom={14} style={{ height: 240, width: '100%' }} scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <Marker position={[report.lat, report.lng]} icon={pin} />
            </MapContainer>
          </div>

          <CommentThread report={report} />
        </div>
      </div>

      <ConfirmModal
        open={confirmReject}
        title="Reject this report?"
        message={`"${report.title}" will be marked as not valid and hidden from the public feed. This also lowers ${report.userName}'s trust score, and can't be undone from here.`}
        confirmLabel="Reject report"
        danger
        onConfirm={() => { setAdminVerdict(report.id, 'rejected'); setConfirmReject(false) }}
        onCancel={() => setConfirmReject(false)}
      />
    </div>
  )
}
