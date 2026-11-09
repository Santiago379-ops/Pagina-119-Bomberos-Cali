import Icono from './Icono.jsx'
import { ESTADOS } from '../data/estados.js'

// Línea de pasos del reporte: Recibido → Validado → Unidad despachada → Cerrado.
// Si el caso se descarta, el último paso se reemplaza por «Descartado».
const PASOS = [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO]

export default function Seguimiento({ estado, oscuro = false }) {
  const descartado = estado === ESTADOS.DESCARTADO
  const actual = descartado ? 0 : PASOS.indexOf(estado)
  const pasos = descartado ? [ESTADOS.RECIBIDO, ESTADOS.DESCARTADO] : PASOS

  return (
    <ol className={`seguimiento ${oscuro ? 'seguimiento--oscuro' : ''}`} aria-label={`Estado del reporte: ${estado}`}>
      {pasos.map((nombre, i) => {
        const hecho = descartado ? i === 0 : i < actual
        const activo = descartado ? i === 1 : i === actual
        return (
          <li
            key={nombre}
            className={`seguimiento__paso ${hecho ? 'is-hecho' : ''} ${activo ? 'is-activo' : ''} ${descartado && i === 1 ? 'is-descartado' : ''}`}
            aria-current={activo ? 'step' : undefined}
          >
            <span className="seguimiento__marca">{hecho ? <Icono nombre="check" tam={14} /> : i + 1}</span>
            <span className="seguimiento__texto">{nombre}</span>
          </li>
        )
      })}
    </ol>
  )
}
