import { useState } from 'react'
import { Flag } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import ConfirmModal from './ConfirmModal.jsx'

// Community moderation — flagging is how citizens push a suspicious
// report into the admin's Needs Review queue (see setAdminVerdict / toggleFlag).
export default function FlagButton({ report, className = '' }) {
  const { user, toggleFlag } = useApp()
  const [open, setOpen] = useState(false)
  if (!user || user.id === report.userId) return null
  const flagged = report.flags.includes(user.id)

  return (
    <>
      <button
        onClick={() => (flagged ? toggleFlag(report.id) : setOpen(true))}
        title={flagged ? 'Remove flag' : 'Flag as false or spam'}
        className={`btn !px-2.5 !py-1.5 !text-xs ${flagged ? 'btn-danger' : 'btn-outline'} ${className}`}
      >
        <Flag size={13} /> {flagged ? 'Flagged' : 'Flag'}
      </button>
      <ConfirmModal
        open={open}
        title="Flag this report?"
        message="Flag it only if you believe it's false, spam, or a duplicate. Enough flags send it straight to city admins for review."
        confirmLabel="Flag report"
        danger
        onConfirm={() => { toggleFlag(report.id); setOpen(false) }}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
