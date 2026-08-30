import { useState } from 'react'
import { MapPin, Flame } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import MapView from '../components/MapView.jsx'
import { CATEGORIES } from '../services/constants.js'

export default function MapPage() {
  const { publicReports } = useApp()
  const [heatmap, setHeatmap] = useState(false)

  return (
    <div className="fade-up">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Live map</h1>
          <p className="text-sm muted">Every reported issue across the city, at a glance.</p>
        </div>
        <div className="flex gap-1.5 rounded-xl border p-1" style={{ background: 'var(--surface)' }}>
          <button onClick={() => setHeatmap(false)} className={`btn !py-2 !px-3 !text-xs ${!heatmap ? 'btn-primary' : 'btn-ghost'}`}><MapPin size={15} /> Pins</button>
          <button onClick={() => setHeatmap(true)} className={`btn !py-2 !px-3 !text-xs ${heatmap ? 'btn-primary' : 'btn-ghost'}`}><Flame size={15} /> Heatmap</button>
        </div>
      </div>

      <div className="card overflow-hidden p-1.5">
        <MapView reports={publicReports} heatmap={heatmap} height={520} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(CATEGORIES).map(([k, c]) => {
          const Icon = c.Icon
          return (
            <span key={k} className="chip">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              <Icon size={14} /> {c.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
