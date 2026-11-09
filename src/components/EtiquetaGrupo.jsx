import { GRUPOS, colorDeGrupo } from '../data/grupos.js'

// Punto de color + código (+ nombre opcional) de un grupo de emergencia.
export default function EtiquetaGrupo({ codigo, conNombre = false }) {
  const g = GRUPOS.find((x) => x.codigo === codigo)
  return (
    <span className="etiqueta-grupo">
      <span className="etiqueta-grupo__punto" style={{ background: colorDeGrupo(codigo) }} />
      <strong>{codigo}</strong>
      {conNombre && <span> {g?.nombre}</span>}
    </span>
  )
}
