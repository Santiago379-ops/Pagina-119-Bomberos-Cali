import { useEffect, useMemo, useRef } from 'react'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono, crearIconoCluster } from './iconos.js'
import { GRUPOS, colorDeGrupo } from '../data/grupos.js'
import { ESTADOS, ESTADOS_INACTIVOS, COLOR_ESTADO } from '../data/estados.js'

const CENTRO_CALI = [3.437, -76.522]

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
// Props:
//   reportes: lista de reportes reales del estado global (ver ReportesContext)
//   seleccionadoId: id del reporte seleccionado (o null)
//   centrarKey: número que sube cada vez que el operador hace clic en la lista
//               (así el mapa se vuelve a centrar aunque ya estuviera seleccionado)
//   agrupar: si es true, los pines cercanos se agrupan en un círculo con el conteo
//   onSeleccionar: (id) => void
export default function MapaOperador({ reportes = [], seleccionadoId = null, centrarKey = 0, agrupar = true, onSeleccionar }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  return (
    <MapContainer center={CENTRO_CALI} zoom={13} style={{ width: '100%', height: '100%' }}>
      {/* Dos estilos de mapa: el operador los cambia con el control de la esquina */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Calles (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Oscuro (centro de control)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {/* Agrupación de reportes cercanos: al acercar el mapa los grupos se abren.
          A partir del zoom 17 ya no se agrupa, así el reporte seleccionado siempre se ve solo. */}
      <MarkerClusterGroup
        key={agrupar ? 'agrupado' : 'suelto'}
        chunkedLoading
        maxClusterRadius={agrupar ? 45 : 0}
        disableClusteringAtZoom={17}
        iconCreateFunction={crearIconoCluster}
        showCoverageOnHover={false}
      >
        {reportes.map((r) => (
          <PinReporte
            key={r.id}
            reporte={r}
            seleccionado={r.id === seleccionadoId}
            centrarKey={centrarKey}
            onSeleccionar={onSeleccionar}
          />
        ))}
      </MarkerClusterGroup>

      <IrAlSeleccionado reporte={seleccionado} centrarKey={centrarKey} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

// Un pin por reporte. Su apariencia depende del estado:
//   · Recibido            → "pin--pulso" (late para llamar la atención)
//   · Validado            → "pin--validado" (aro azul)
//   · Unidad despachada   → "pin--despachado" (aro morado que gira)
//   · Cerrado / Descartado → "pin--apagado" (gris y tenue)
// Además, el punto central del pin toma el color del estado.
function PinReporte({ reporte: r, seleccionado, centrarKey, onSeleccionar }) {
  const markerRef = useRef(null)

  const clases = ESTADOS_INACTIVOS.includes(r.estado)
    ? 'pin--apagado'
    : r.estado === ESTADOS.RECIBIDO
      ? 'pin--pulso'
      : r.estado === ESTADOS.VALIDADO
        ? 'pin--validado'
        : r.estado === ESTADOS.DESPACHADO
          ? 'pin--despachado'
          : ''

  // El ícono solo se vuelve a crear cuando cambia algo visible (así el pulso no se reinicia).
  const icono = useMemo(
    () => crearIcono(colorDeGrupo(r.grupo), { seleccionado, clases, colorEstado: COLOR_ESTADO[r.estado] }),
    [r.grupo, seleccionado, clases, r.estado],
  )

  // Al seleccionar desde la lista, abrir el popup cuando termina el vuelo.
  useEffect(() => {
    if (!seleccionado) return
    const t = setTimeout(() => markerRef.current?.openPopup(), 900)
    return () => clearTimeout(t)
  }, [seleccionado, centrarKey])

  const grupo = GRUPOS.find((g) => g.codigo === r.grupo)

  return (
    <Marker
      ref={markerRef}
      position={[r.lat, r.lng]}
      icon={icono}
      eventHandlers={{ click: () => onSeleccionar?.(r.id) }}
    >
      <Popup>
        <div className="popup">
          <div className="popup__grupo" style={{ color: colorDeGrupo(r.grupo) }}>
            {r.grupo} · {grupo?.nombre}
          </div>
          <div><strong>{r.nombres} {r.apellidos}</strong></div>
          <div>{r.queVe}</div>
          <div className="popup__pie">
            {r.barrio} · <strong>{r.estado}</strong>
            {r.unidad ? ` · ${r.unidad}` : ''}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él.
function IrAlSeleccionado({ reporte, centrarKey }) {
  const map = useMap()
  const id = reporte?.id
  const lat = reporte?.lat
  const lng = reporte?.lng
  useEffect(() => {
    if (id != null) map.flyTo([lat, lng], 17, { duration: 0.8 })
  }, [id, lat, lng, centrarKey, map])
  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo.
function Leyenda({ reportes }) {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leyenda">
        <div style={{ fontWeight: 700, marginBottom: 6 }}>REPORTES · {reportes.length}</div>
        {GRUPOS.map((g) => {
          const n = reportes.filter((r) => r.grupo === g.codigo).length
          return (
            <div key={g.codigo} className="leyenda__fila" style={{ opacity: n ? 1 : 0.45 }}>
              <span className="leyenda__punto" style={{ background: g.color }} />
              <span style={{ width: 28, color: '#94a3b8' }}>{g.codigo}</span>
              <span style={{ flex: 1 }}>{g.nombre}</span>
              <strong>{n}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}
