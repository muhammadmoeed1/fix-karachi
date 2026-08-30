import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// Small reusable confirmation dialog — used before destructive/social
// actions like flagging a report, so nobody flags by accident.
export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  const previouslyFocused = useRef(null)
  // Kept in a ref (not an effect dep) so the keydown listener always calls
  // the latest onCancel without tearing down and re-focusing on every
  // parent re-render — onCancel is usually a fresh inline function per render.
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement
    cancelRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onCancelRef.current(); return }
      if (e.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus?.()
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center p-4" style={{ background: 'rgba(8,15,13,.55)' }} onClick={onCancel}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" className="card pop-in w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 id="confirm-modal-title" className="text-lg font-bold">{title}</h3>
          <button onClick={onCancel} aria-label="Close" className="btn btn-ghost !p-1.5"><X size={16} /></button>
        </div>
        <p className="mt-2 text-sm muted">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} className="btn btn-outline">Cancel</button>
          <button onClick={onConfirm} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
