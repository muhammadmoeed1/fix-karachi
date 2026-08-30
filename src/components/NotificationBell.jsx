import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../services/constants.js'

// In-app notification center — status changes, admin verdicts, flag
// alerts, and comments all land here for the relevant user.
export default function NotificationBell() {
  const { notifications, markNotificationsRead } = useApp()
  const [open, setOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => { const next = !open; setOpen(next); if (next) markNotificationsRead() }}
        className="btn btn-ghost relative !px-2.5" title="Notifications"
        aria-label="Notifications" aria-haspopup="true" aria-expanded={open}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--danger)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[1900]" onClick={() => setOpen(false)} />
          <div className="pop-in card fixed right-4 top-16 z-[1901] max-h-96 w-[min(320px,calc(100vw-2rem))] overflow-y-auto p-2">
            <p className="px-2 py-1.5 text-xs font-bold uppercase tracking-wide muted">Notifications</p>
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm muted">You're all caught up.</p>
            ) : (
              notifications.slice(0, 15).map((n) => (
                <Link
                  key={n.id} to={n.reportId ? `/report/${n.reportId}` : '#'} onClick={() => setOpen(false)}
                  className={`block rounded-xl px-3 py-2.5 text-sm transition hover:bg-[var(--surface-2)] ${!n.read ? 'font-semibold' : ''}`}
                >
                  {n.message}
                  <div className="mt-0.5 text-xs muted">{timeAgo(n.at)}</div>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
