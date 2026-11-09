import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ESTADOS } from '../data/estados.js'
import { BARRIOS } from '../data/barrios.js'
import { GRUPOS } from '../data/grupos.js'

// ─────────────────────────────────────────────────────────────
// Estado global de la app: la lista de reportes.
//   · /reportar agrega reportes (crearReporte)
//   · /operador los lee y cambia su estado (validar, despachar…)
//   · todo se guarda en localStorage y se sincroniza entre pestañas
//     con el evento "storage".
// Las fotos se previsualizan con URL.createObjectURL; al enviar, una copia
// reducida (data URL) se guarda en localStorage para que el operador la vea
// en cualquier pestaña. Los videos pesan demasiado: viven solo en memoria.
// ─────────────────────────────────────────────────────────────

const CLAVE = 'bomberos119.reportes.v1'
const CLAVE_ULTIMO = 'bomberos119.ultimo.v1'

const ReportesContext = createContext(null)

function leerStorage() {
  try {
    const crudo = localStorage.getItem(CLAVE)
    const lista = crudo ? JSON.parse(crudo) : []
    return Array.isArray(lista) ? lista.map((r) => ({ ...r, fotos: r.fotos ?? [] })) : []
  } catch {
    return []
  }
}

// Al guardar: solo las imágenes que ya son data URL (no objectURL ni videos).
const paraGuardar = (r) => ({
  ...r,
  fotos: (r.fotos ?? []).filter((f) => f.tipo === 'imagen' && f.url.startsWith('data:')),
})

// Aplica `fn` solo al reporte con ese id.
const actualizar = (lista, id, fn) => lista.map((r) => (r.id === id ? fn(r) : r))
const conHistorial = (r, estado, hora, extra = {}) => ({
  ...r,
  ...extra,
  estado,
  historial: [...r.historial, { estado, hora }],
})

// El reducer es la única puerta para cambiar un reporte, así las reglas del
// flujo (p. ej. "no se despacha sin validar") no dependen de la interfaz.
function reducer(state, a) {
  switch (a.type) {
    case 'CARGAR': // llegó un cambio desde otra pestaña: conservar lo local (incluye videos)
      return a.reportes.map((r) => {
        const local = state.find((x) => x.id === r.id)?.fotos
        return { ...r, fotos: local?.length ? local : r.fotos }
      })
    case 'CREAR':
      return [a.reporte, ...state]
    case 'SIMULAR':
      return [...a.reportes, ...state]
    case 'LIMPIAR':
      return []
    case 'VALIDAR':
      return actualizar(state, a.id, (r) =>
        r.estado !== ESTADOS.RECIBIDO
          ? r
          : conHistorial(r, ESTADOS.VALIDADO, a.hora, { grupo: a.grupo ?? r.grupo }),
      )
    case 'DESCARTAR':
      return actualizar(state, a.id, (r) =>
        r.estado !== ESTADOS.RECIBIDO
          ? r
          : conHistorial(r, ESTADOS.DESCARTADO, a.hora, { motivoDescarte: a.motivo }),
      )
    case 'DESPACHAR': // solo casos Validados
      return actualizar(state, a.id, (r) =>
        r.estado !== ESTADOS.VALIDADO || !a.unidad
          ? r
          : conHistorial(r, ESTADOS.DESPACHADO, a.hora, { unidad: a.unidad }),
      )
    case 'CERRAR':
      return actualizar(state, a.id, (r) =>
        r.estado !== ESTADOS.DESPACHADO ? r : conHistorial(r, ESTADOS.CERRADO, a.hora),
      )
    case 'SOLICITAR_INFO':
      return actualizar(state, a.id, (r) =>
        r.estado === ESTADOS.CERRADO || r.estado === ESTADOS.DESCARTADO
          ? r
          : { ...r, solicitud: { mensaje: a.mensaje, hora: a.hora } },
      )
    case 'RESPONDER_INFO':
      return actualizar(state, a.id, (r) => ({ ...r, solicitud: null }))
    default:
      return state
  }
}

export function ReportesProvider({ children }) {
  const [reportes, dispatch] = useReducer(reducer, null, leerStorage)
  const [ultimoId, setUltimoId] = useState(() => Number(localStorage.getItem(CLAVE_ULTIMO)) || null)
  const ref = useRef(reportes)
  ref.current = reportes

  // Guardar en localStorage cada vez que cambia la lista.
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(reportes.map(paraGuardar)))
    } catch {
      /* cuota llena o modo privado: la app sigue funcionando en memoria */
    }
  }, [reportes])

  useEffect(() => {
    try {
      if (ultimoId) localStorage.setItem(CLAVE_ULTIMO, String(ultimoId))
      else localStorage.removeItem(CLAVE_ULTIMO)
    } catch { /* ignorar */ }
  }, [ultimoId])

  // Extra: sincronizar pestañas (ciudadano en una, operador en otra).
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === CLAVE) dispatch({ type: 'CARGAR', reportes: leerStorage() })
      if (e.key === CLAVE_ULTIMO) setUltimoId(Number(e.newValue) || null)
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const ahora = () => new Date().toISOString()
  const siguienteId = () => ref.current.reduce((m, r) => Math.max(m, r.id), 0) + 1

  const acciones = useMemo(
    () => ({
      // `datos` ya viene validado desde el formulario.
      crearReporte(datos) {
        const id = siguienteId()
        const hora = ahora()
        const reporte = {
          ...datos,
          id,
          radicado: radicadoDe(id, hora),
          creadoEn: hora,
          grupoOriginal: datos.grupo,
          estado: ESTADOS.RECIBIDO,
          unidad: null,
          solicitud: null,
          historial: [{ estado: ESTADOS.RECIBIDO, hora }],
        }
        dispatch({ type: 'CREAR', reporte })
        setUltimoId(id)
        return reporte
      },
      validar: (id, grupo) => dispatch({ type: 'VALIDAR', id, grupo, hora: ahora() }),
      descartar: (id, motivo) => dispatch({ type: 'DESCARTAR', id, motivo, hora: ahora() }),
      despachar: (id, unidad) => dispatch({ type: 'DESPACHAR', id, unidad, hora: ahora() }),
      cerrar: (id) => dispatch({ type: 'CERRAR', id, hora: ahora() }),
      solicitarInfo: (id, mensaje) => dispatch({ type: 'SOLICITAR_INFO', id, mensaje, hora: ahora() }),
      limpiarSolicitud: (id) => dispatch({ type: 'RESPONDER_INFO', id }),
      nuevoReporte: () => setUltimoId(null),
      // Extra "emergencia masiva": 50 reportes ficticios.
      simular(cantidad = 50) {
        const base = siguienteId()
        const lista = Array.from({ length: cantidad }, (_, i) => reporteSimulado(base + i))
        dispatch({ type: 'SIMULAR', reportes: lista.reverse() })
      },
      limpiarTodo() {
        dispatch({ type: 'LIMPIAR' })
        setUltimoId(null)
      },
    }),
    [],
  )

  const valor = useMemo(() => ({ reportes, ultimoId, ...acciones }), [reportes, ultimoId, acciones])
  return <ReportesContext.Provider value={valor}>{children}</ReportesContext.Provider>
}

export function useReportes() {
  const ctx = useContext(ReportesContext)
  if (!ctx) throw new Error('useReportes debe usarse dentro de <ReportesProvider>')
  return ctx
}

// ── utilidades ───────────────────────────────────────────────

const radicadoDe = (id, iso) => `B119-${new Date(iso).getFullYear()}-${String(id).padStart(5, '0')}`

// Desplazamiento pequeño (~100 m) para que dos reportes del mismo barrio no
// queden exactamente encima en el mapa.
const jitter = () => (Math.random() - 0.5) * 0.0018

export function ubicacionDeBarrio(nombreBarrio) {
  const b = BARRIOS.find((x) => x.nombre === nombreBarrio)
  return b ? { lat: b.lat + jitter(), lng: b.lng + jitter() } : null
}

const NOMBRES = ['Ana', 'Luis', 'Marta', 'Carlos', 'Sofía', 'Andrés', 'Paula', 'Jorge', 'Camila', 'Diego']
const APELLIDOS = ['Prueba', 'Ficticio', 'Simulado', 'Demo', 'Ejemplo']
const QUE_VE = {
  100: 'Humo y llamas visibles (simulación)',
  200: 'Se escuchó una explosión fuerte (simulación)',
  300: 'Accidente con personas atrapadas (simulación)',
  400: 'Olor fuerte a gas (simulación)',
  500: 'Solicitud de servicio (simulación)',
  800: 'Inundación en la vía (simulación)',
  900: 'Situación extraña sin clasificar (simulación)',
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function reporteSimulado(id) {
  const grupo = pick(GRUPOS).codigo
  const barrio = pick(BARRIOS)
  const hora = new Date(Date.now() - Math.floor(Math.random() * 25 * 60000)).toISOString()
  const estado = pick([ESTADOS.RECIBIDO, ESTADOS.RECIBIDO, ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO])
  return {
    id,
    radicado: radicadoDe(id, hora),
    creadoEn: hora,
    nombres: pick(NOMBRES),
    apellidos: pick(APELLIDOS),
    telefono: `300${String(1000000 + id).slice(-7)}`, // ficticio
    grupo,
    grupoOriginal: grupo,
    queVe: QUE_VE[grupo],
    direccion: `Calle ${10 + (id % 40)} # ${id % 90}-${id % 50}`,
    barrio: barrio.nombre,
    referencia: 'Punto de referencia simulado',
    edificio: 'No aplica',
    lat: barrio.lat + (Math.random() - 0.5) * 0.012,
    lng: barrio.lng + (Math.random() - 0.5) * 0.012,
    fotos: [],
    estado,
    unidad: estado === ESTADOS.DESPACHADO || estado === ESTADOS.CERRADO ? pick(['Máquina', 'Rescate', 'Ambulancia', 'HazMat']) : null,
    solicitud: null,
    extra300: null,
    simulado: true,
    historial: [{ estado: ESTADOS.RECIBIDO, hora }],
  }
}
