import { useState } from 'react'
import { Send, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { timeAgo } from '../services/constants.js'

// Lightweight discussion thread on a report — lets neighbours add
// corroborating (or contradicting) detail, and lets admins post updates
// without having to change the pipeline status.
export default function CommentThread({ report }) {
  const { user, addComment } = useApp()
  const [text, setText] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    addComment(report.id, text.trim())
    setText('')
  }

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-base font-bold">Discussion ({report.comments?.length || 0})</h2>
      <div className="space-y-4">
        {(report.comments || []).map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ background: c.role === 'admin' ? 'var(--accent)' : 'var(--primary)' }}>
              {c.userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-bold">{c.userName}</span>
                {c.role === 'admin' && <span className="accent-pill !px-1.5 !py-0.5"><ShieldCheck size={11} /> City Admin</span>}
                <span className="text-xs muted">· {timeAgo(c.at)}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
        {(!report.comments || report.comments.length === 0) && (
          <p className="text-sm muted">No comments yet — be the first to add useful detail.</p>
        )}
      </div>

      {user ? (
        <form onSubmit={submit} className="mt-4 flex items-start gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a helpful detail or update…" className="input flex-1" />
          <button className="btn btn-primary !px-3.5"><Send size={15} /></button>
        </form>
      ) : (
        <p className="mt-4 text-sm muted">Sign in to join the discussion.</p>
      )}
    </div>
  )
}
