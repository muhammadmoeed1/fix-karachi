import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Crosshair, ImagePlus, Check, ArrowRight, ArrowLeft, WifiOff } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { CATEGORIES, SEVERITY, SEVERITY_ORDER } from '../services/constants.js'
import { findNearbyReports } from '../services/credibility.js'
import DuplicateWarning from '../components/DuplicateWarning.jsx'

const KARACHI = [24.8607, 67.0011]
const STEPS = ['Category', 'Details', 'Location & submit']
const pin = L.divIcon({
  className: '',
  html: '<div class="civic-pin" style="background:var(--primary)"><svg width="11" height="11" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/></svg></div>',
  iconSize: [30, 30], iconAnchor: [15, 28],
})

function LocationPicker({ setPos }) {
  useMapEvents({ click: (e) => setPos([e.latlng.lat, e.latlng.lng]) })
  return null
}

export default function ReportIssue() {
  const { addReport, queueReport, reports, toggleVote, notify, isOnline } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ title: '', category: 'pothole', severity: 'medium', description: '', address: '' })
  const [photo, setPhoto] = useState(null)
  const [pos, setPos] = useState(KARACHI)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const duplicates = useMemo(
    () => findNearbyReports({ category: form.category, lat: pos[0], lng: pos[1] }, reports),
    [form.category, pos, reports],
  )

  const onPhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return setError('Please use a photo under 2MB (low-bandwidth friendly).')
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const useMyLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setLocating(false) },
      () => { setError('Could not get your location. Tap the map to drop a pin.'); setLocating(false) },
    )
  }

  const verifyInstead = (reportId) => {
    toggleVote(reportId)
    notify('Thanks — you verified the existing report instead of duplicating it.', 'success')
    navigate(`/report/${reportId}`)
  }

  const goNext = () => {
    setError('')
    if (step === 2) {
      if (!form.title.trim()) return setError('A short title is required.')
      if (form.description.trim().length < 10) return setError('Please add a little more detail (10+ characters).')
    }
    setStep((s) => Math.min(3, s + 1))
  }

  const submit = () => {
    const data = { ...form, photo, lat: pos[0], lng: pos[1] }
    if (!isOnline) {
      queueReport(data)
      notify("You're offline — this report is saved and will submit automatically once you're back online.", 'warn')
      navigate('/my-reports')
      return
    }
    const r = addReport(data)
    notify('Report submitted. Community verification helps it get resolved faster.', 'success')
    navigate(`/report/${r.id}`)
  }

  // A single stable button (same type, same position) drives both "Next" and
  // "Submit" — conditionally swapping a button's `type` at the same tree
  // position lets React reuse the DOM node mid-click, which can flip a plain
  // button into the form's implicit submit button before the click finishes.
  const handlePrimary = () => (step < 3 ? goNext() : submit())

  return (
    <div className="fade-up mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold">Report an issue</h1>
      <p className="mt-1 text-sm muted">Clear details and an accurate location help issues get resolved faster.</p>

      {!isOnline && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl p-3.5 text-sm font-semibold" style={{ background: 'var(--accent-soft)', color: 'var(--accent-soft-text)' }}>
          <WifiOff size={16} /> You're offline. You can still fill this out — it'll be saved and submitted automatically once you're back online.
        </div>
      )}

      {/* Stepper */}
      <div className="mt-6 flex items-center">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition"
                  style={{ background: done || active ? 'var(--primary)' : 'var(--surface-2)', color: done || active ? '#fff' : 'var(--muted)' }}
                >
                  {done ? <Check size={16} /> : n}
                </div>
                <span className="mt-1.5 hidden text-xs font-semibold muted sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-2 h-1 flex-1 rounded" style={{ background: done ? 'var(--primary)' : 'var(--border)' }} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handlePrimary() }} className="card mt-6 space-y-6 p-6">
        {step === 1 && (
          <div>
            <span className="mb-2 block text-sm font-semibold">What kind of issue is this?</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(CATEGORIES).map(([key, c]) => {
                const Icon = c.Icon
                const active = form.category === key
                return (
                  <button type="button" key={key} onClick={() => setForm({ ...form, category: key })} aria-pressed={active}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-semibold transition ${active ? 'text-white' : 'muted hover:bg-[var(--surface-2)]'}`}
                    style={active ? { background: c.color, borderColor: c.color } : { background: 'var(--surface-2)' }}>
                    <Icon size={20} /> {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div>
              <span className="mb-2 block text-sm font-semibold">How urgent is this?</span>
              <div className="grid grid-cols-4 gap-2">
                {SEVERITY_ORDER.map((key) => {
                  const s = SEVERITY[key]
                  const Icon = s.Icon
                  const active = form.severity === key
                  return (
                    <button type="button" key={key} onClick={() => setForm({ ...form, severity: key })} aria-pressed={active}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center text-xs font-semibold transition ${active ? 'text-white' : 'muted hover:bg-[var(--surface-2)]'}`}
                      style={active ? { background: s.color, borderColor: s.color } : { background: 'var(--surface-2)' }}>
                      <Icon size={16} /> {s.label}
                    </button>
                  )
                })}
              </div>
              <p className="mt-1.5 text-xs muted">{SEVERITY[form.severity].hint}</p>
            </div>
            <Field label="Title" name="title" value={form.title} onChange={handle} placeholder="e.g. Large pothole on Tariq Road" />
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Description</span>
              <textarea name="description" value={form.description} onChange={handle} rows={3}
                placeholder="Describe the issue — what, where, and why it matters." className="input" />
            </label>
            <Field label="Area / Address (optional)" name="address" value={form.address} onChange={handle} placeholder="e.g. Block 6, Gulshan-e-Iqbal" />
            <div>
              <span className="mb-1.5 block text-sm font-semibold">Photo (recommended — boosts credibility)</span>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm muted transition hover:bg-[var(--surface-2)]">
                <ImagePlus size={18} /> Choose an image
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
              </label>
              {photo && <img src={photo} alt="preview" className="mt-3 h-44 w-full rounded-xl object-cover" />}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Location <span className="muted font-normal">(tap the map)</span></span>
                <button type="button" onClick={useMyLocation} className="btn btn-outline !py-1.5 !px-3 !text-xs">
                  <Crosshair size={14} /> {locating ? 'Locating…' : 'Use my location'}
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border">
                <MapContainer center={pos} zoom={12} style={{ height: 260, width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <Marker position={pos} icon={pin} />
                  <LocationPicker setPos={setPos} />
                </MapContainer>
              </div>
              <p className="mt-1.5 text-xs muted">Pin: {pos[0].toFixed(4)}, {pos[1].toFixed(4)}</p>
            </div>

            <DuplicateWarning matches={duplicates} onVerifyInstead={verifyInstead} />
          </>
        )}

        {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}

        <div className="flex items-center justify-between gap-3 border-t pt-5">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-outline"><ArrowLeft size={16} /> Back</button>
          ) : <span />}
          <button type="button" onClick={handlePrimary} className="btn btn-primary">
            {step < 3 ? <>Next <ArrowRight size={16} /></> : 'Submit report'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      <input {...props} className="input" />
    </label>
  )
}
