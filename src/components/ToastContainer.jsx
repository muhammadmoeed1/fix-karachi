import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'

const ICONS = { success: CheckCircle2, warn: AlertTriangle, info: Info }
const COLORS = { success: 'var(--primary)', warn: 'var(--accent)', info: 'var(--primary)' }

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null

  return (
    <div className="fixed right-4 top-[76px] z-[3000] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info
        return (
          <div key={t.id} className="toast-in card flex items-start gap-2.5 p-3.5 pr-2.5">
            <Icon size={18} style={{ color: COLORS[t.type] || COLORS.info }} className="mt-0.5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="btn btn-ghost !p-1"><X size={14} /></button>
          </div>
        )
      })}
    </div>
  )
}
