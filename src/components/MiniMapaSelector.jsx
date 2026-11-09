import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { crearIcono } from '../mapa/iconos.js'
import '../mapa/mapa.css'
import { BARRIOS } from '../data/barrios.js'

// Extra: mini mapa para tocar el punto exacto de la emergencia (useMapEvents).
function Clics({ onElegir }) {
  useMapEvents({ click: (e) => onElegir({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// Cuando se elige un barrio, el mini mapa se centra en él.
function IrAlBarrio({ barrio }) {
  const map = useMap()
  useEffect(() => {
    const b = BARRIOS.find((x) => x.nombre === barrio)
    if (b) map.flyTo([b.lat, b.lng], 15, { duration: 0.6 })
  }, [barrio, map])
  return null
}

export default function MiniMapaSelector({ barrio, punto, onElegir, color = '#dc2626' }) {
  return (
    <div className="minimapa">
      <MapContainer center={[3.437, -76.522]} zoom={12} style={{ height: 220, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <IrAlBarrio barrio={barrio} />
        <Clics onElegir={onElegir} />
        {punto && <Marker position={[punto.lat, punto.lng]} icon={crearIcono(color)} />}
      </MapContainer>
      <small className="campo__ayuda">
        {punto
          ? `Punto exacto marcado (${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}). Toca otro lugar para moverlo.`
          : 'Opcional: toca el mapa para marcar el punto exacto. Si no, se usará el centro del barrio.'}
      </small>
    </div>
  )
}
