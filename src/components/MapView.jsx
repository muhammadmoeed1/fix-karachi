import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../services/constants.js'

const KARACHI = [24.8607, 67.0011]

// Clean colored teardrop pin (no emoji) with a white center dot.
function makePin(category) {
  const color = (CATEGORIES[category] || {}).color || '#4f46e5'
  return L.divIcon({
    className: '',
    html: `<div class="civic-pin" style="background:${color}"><svg width="11" height="11" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#ffffff"/></svg></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  })
}

function HeatLayer({ points, show }) {
  const map = useMap()
  useEffect(() => {
    if (!show) return
    const layer = L.heatLayer(points, { radius: 38, blur: 28, maxZoom: 14 }).addTo(map)
    return () => map.removeLayer(layer)
  }, [map, points, show])
  return null
}

export default function MapView({ reports, heatmap = false, height = 460 }) {
  const heatPoints = reports.map((r) => [r.lat, r.lng, 0.6 + r.votes.length * 0.2])

  return (
    <MapContainer center={KARACHI} zoom={12} style={{ height, width: '100%' }} scrollWheelZoom>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatLayer points={heatPoints} show={heatmap} />
      {!heatmap &&
        reports.map((r) => (
          <Marker key={r.id} position={[r.lat, r.lng]} icon={makePin(r.category)}>
            <Popup>
              <strong>{r.title}</strong>
              <br />
              {CATEGORIES[r.category]?.label}
              <br />
              <Link to={`/report/${r.id}`} style={{ color: '#4f46e5', fontWeight: 700 }}>
                View details
              </Link>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  )
}
