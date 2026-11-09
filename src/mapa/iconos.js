import L from 'leaflet'

// Crea el ícono (pin) de un reporte con el color de su grupo.
// Usa HTML + CSS (clases en mapa.css), así no hace falta ninguna imagen.
//   colorEstado: color del punto central; cambia con el estado del reporte.
export function crearIcono(color, { seleccionado = false, clases = '', colorEstado = '#ffffff' } = {}) {
  const tam = seleccionado ? 34 : 26
  return L.divIcon({
    className: '', // quita el estilo por defecto de Leaflet
    html: `<div class="pin ${seleccionado ? 'pin--seleccionado' : ''} ${clases}" style="--color:${color}; --estado:${colorEstado}; width:${tam}px; height:${tam}px"></div>`,
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam], // la punta del pin queda sobre la coordenada
    popupAnchor: [0, -tam],
  })
}

// Ícono de un grupo de reportes cercanos (cluster): círculo con el conteo.
export function crearIconoCluster(cluster) {
  const n = cluster.getChildCount()
  const tam = n < 10 ? 38 : n < 50 ? 46 : 54
  return L.divIcon({
    className: '',
    html: `<div class="cluster" style="width:${tam}px;height:${tam}px"><span>${n}</span></div>`,
    iconSize: [tam, tam],
  })
}
