import { COLOR_ESTADO } from '../data/estados.js'

export default function BadgeEstado({ estado }) {
  return (
    <span className="badge" style={{ '--c': COLOR_ESTADO[estado] ?? '#64748b' }}>
      {estado}
    </span>
  )
}
